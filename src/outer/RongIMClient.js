//存储会话列表的类
var _func = function () {
    //添加会话，当前列表没有该会话则将该会话加到队列最后，有的话将该会话放到队列最开始
    this.add = function (x) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].getTargetId() === x.getTargetId() && i != 0 && this[i].getConversationType() == x.getConversationType()) {
                this.unshift(this.splice(i, 1)[0]);
                return;
            }
        }
        this.unshift(x);
    };
    //根据会话类型和tagetid从列表中得到会话
    this.get = function (conver, tarid) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].getTargetId() == tarid && this[i].getConversationType() == conver) {
                return this[i]
            }
        }
        return null;
    }
};
_func.prototype = [];
//本地会话类型和服务器端会话类型映射关系
var C2S = {
    "4": 1,
    "2": 2,
    "3": 3,
    "1": 5};
//得到具体类型
function getType(str) {
    var temp = Object.prototype.toString.call(str).toLowerCase();
    return temp.slice(8, temp.length - 1);
}
//检查参数是否合法
function check(f, d) {
    var c = arguments.callee.caller;
    if ('_client' in bridge || d) {
        for (var g = 0, e = c.arguments.length; g < e; g++) {
            if (!new RegExp(getType(c.arguments[g])).test(f[g])) {
                throw new Error("The index of " + g + " parameter was wrong type " + getType(c.arguments[g]) + " [" + f[g] + "]")
            }
        }
    } else {
        throw new Error("The parameter is incorrect or was not yet instantiated RongIMClient")
    }
}
//sdk外部逻辑核心类
function RongIMClient(_appkey) {
    var appkey = _appkey,
        self = this,
    //a为桥连类实例
        a ,
    //监听器队列
        listenerList = [],
    //会话列表
        _ConversationList = new _func(),
    //本地临时会话存储，用于存储草稿
        sessionStore = global.sessionStorage || new function () {
            var c = {};
            this.length = 0;
            this.clear = function () {
                c = {};
                this.length = 0
            };
            this.setItem = function (e, f) {
                !c[e] && this.length++;
                c[e] = f;
                return e in c
            };
            this.getItem = function (e) {
                return c[e]
            };
            this.removeItem = function (f) {
                if (f in c) {
                    delete c[f];
                    this.length--;
                    return true;
                }
                return false;
            }
        };
    //清空草稿
    this.clearTextMessageDraft = function (c, e) {
        check(["object", "string"]);
        return sessionStore.removeItem(c + "_" + e)
    };
    //得到草稿
    this.getTextMessageDraft = function (c, d) {
        check(["object", "string"]);
        return sessionStore.getItem(c + "_" + d)
    };
    //保存草稿
    this.saveTextMessageDraft = function (d, e, c) {
        check(["object", "string", "string"]);
        return sessionStore.setItem(d + "_" + e, c)
    };
    //得到io通道对象
    this.getIO = function () {
        return io
    };
    //连接服务器
    this.connect = function (c, e) {
        check(["string", "object"], true);
        a = new bridge(appkey, c, e);
        for (var d = 0; d < listenerList.length; d++) {
            a['setListener'](listenerList[d])
        }
        listenerList = [];
    };
    //断开连接
    this.disconnect = function () {
        if (a) {
            a.disConnect()
        }
    };
    //重连操作
    this.reconnect = function (callback) {
        check(["object"]);
        if (a) {
            a.reConnect(callback);
        }
    };
    //同步会话列表
    this.syncConversationList = function (callback) {
        check(["object"]);
        var modules = new Modules.RelationsInput();
        modules.setType(1);
        a.queryMsg(26, io.util.arrayFrom(modules.toArrayBuffer()), bridge._client.userId, {
            onSuccess: function (list) {
                io.util.forEach(list.info, function (x) {
                    var val = self.createConversation(RongIMClient.ConversationType.setValue(mapping[x.type]), x.userId, '', true);
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
    this.getConversation = function (c, e) {
        check(["object", "string"]);
        return this.getConversationList().get(c, e);
    };
    //得到会话列表
    this.getConversationList = function () {
        return _ConversationList;
    };
    //得到会话通知状态
    this.getConversationNotificationStatus = function (f, d, e) {
        check(["object", "string", "object"]);
        var c = this.getConversation(f, d);
        if (c) {
            e.onSuccess(c.getNotificationStatus())
        } else {
            e.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR)
        }
    };
    //清空指定会话类型的会话
    this.clearConversations = function (list) {
        check(["array"]);
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < _ConversationList.length; j++) {
                _ConversationList[j].getConversationType() == list[i] && arr.push(j);
            }
        }
        for (i = 0; i < arr.length; i++) {
            var val = _ConversationList[arr[i] - i];
            this.removeConversation(val.getConversationType(), val.getTargetId());
        }
    };
    //得到会话类型为group的会话
    this.getGroupConversationList = function () {
        var arr = [];
        for (var i = 0, item; item = this.getConversationList()[i++];) {
            if (item.getConversationType() == 3) {
                arr.push(item);
            }
        }
        return arr;
    };
    //移除指定会话
    this.removeConversation = function (c, e) {
        check(["object", "string"]);
        var d = io.util.remove(this.getConversationList(), function (f) {
            return f.getTargetId() == e && f.getConversationType() == c
        });
        if (!d)
            return;
        //删除服务器上存储的会话
        var mod = new Modules.RelationInfo();
        mod.setType(C2S[c.valueOf()]);
        mod.setUserId(e);
        a.queryMsg(27, io.util.arrayFrom(mod.toArrayBuffer()), e, {
            onSuccess: function () {
            }, onError: function () {
            }
        });
    };
    //设置指定会话通知状态
    this.setConversationNotificationStatus = function (f, d, g, e) {
        check(["object", "string", "object", "object"]);
        var c = this.getConversation(f, d);
        if (c) {
            c.setNotificationStatus(g);
            e.onSuccess(g)
        } else {
            e.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR)
        }
    };
    //将指定会话设置为列表第一个
    this.setConversationToTop = function (c, e) {
        check(["object", "string"]);
        this.getConversation(c, e).setTop()
    };
    //设置会话名称
    this.setConversationName = function (f, e, d) {
        check(["object", "string", "string"]);
        this.getConversation(f, e).setConversationTitle(d)
    };
    //创建一个会话
    this.createConversation = function (f, d, e, islocal) {
        check(["object", "string", "string", "boolean|undefined"]);
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
            a.queryMsg(25, io.util.arrayFrom(mod.toArrayBuffer()), d, {
                onSuccess: function () {
                }, onError: function () {
                }
            });
        }
        return c
    };
    //得到当前登陆人员信息
    this.getCurrentUserInfo = function (callback) {
        check(["object"]);
        this.getUserInfo(bridge._client.userId, callback);
    };
    //得到执行人员信息
    this.getUserInfo = function (c, e) {
        check(["string", "object"]);
        var d = new Modules.GetUserInfoInput();
        d.setNothing(1);
        a.queryMsg(5, io.util.arrayFrom(d.toArrayBuffer()), c, e, "GetUserInfoOutput")
    };
    //发送消息
    this.sendMessage = function (h, v, e, c, u) {
        check(["object", "string", "object", "object|null|global", "object"]);
        if (!io.getInstance().connected || h == 5) {
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
        i.setSenderUserId(bridge._client.userId);
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
            j.setSenderUserId(bridge._client.userId);
            j.setObjectName(i.getObjectName());
            j.setNotificationStatus(RongIMClient.ConversationNotificationStatus.DO_NOT_DISTURB);
            j.setLatestMessageId(i.getMessageId());
            j.setLatestMessage(e.getMessage());
            j.setUnreadMessageCount(0);
            j.setTop();
        }
        a.pubMsg(h.valueOf(), g, v, u, i)
    };
    //上传文件
    this.uploadMedia = function (f, c, d, e) {
        check(["object", "string", "string", "object"])
    };
    //得到七牛token
    this.getUploadToken = function (c) {
        check(["object"]);
        var d = new Modules.GetQNupTokenInput();
        d.setType(1);
        a.queryMsg(14, io.util.arrayFrom(d.toArrayBuffer()), bridge._client.userId, c, "GetQNupTokenOutput")
    };
    //得到下载地址
    this.getDownloadUrl = function (d, c) {
        check(["string", "object"]);
        var e = new Modules.GetQNdownloadUrlInput();
        e.setType(1);
        e.setKey(d);
        a.queryMsg(14, io.util.arrayFrom(e.toArrayBuffer()), bridge._client.userId, c, "GetQNdownloadUrlOutput")
    };
    //设置连接状态监听器
    this.setConnectionStatusListener = function (c) {
        if (a) {
            a.setListener(c);
        } else {
            listenerList.push(c)
        }
    };
    //设置消息监听器
    this.setOnReceiveMessageListener = function (c) {
        if (a) {
            a.setListener(c)
        } else {
            listenerList.push(c)
        }
    };
    //得到所有未读消息数
    this.getTotalUnreadCount = function () {
        var count = 0;
        io.util.forEach(this.getConversationList(), function (x) {
            count += x.getUnreadMessageCount();
        });
        return count;
    };
    //得到指定会话未读消息数
    this.getUnreadCount = function (_conversationTypes, targetId) {
        check(["array|object", "string|undefined"]);
        var count = 0;
        if (getType(_conversationTypes) == "array") {
            var l = this.getConversationList();
            for (var i = 0; i < _conversationTypes.length; i++) {
                io.util.forEach(l, function (x) {
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
    this.clearMessagesUnreadStatus = function (conversationType, targetId) {
        check(["object", "string"]);
        if (conversationType == 0) {
            return false;
        }
        var end = this.getConversationList().get(conversationType, targetId);
        return !!(end ? end.setUnreadMessageCount(0) || 1 : 0);
    };
    //初始化聊天室
    this.initChatRoom = function (Id) {
        check(["string"]);
        bridge._client.chatroomId = Id;
    };
    //加入聊天室
    this.joinChatRoom = function (Id, defMessageCount, callback) {
        check(["string", "number", "object"]);
        var e = new Modules.ChrmInput();
        e.setNothing(1);
        a.queryMsg(19, io.util.arrayFrom(e.toArrayBuffer()), Id, {
            onSuccess: function () {
                callback.onSuccess();
                bridge._client.chatroomId = Id;
                var modules = new Modules.ChrmPullMsg();
                defMessageCount == 0 && (defMessageCount = -1);
                modules.setCount(defMessageCount);
                modules.setSyncTime(0);
                //加入成功进行拉取聊天室消息操作
                bridge._client.queryMessage('chrmPull', io.util.arrayFrom(modules.toArrayBuffer()), Id, 1, {
                    onSuccess: function (collection) {
                        var sync = io.util.int64ToTimestamp(collection.syncTime);
                        io.util.cookieHelper.setItem(bridge._client.userId + 'CST', sync);
                        var list = collection.list;
                        //把拉取到的消息逐条传给消息监听器
                        for (var i = 0; i < list.length; i++) {
                            bridge._client.handler.onReceived(list[i])
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
    this.quitChatRoom = function (Id, callback) {
        check(["string", "object"]);
        var e = new Modules.ChrmInput();
        e.setNothing(1);
        a.queryMsg(17, io.util.arrayFrom(e.toArrayBuffer()), Id, callback, "ChrmOutput")
    };
    //发送通知消息的类型
    this.sendNotification = function (_conversationType, _targetId, _content, _callback) {
        check(["object", "string", "object", "object"]);
        if (_content instanceof RongIMClient.NotificationMessage)
            this.sendMessage(_conversationType, _targetId, new RongIMClient.MessageContent(_content), null, _callback);
        else
            throw new Error("Wrong Parameters");
    };
    //发送状态类型的消息
    this.sendStatus = function (_conversationType, _targetId, _content, _callback) {
        check(["object", "string", "object", "object"]);
        if (_content instanceof RongIMClient.StatusMessage)
            this.sendMessage(_conversationType, _targetId, new RongIMClient.MessageContent(_content), null, _callback);
        else
            throw new Error("Wrong Parameters");
    };
    //设置讨论组邀请状态
    this.setDiscussionInviteStatus = function (_targetId, _status, _callback) {
        check(["string", "object", "object"]);
        var modules = new Modules.ModifyPermissionInput();
        modules.setOpenStatus(_status.valueOf());
        a.queryMsg(11, io.util.arrayFrom(modules.toArrayBuffer()), _targetId, {
            onSuccess: function (x) {
                _callback.onSuccess(RongIMClient.DiscussionInviteStatus.setValue(x));
            }, onError: _callback.onError
        })
    };
    //设置讨论组名称
    this.setDiscussionName = function (_discussionId, _name, _callback) {
        check(["string", "string", "object"]);
        var modules = new Modules.RenameChannelInput();
        modules.setName(_name);
        a.queryMsg(12, io.util.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback)
    };
    //将指定成员移除讨论组
    this.removeMemberFromDiscussion = function (_disussionId, _userId, _callback) {
        check(["string", "string", "object"]);
        var modules = new Modules.ChannelEvictionInput();
        modules.setUser(_userId);
        a.queryMsg(9, io.util.arrayFrom(modules.toArrayBuffer()), _disussionId, _callback);
    };
    //创建讨论组
    this.createDiscussion = function (_name, _userIdList, _callback) {
        check(["string", "array", "object"]);
        var modules = new Modules.CreateDiscussionInput();
        modules.setName(_name);
        a.queryMsg(1, io.util.arrayFrom(modules.toArrayBuffer()), bridge._client.userId, {
            onSuccess: function (data) {
                var modules = new Modules.ChannelInvitationInput();
                modules.setUsers(_userIdList);
                a.queryMsg(0, io.util.arrayFrom(modules.toArrayBuffer()), data, {
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
    this.addMemberToDiscussion = function (_discussionId, _userIdList, _callback) {
        check(["string", "array", "object"]);
        var modules = new Modules.ChannelInvitationInput();
        modules.setUsers(_userIdList);
        a.queryMsg(0, io.util.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback);
    };
    //得到讨论组信息
    this.getDiscussion = function (_discussionId, _callback) {
        check(["string", "object"]);
        var modules = new Modules.ChannelInfoInput();
        modules.setNothing(1);
        a.queryMsg(4, io.util.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback, "ChannelInfoOutput");
    };
    //退出讨论组
    this.quitDiscussion = function (_discussionId, _callback) {
        check(["string", "object"]);
        var modules = new Modules.LeaveChannelInput();
        modules.setNothing(1);
        a.queryMsg(7, io.util.arrayFrom(modules.toArrayBuffer()), _discussionId, _callback);
    };
    //退出群
    this.quitGroup = function (_groupId, _callback) {
        check(["string", "object"]);
        var modules = new Modules.LeaveChannelInput();
        modules.setNothing(1);
        a.queryMsg(8, io.util.arrayFrom(modules.toArrayBuffer()), _groupId, _callback);
    };
    //加入群
    this.joinGroup = function (_groupId, _groupName, _callback) {
        check(["string", "string", "object"]);
        var modules = new Modules.GroupInfo();
        modules.setId(_groupId);
        modules.setName(_groupName);
        var _mod = new Modules.GroupInput();
        _mod.setGroupInfo([modules]);
        a.queryMsg(6, io.util.arrayFrom(_mod.toArrayBuffer()), _groupId, _callback, "GroupOutput");
    };
    //同步群
    this.syncGroup = function (_groups, _callback) {
        check(["array", "object"]);
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
        modules.setUserId(bridge._client.userId);
        modules.setGroupHashCode(MD5(part.sort().join("")));
        //发给服务器进行md5比对
        a.queryMsg(13, io.util.arrayFrom(modules.toArrayBuffer()), bridge._client.userId, {
            onSuccess: function (result) {
                //1为群信息不匹配需要发送给服务器进行同步，0不需要同步
                if (result === 1) {
                    var val = new Modules.GroupInput();
                    val.setGroupInfo(info);
                    //比对成功，把群信息发送给服务器
                    a.queryMsg(20, io.util.arrayFrom(val.toArrayBuffer()), bridge._client.userId, {
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
    this.addToBlacklist = function (userId, callback) {
        check(["string", "object"]);
        var modules = new Modules.Add2BlackListInput();
        modules.setUserId(userId);
        a.queryMsg(21, io.util.arrayFrom(modules.toArrayBuffer()), userId, callback);
    };
    //得到黑名单
    this.getBlacklist = function (callback) {
        check(["object"]);
        var modules = new Modules.QueryBlackListInput();
        modules.setNothing(1);
        a.queryMsg(23, io.util.arrayFrom(modules.toArrayBuffer()), bridge._client.userId, callback, "QueryBlackListOutput");
    };
    //得到指定人员再黑名单中的状态
    this.getBlacklistStatus = function (userId, callback) {
        check(["string", "object"]);
        var modules = new Modules.BlackListStatusInput();
        modules.setUserId(userId);
        a.queryMsg(24, io.util.arrayFrom(modules.toArrayBuffer()), userId, {
            onSuccess: function (x) {
                callback.onSuccess(RongIMClient.BlacklistStatus.setValue(x));
            }, onError: function () {
                callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
            }
        })
    };
    //移除黑名单
    this.removeFromBlacklist = function (userId, callback) {
        check(["string", "object"]);
        var modules = new Modules.RemoveFromBlackListInput();
        modules.setUserId(userId);
        a.queryMsg(22, io.util.arrayFrom(modules.toArrayBuffer()), userId, callback);
    };
    //历史消息映射，key为会话类型，value为服务器的topic
    var HistoryMsgType = {
            "4": "qryPMsg",
            "1": "qryCMsg",
            "3": "qryGMsg",
            "2": "qryDMsg",
            "5": "qrySMsg"
        }, //缓存拉取历史消息的时间戳，
        LimitableMap = function (limit) {
            this.limit = limit || 10;
            this.map = {};
            this.keys = [];
        }, lastReadTime = new LimitableMap();
    LimitableMap.prototype.set = function (key, value) {
        var map = this.map;
        var keys = this.keys;
        if (!map.hasOwnProperty(key)) {
            if (keys.length === this.limit) {
                var firstKey = keys.shift();
                delete map[firstKey];
            }
            keys.push(key)
        }
        map[key] = value;
    };
    LimitableMap.prototype.get = function (key) {
        return this.map[key] || 0;
    };
    //拉取历史消息，单次最多20条
    this.getHistoryMessages = function (_conversationtype, targetid, size, callback) {
        check(["object", "string", "number", "object"]);
        if (_conversationtype.valueOf() == 0) {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
            return;
        }
        var modules = new Modules.HistoryMessageInput();
        modules.setTargetId(targetid);
        modules.setDataTime(lastReadTime.get(_conversationtype + targetid));
        modules.setSize(size);
        a.queryMsg(HistoryMsgType[_conversationtype.valueOf()], io.util.arrayFrom(modules.toArrayBuffer()), targetid, {
            onSuccess: function (data) {
                var list = data.list.reverse();
                lastReadTime.set(_conversationtype + targetid, io.util.int64ToTimestamp(data.syncTime));
                for (var i = 0; i < list.length; i++) {
                    list[i] = messageParser(list[i]);
                }
                //hasMsg表示是否还有未拉取到的消息，list为拉取到的消息队列
                callback.onSuccess(!!data.hasMsg, list);
            }, onError: function () {
                callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
            }
        }, "HistoryMessagesOuput");
    }
}