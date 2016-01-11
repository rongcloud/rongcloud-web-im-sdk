var tool = require('../tool');
var shim = require('./shim');
var bridge = require('../core/bridge');
var mapping = require('../mapping');
var messageParser = require('../core/messageParser');
var listenerList = [];
var conversationList = new shim.list();
var sessionStore = shim.sessionStore;
var bridgeInstance = null;
var self = null;
var C2S = shim.C2S;
var LimitableMap = shim.LimitableMap;
//历史消息映射，key为会话类型，value为服务器的topic
var HistoryMsgType = {
    "4": "qryPMsg",
    "1": "qryCMsg",
    "3": "qryGMsg",
    "2": "qryDMsg",
    "5": "qrySMsg"
}; //缓存拉取历史消息的时间戳，
var lastReadTime = new LimitableMap();
//sdk外部逻辑核心类
function RongIMClient(_appkey) {
    this.appkey = _appkey;
    self = this;
}
RongIMClient.prototype.clearTextMessageDraft = function (c, e) {
    return sessionStore.removeItem(c + "_" + e)
};
//得到草稿
RongIMClient.prototype.getTextMessageDraft = function (c, d) {
    return sessionStore.getItem(c + "_" + d)
};
//保存草稿
RongIMClient.prototype.saveTextMessageDraft = function (d, e, c) {
    return sessionStore.setItem(d + "_" + e, c)
};
////得到io通道对象
RongIMClient.prototype.getIO = function () {
    return bridgeInstance.context.channel;
};
//连接服务器
RongIMClient.prototype.connect = function (c, e) {
    bridgeInstance = new bridge(this.appkey, c, e);
    for (var d = 0; d < listenerList.length; d++) {
        bridgeInstance['setListener'](listenerList[d])
    }
    listenerList = [];
};
//断开连接
RongIMClient.prototype.disconnect = function () {
    if (bridgeInstance) {
        bridgeInstance.disConnect()
    }
};
//重连操作
RongIMClient.prototype.reconnect = function (callback) {
    if (bridgeInstance) {
        bridgeInstance.reConnect(callback);
    }
};
//同步会话列表
RongIMClient.prototype.syncConversationList = function (callback) {
    var modules = new Modules.RelationsInput();
    modules.setType(1);
    bridgeInstance.queryMsg(26, tool.arrayFrom(modules.toArrayBuffer()), mapping.userId, {
        onSuccess: function (list) {
            tool.forEach(list.info, function (x) {
                var val = self.createConversation(RongIMClient.ConversationType.setValue(mapping.mapping[x.type]), x.userId, '', true);
                if (x.type == 1) {
                    self.getUserInfo(x.userId, {
                        onSuccess: function (info) {
                            if (info.getUserName) {
                                val.setConversationTitle(info.getUserName());
                                val.setConversationPortrait(info.getPortraitUri());
                            }
                        },
                        onError: function () {
                        }
                    })
                }
            });
            callback.onSuccess();
        },
        onError: function () {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    }, "RelationsOutput");
};
//得到具体会话
RongIMClient.prototype.getConversation = function (c, e) {
    return this.getConversationList().get(c, e);
};
//得到会话列表
RongIMClient.prototype.getConversationList = function () {
    return conversationList;
};
//得到会话通知状态
RongIMClient.prototype.getConversationNotificationStatus = function (f, d, e) {
    var c = this.getConversation(f, d);
    if (c) {
        e.onSuccess(c.getNotificationStatus())
    } else {
        e.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR)
    }
};
//清空指定会话类型的会话
RongIMClient.prototype.clearConversations = function (list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < conversationList.length; j++) {
            conversationList[j].getConversationType() == list[i] && arr.push(j);
        }
    }
    for (i = 0; i < arr.length; i++) {
        var val = conversationList[arr[i] - i];
        this.removeConversation(val.getConversationType(), val.getTargetId());
    }
};
//得到会话类型为group的会话
RongIMClient.prototype.getGroupConversationList = function () {
    var arr = [];
    for (var i = 0, item; item = this.getConversationList()[i++];) {
        if (item.getConversationType() == 3) {
            arr.push(item);
        }
    }
    return arr;
};
//移除指定会话
RongIMClient.prototype.removeConversation = function (c, e) {
    var d = tool.remove(this.getConversationList(), function (f) {
        return f.getTargetId() == e && f.getConversationType() == c
    });
    if (!d)
        return;
    //删除服务器上存储的会话
    var mod = new Modules.RelationInfo();
    mod.setType(C2S[c.valueOf()]);
    mod.setUserId(e);
    bridgeInstance.queryMsg(27, tool.arrayFrom(mod.toArrayBuffer()), e, {
        onSuccess: function () {
        }, onError: function () {
        }
    });
};
//设置指定会话通知状态
RongIMClient.prototype.setConversationNotificationStatus = function (f, d, g, e) {
    var c = this.getConversation(f, d);
    if (c) {
        c.setNotificationStatus(g);
        e.onSuccess(g)
    } else {
        e.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR)
    }
};
//将指定会话设置为列表第一个
RongIMClient.prototype.setConversationToTop = function (c, e) {
    this.getConversation(c, e).setTop()
};
//设置会话名称
RongIMClient.prototype.setConversationName = function (f, e, d) {
    this.getConversation(f, e).setConversationTitle(d)
};
//创建一个会话
RongIMClient.prototype.createConversation = function (f, d, e, islocal) {
    var g = this.getConversationList().get(f, d);
    if (g) {
        return g
    }
    var c = new RongIMClient.Conversation();
    c.setTargetId(d);
    c.setConversationType(f);
    c.setConversationTitle(e);
    c.setTop();
    if (/^[1234]$/.test(f.valueOf()) && !islocal) {
        //如果会话类型为1、2、3、4并且不仅是操作本地的会话列表，就把该会话同步到服务器
        var mod = new Modules.RelationsInput();
        mod.setType(C2S[f.valueOf()]);
        bridgeInstance.queryMsg(25, tool.arrayFrom(mod.toArrayBuffer()), d, {
            onSuccess: function () {
            }, onError: function () {
            }
        });
    }
    return c
};
//得到当前登陆人员信息
RongIMClient.prototype.getCurrentUserInfo = function (callback) {
    this.getUserInfo(mapping.userId, callback);
};
//得到执行人员信息
RongIMClient.prototype.getUserInfo = function (c, e) {
    var d = new Modules.GetUserInfoInput();
    d.setNothing(1);
    bridgeInstance.queryMsg(5, tool.arrayFrom(d.toArrayBuffer()), c, e, "GetUserInfoOutput")
};
//发送消息
RongIMClient.prototype.sendMessage = function (h, v, e, c, u) {
    if (!bridgeInstance.context.channel.isWritable() || h == 5) {
        //如果连接不可用，或者会话类型为5(system)主动抛出错误
        u.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        return;
    }
    //进行RongIMClient.MessageContent操作
    if (!(e instanceof RongIMClient.MessageContent)) {
        e = new RongIMClient.MessageContent(e);
    }
    if (c) {
        c.process(e.getMessage())
    }
    //pb处理后的消息对象
    var g = e.encode(),
    //发送的消息对象
        i = e.getMessage(),
        j;
    i.setConversationType(h);
    i.setMessageDirection(RongIMClient.MessageDirection.SEND);
    if (!i.getMessageId())
        i.setMessageId(h + "_" + ~~(Math.random() * 0xffffff));
    i.setSentStatus(RongIMClient.SentStatus.SENDING);
    i.setSenderUserId(mapping.userId);
    i.setSentTime((new Date).getTime());
    i.setTargetId(v);
    if (/ISCOUNTED/.test(i.getMessageTag())) {
        j = this.getConversationList().get(h, v);
        if (!j) {
            j = this.createConversation(h, v, "");
        }
        j.setSentTime((new Date).getTime());
        j.setSentStatus(RongIMClient.SentStatus.SENDING);
        j.setSenderUserName("");
        j.setSenderUserId(mapping.userId);
        j.setObjectName(i.getObjectName());
        j.setNotificationStatus(RongIMClient.ConversationNotificationStatus.DO_NOT_DISTURB);
        j.setLatestMessageId(i.getMessageId());
        j.setLatestMessage(e.getMessage());
        j.setUnreadMessageCount(0);
        j.setTop();
    }
    bridgeInstance.pubMsg(h.valueOf(), g, v, u, i)
};
//上传文件
RongIMClient.prototype.uploadMedia = function (f, c, d, e) {
};
//得到七牛token
RongIMClient.prototype.getUploadToken = function (c) {
    var d = new Modules.GetQNupTokenInput();
    d.setType(1);
    bridgeInstance.queryMsg(14, tool.arrayFrom(d.toArrayBuffer()), mapping.userId, c, "GetQNupTokenOutput")
};
//得到下载地址
RongIMClient.prototype.getDownloadUrl = function (d, c) {
    var e = new Modules.GetQNdownloadUrlInput();
    e.setType(1);
    e.setKey(d);
    bridgeInstance.queryMsg(14, tool.arrayFrom(e.toArrayBuffer()), mapping.userId, c, "GetQNdownloadUrlOutput")
};
//设置连接状态监听器
RongIMClient.prototype.setConnectionStatusListener = function (c) {
    if (bridgeInstance) {
        bridgeInstance.setListener(c);
    } else {
        listenerList.push(c)
    }
};
//设置消息监听器
RongIMClient.prototype.setOnReceiveMessageListener = function (c) {
    if (bridgeInstance) {
        bridgeInstance.setListener(c)
    } else {
        listenerList.push(c)
    }
};
//得到所有未读消息数
RongIMClient.prototype.getTotalUnreadCount = function () {
    var count = 0;
    tool.forEach(this.getConversationList(), function (x) {
        count += x.getUnreadMessageCount();
    });
    return count;
};
//得到指定会话未读消息数
RongIMClient.prototype.getUnreadCount = function (_conversationTypes, targetId) {
    var count = 0;
    if (getType(_conversationTypes) == "array") {
        var l = this.getConversationList();
        for (var i = 0; i < _conversationTypes.length; i++) {
            tool.forEach(l, function (x) {
                x.getConversationType() == _conversationTypes[i] && (count += x.getUnreadMessageCount());
            })
        }
    } else {
        if (_conversationTypes == 0) {
            return count;
        }
        var end = this.getConversationList().get(_conversationTypes, targetId);
        end && (count = end.getUnreadMessageCount());
    }
    return count;
};
//清空指定会话未读消息数
RongIMClient.prototype.clearMessagesUnreadStatus = function (conversationType, targetId) {
    if (conversationType == 0) {
        return false;
    }
    var end = this.getConversationList().get(conversationType, targetId);
    return !!(end ? end.setUnreadMessageCount(0) || 1 : 0);
};
//初始化聊天室
RongIMClient.prototype.initChatRoom = function (Id) {
    mapping.chatroomId = Id;
};
//加入聊天室
RongIMClient.prototype.joinChatRoom = function (Id, defMessageCount, callback) {
    var e = new Modules.ChrmInput();
    e.setNothing(1);
    bridgeInstance.queryMsg(19, tool.arrayFrom(e.toArrayBuffer()), Id, {
        onSuccess: function () {
            callback.onSuccess();
            mapping.chatroomId = Id;
            var modules = new Modules.ChrmPullMsg();
            defMessageCount == 0 && (defMessageCount = -1);
            modules.setCount(defMessageCount);
            modules.setSyncTime(0);
            //加入成功进行拉取聊天室消息操作
            bridgeInstance.context.queryMessage('chrmPull', tool.arrayFrom(modules.toArrayBuffer()), Id, 1, {
                onSuccess: function (collection) {
                    var sync = tool.int64ToTimestamp(collection.syncTime);
                    tool.cookieHelper.setItem(mapping.userId + 'CST', sync);
                    var list = collection.list;
                    //把拉取到的消息逐条传给消息监听器
                    for (var i = 0; i < list.length; i++) {
                        bridgeInstance.context.handler.onReceived(list[i])
                    }
                },
                onError: function (x) {
                    callback.onError(x);
                }
            }, 'DownStreamMessages')
        },
        onError: function () {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    }, "ChrmOutput");
};
//退出聊天室
RongIMClient.prototype.quitChatRoom = function (Id, callback) {
    var e = new Modules.ChrmInput();
    e.setNothing(1);
    bridgeInstance.queryMsg(17, tool.arrayFrom(e.toArrayBuffer()), Id, callback, "ChrmOutput")
};
//发送通知消息的类型
RongIMClient.prototype.sendNotification = function (_conversationType, _targetId, _content, _callback) {
    if (_content instanceof RongIMClient.NotificationMessage)
        this.sendMessage(_conversationType, _targetId, new RongIMClient.MessageContent(_content), null, _callback);
    else
        throw new Error("Wrong Parameters");
};
//发送状态类型的消息
RongIMClient.prototype.sendStatus = function (_conversationType, _targetId, _content, _callback) {
    if (_content instanceof RongIMClient.StatusMessage)
        this.sendMessage(_conversationType, _targetId, new RongIMClient.MessageContent(_content), null, _callback);
    else
        throw new Error("Wrong Parameters");
};
//设置讨论组邀请状态
RongIMClient.prototype.setDiscussionInviteStatus = function (_targetId, _status, _callback) {
    var modules = new Modules.ModifyPermissionInput();
    modules.setOpenStatus(_status.valueOf());
    bridgeInstance.queryMsg(11, tool.arrayFrom(modules.toArrayBuffer()), _targetId, {
        onSuccess: function (x) {
            _callback.onSuccess(RongIMClient.DiscussionInviteStatus.setValue(x));
        }, onError: _callback.onError
    })
};
//设置讨论组名称
RongIMClient.prototype.setDiscussionName = function (_discussionId, _name, _callback) {
    var modules = new Modules.RenameChannelInput();
    modules.setName(_name);
    bridgeInstance.queryMsg(12, tool.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback)
};
//将指定成员移除讨论组
RongIMClient.prototype.removeMemberFromDiscussion = function (_disussionId, _userId, _callback) {
    var modules = new Modules.ChannelEvictionInput();
    modules.setUser(_userId);
    bridgeInstance.queryMsg(9, tool.arrayFrom(modules.toArrayBuffer()), _disussionId, _callback);
};
//创建讨论组
RongIMClient.prototype.createDiscussion = function (_name, _userIdList, _callback) {
    var modules = new Modules.CreateDiscussionInput();
    modules.setName(_name);
    bridgeInstance.queryMsg(1, tool.arrayFrom(modules.toArrayBuffer()), mapping.userId, {
        onSuccess: function (data) {
            var modules = new Modules.ChannelInvitationInput();
            modules.setUsers(_userIdList);
            bridgeInstance.queryMsg(0, tool.arrayFrom(modules.toArrayBuffer()), data, {
                onSuccess: function () {
                },
                onError: function () {
                    _callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
                }
            });
            _callback.onSuccess(data);
        },
        onError: function () {
            _callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    }, "CreateDiscussionOutput");
};
//添加指定成员到讨论组
RongIMClient.prototype.addMemberToDiscussion = function (_discussionId, _userIdList, _callback) {
    var modules = new Modules.ChannelInvitationInput();
    modules.setUsers(_userIdList);
    bridgeInstance.queryMsg(0, tool.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback);
};
//得到讨论组信息
RongIMClient.prototype.getDiscussion = function (_discussionId, _callback) {
    var modules = new Modules.ChannelInfoInput();
    modules.setNothing(1);
    bridgeInstance.queryMsg(4, tool.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback, "ChannelInfoOutput");
};
//退出讨论组
RongIMClient.prototype.quitDiscussion = function (_discussionId, _callback) {
    var modules = new Modules.LeaveChannelInput();
    modules.setNothing(1);
    bridgeInstance.queryMsg(7, tool.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback);
};
//退出群
RongIMClient.prototype.quitGroup = function (_groupId, _callback) {
    var modules = new Modules.LeaveChannelInput();
    modules.setNothing(1);
    bridgeInstance.queryMsg(8, tool.arrayFrom(modules.toArrayBuffer()), _groupId, _callback);
};
//加入群
RongIMClient.prototype.joinGroup = function (_groupId, _groupName, _callback) {
    var modules = new Modules.GroupInfo();
    modules.setId(_groupId);
    modules.setName(_groupName);
    var _mod = new Modules.GroupInput();
    _mod.setGroupInfo([modules]);
    bridgeInstance.queryMsg(6, tool.arrayFrom(_mod.toArrayBuffer()), _groupId, _callback, "GroupOutput");
};
//同步群
RongIMClient.prototype.syncGroup = function (_groups, _callback) {
    //去重操作
    for (var i = 0, part = [], info = []; i < _groups.length; i++) {
        if (part.length === 0 || !new RegExp(_groups[i].getId()).test(part)) {
            part.push(_groups[i].getId());
            var groupinfo = new Modules.GroupInfo();
            groupinfo.setId(_groups[i].getId());
            groupinfo.setName(_groups[i].getName());
            info.push(groupinfo);
        }
    }
    var modules = new Modules.GroupHashInput();
    modules.setUserId(mapping.userId);
    modules.setGroupHashCode(MD5(part.sort().join("")));
    //发给服务器进行md5比对
    bridgeInstance.queryMsg(13, tool.arrayFrom(modules.toArrayBuffer()), mapping.userId, {
        onSuccess: function (result) {
            //1为群信息不匹配需要发送给服务器进行同步，0不需要同步
            if (result === 1) {
                var val = new Modules.GroupInput();
                val.setGroupInfo(info);
                //比对成功，把群信息发送给服务器
                bridgeInstance.queryMsg(20, tool.arrayFrom(val.toArrayBuffer()), mapping.userId, {
                    onSuccess: function () {
                        _callback.onSuccess();
                    },
                    onError: function () {
                        _callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
                    }
                }, "GroupOutput");
            } else {
                _callback.onSuccess();
            }
        },
        onError: function () {
            _callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    }, "GroupHashOutput");
};
//添加黑名单
RongIMClient.prototype.addToBlacklist = function (userId, callback) {
    var modules = new Modules.Add2BlackListInput();
    modules.setUserId(userId);
    bridgeInstance.queryMsg(21, tool.arrayFrom(modules.toArrayBuffer()), userId, callback);
};
//得到黑名单
RongIMClient.prototype.getBlacklist = function (callback) {
    var modules = new Modules.QueryBlackListInput();
    modules.setNothing(1);
    bridgeInstance.queryMsg(23, tool.arrayFrom(modules.toArrayBuffer()), mapping.userId, callback, "QueryBlackListOutput");
};
//得到指定人员再黑名单中的状态
RongIMClient.prototype.getBlacklistStatus = function (userId, callback) {
    var modules = new Modules.BlackListStatusInput();
    modules.setUserId(userId);
    bridgeInstance.queryMsg(24, tool.arrayFrom(modules.toArrayBuffer()), userId, {
        onSuccess: function (x) {
            callback.onSuccess(RongIMClient.BlacklistStatus.setValue(x));
        }, onError: function () {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    })
};
//移除黑名单
RongIMClient.prototype.removeFromBlacklist = function (userId, callback) {
    var modules = new Modules.RemoveFromBlackListInput();
    modules.setUserId(userId);
    bridgeInstance.queryMsg(22, tool.arrayFrom(modules.toArrayBuffer()), userId, callback);
};
//拉取历史消息，单次最多20条
RongIMClient.prototype.getHistoryMessages = function (_conversationtype, targetid, size, callback) {
    if (_conversationtype.valueOf() == 0) {
        callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        return;
    }
    var modules = new Modules.HistoryMessageInput();
    modules.setTargetId(targetid);
    modules.setDataTime(lastReadTime.get(_conversationtype + targetid));
    modules.setSize(size);
    bridgeInstance.queryMsg(HistoryMsgType[_conversationtype.valueOf()], tool.arrayFrom(modules.toArrayBuffer()), targetid, {
        onSuccess: function (data) {
            var list = data.list.reverse();
            lastReadTime.set(_conversationtype + targetid, tool.int64ToTimestamp(data.syncTime));
            for (var i = 0; i < list.length; i++) {
                list[i] = messageParser(list[i]);
            }
            //hasMsg表示是否还有未拉取到的消息，list为拉取到的消息队列
            callback.onSuccess(!!data.hasMsg, list);
        }, onError: function () {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        }
    }, "HistoryMessagesOuput");
};
module.exports = RongIMClient;