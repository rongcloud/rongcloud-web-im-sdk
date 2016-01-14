(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RongIMClient"] = factory();
	else
		root["RongIMClient"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*******************************!*\
  !*** ./src/IMClient/entry.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var RongIMClient = __webpack_require__(/*! ./RongIMClient */ 1);
	var tool = __webpack_require__(/*! ../tool */ 2);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	__webpack_require__(/*! ../ready */ 26);
	__webpack_require__(/*! ./affiliatedMessage */ 27);
	__webpack_require__(/*! ./coustomMessage */ 28);
	__webpack_require__(/*! ./IMEnum */ 29);
	//版本号
	RongIMClient.version = "0.9.10";
	// RongIMClient.connect静态方法，执行连接操作
	RongIMClient.connect = function (d, a) {
	    if (!RongIMClient.getInstance) {
	        throw new Error("please init")
	    }
	    //判断protobuf文件加载是否完成
	    if (global.Modules) {
	        //完成执行connect方法
	        RongIMClient.getInstance().connect(d, a);
	    } else {
	        //把token、回调函数赋值给RongIMClient.connect，让protobuf文件自己来触发连接操作
	        RongIMClient.connect.token = d;
	        RongIMClient.connect.callback = a
	    }
	};
	//是否有未接收的消息，jsonp方法
	RongIMClient.hasUnreadMessages = function (appkey, token, callback) {
	    tool.jsonp("http://api.cn.rong.io/message/exist.js?appKey=" +
	        encodeURIComponent(appkey) + "&token=" + encodeURIComponent(token),
	        "callBack", function (x) {
	            callback.onSuccess(!!+x.status);
	        }, function () {
	            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
	        });
	};
	//初始化。生成一个RongIMClient单例
	RongIMClient.init = function (d, conf) {
	
	    mapping.WEB_SOCKET_FORCE_FLASH = !!conf.WEB_SOCKET_FORCE_FLASH;
	    mapping.WEB_XHR_POLLING = !!conf.WEB_XHR_POLLING;
	    mapping.FORCE_LOCAL_STORAGE = !!conf.FORCE_LOCAL_STORAGE;
	
	    var instance = null;
	    RongIMClient.getInstance === undefined && (RongIMClient.getInstance = function () {
	        if (instance == null) {
	            instance = new RongIMClient(d);
	        }
	        return instance;
	    });
	};
	//注册自定义消息
	RongIMClient.registerMessageType = function (regMsg) {
	    if (!RongIMClient.getInstance) {
	        throw new Error("unInitException")
	    }
	    if ("messageType" in regMsg && "objectName" in regMsg && "fieldName" in regMsg) {
	        mapping.registerMessageTypeMapping[regMsg.objectName] = regMsg.messageType;
	        var temp = RongIMClient[regMsg.messageType] = function (c) {
	            RongIMClient.RongIMMessage.call(this, c);
	            RongIMClient.MessageType[regMsg.messageType] = regMsg.messageType;
	            this.setMessageType(regMsg.messageType);
	            this.setObjectName(regMsg.objectName);
	            for (var i = 0; i < regMsg.fieldName.length; i++) {
	                var item = regMsg.fieldName[i];
	                this["set" + item] = (function (na) {
	                    return function (a) {
	                        this.setContent(a, na);
	                    }
	                })(item);
	                this["get" + item] = (function (na) {
	                    return function () {
	                        return this.getDetail()[na];
	                    }
	                })(item);
	            }
	        };
	        tool.inherit(temp, RongIMClient.RongIMMessage, true);
	    } else
	        throw new Error("registerMessageType:arguments type is error");
	};
	//设置连接状态监听器
	RongIMClient.setConnectionStatusListener = function (a) {
	    if (!RongIMClient.getInstance) {
	        throw new Error("unInitException")
	    }
	    RongIMClient.getInstance().setConnectionStatusListener(a)
	};
	window.RongIMClient = RongIMClient;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/*!**************************************!*\
  !*** ./src/IMClient/RongIMClient.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var tool = __webpack_require__(/*! ../tool */ 2);
	var shim = __webpack_require__(/*! ./shim */ 4);
	var bridge = __webpack_require__(/*! ../core/bridge */ 5);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var messageParser = __webpack_require__(/*! ../core/messageParser */ 13);
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

/***/ },
/* 2 */
/*!*********************!*\
  !*** ./src/tool.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	var mapping = __webpack_require__(/*! ./mapping */ 3);
	var doc = document;
	var global = window;
	var transportType = '';
	var tool = {
	    //注册页面加载事件
	    load: function (fn) {
	        if (doc.readyState == "complete" || this._pageLoaded) {
	            return fn()
	        }
	        if (global.attachEvent) {
	            global.attachEvent("onload", fn)
	        } else {
	            global.addEventListener("load", fn, false)
	        }
	    },
	    //继承
	    inherit: function (ctor, superCtor,isClassExt) {
	        var f = function () {
	        };
	        if(isClassExt){
	            f.prototype = new superCtor;
	        }else{
	            f.prototype = superCtor.prototype;
	        }
	        ctor.super_ = superCtor;
	        ctor.prototype = new f();
	        ctor.prototype.constructor = ctor;
	    },
	    //查找数组中位于指定下标的元素
	    indexOf: function (arr, item, from) {
	        for (var l = arr.length, i = (from < 0) ? Math.max(0, +from) : from || 0; i < l; i++) {
	            if (arr[i] == item) {
	                return i
	            }
	        }
	        return -1
	    },
	    //判断是否为数组
	    isArray: function (obj) {
	        return Object.prototype.toString.call(obj) == "[object Array]";
	    },
	    //遍历，只能遍历数组
	    forEach: (function () {
	        if ([].forEach) {
	            return function (arr, func) {
	                [].forEach.call(arr, func)
	            }
	        } else {
	            return function (arr, func) {
	                for (var i = 0; i < arr.length; i++) {
	                    func.call(arr, arr[i], i, arr)
	                }
	            }
	        }
	    })(),
	    //遍历，可遍历对象也可遍历数组
	    each: function (obj, callback) {
	        if (this.isArray(obj)) {
	            this.forEach(x, callback);
	        } else {
	            for (var _name in obj) {
	                if (obj.hasOwnProperty(_name)) {
	                    callback.call(obj, _name, obj[_name]);
	                }
	            }
	        }
	    },
	    //合并
	    merge: function (target, additional) {
	        for (var i in additional) {
	            if (additional.hasOwnProperty(i)) {
	                target[i] = additional[i]
	            }
	        }
	    },
	    //把类数组转换为数组
	    arrayFrom: function (typedarray) {
	        if (Object.prototype.toString.call(typedarray) == "[object ArrayBuffer]") {
	            var arr = new Int8Array(typedarray);
	            return [].slice.call(arr)
	        }
	        return typedarray;
	    },
	    //删除数组指定项
	    remove: function (array, func) {
	        for (var i = 0; i < array.length; i++) {
	            if (func(array[i])) {
	                return array.splice(i, 1)[0]
	            }
	        }
	        return null
	    },
	    //把int64的时间对象转为时间戳
	    int64ToTimestamp: function (obj, isDate) {
	        if (obj.low === undefined) {
	            return obj;
	        }
	        var low = obj.low;
	        if (low < 0) {
	            low += 0xffffffff + 1;
	        }
	        low = low.toString(16);
	        var timestamp = parseInt(obj.high.toString(16) + "00000000".replace(new RegExp('0{' + low.length + '}$'), low), 16);
	        if (isDate) {
	            return new Date(timestamp)
	        }
	        return timestamp;
	    },
	    getType: function (obj) {
	        return Object.prototype.toString.call(obj).slice(8, -1);
	    },
	    ready: function (callback) {
	        if (doc.readyState == "interactive" || doc.readyState == "complete") {
	            callback();
	        } else if (doc.addEventListener) {
	            doc.addEventListener("DOMContentLoaded", function () {
	                doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
	                callback();
	            }, false)
	        } else if (doc.attachEvent) {
	            doc.attachEvent("onreadystatechange", function () {
	                if (doc.readyState === "interactive" || doc.readyState === "complete") {
	                    doc.detachEvent("onreadystatechange", arguments.callee);
	                    callback()
	                }
	            })
	        }
	    },
	    loadScript: function (src, callback) {
	        var script = doc.createElement("script");
	        var body = doc.body || doc.getElementsByTagName("body")[0];
	        script.src = src;
	        body.appendChild(script);
	        if ('onload' in script) {
	            script.onload = function () {
	                callback && callback();
	            }
	        } else {
	            script.onreadystatechange = function () {
	                if (script.readyState === 'complete') {
	                    callback && callback();
	                }
	            }
	        }
	    },
	    jsonp: function (src, jsonpCallback, callback, onFail) {
	        var cbName = 'cb' + jsonpCount++;
	        var cbAck = 'window.RongIMClient.jsonpPool.' + cbName;
	        if (global.RongIMClient.jsonpPool === void 0) {
	            global.RongIMClient.jsonpPool = {};
	        }
	        global.RongIMClient.jsonpPool[cbName] = function (data) {
	            try {
	                callback(data);
	            } finally {
	                delete global.RongIMClient.jsonpPool[cbName];
	                script.parentNode.removeChild(script);
	            }
	        };
	        var script = doc.createElement('script');
	        script.src = src + '&' + jsonpCallback + '=' + cbAck;
	        script.onerror = function () {
	            onFail();
	        };
	        doc.body.appendChild(script);
	    },
	    getTransportType: function () {
	        return transportType;
	    },
	    setTransportType: function (t) {
	        transportType = t;
	    },
	    //是否为ios
	    ios: /iphone|ipad/i.test(navigator.userAgent),
	    //是否为安卓
	    android: /android/i.test(navigator.userAgent),
	    _pageLoaded: false
	};
	var jsonpCount = 1;
	//此方法判断是否设置FORCE_LOCAL_STORAGE为true，如果是true则在localstorage中存储。否则在cookie中存储。
	tool.cookieHelper = (function () {
	    var obj, old;
	    if (mapping.globalConf.FORCE_LOCAL_STORAGE === true) {
	        old = localStorage.setItem;
	        localStorage.setItem = function (x, value) {
	            if (localStorage.length == 15) {
	                localStorage.removeItem(localStorage.key(0));
	            }
	            old.call(localStorage, x, value);
	        };
	        obj = localStorage;
	    } else {
	        obj = {
	            getItem: function (x) {
	                var arr = doc.cookie.match(new RegExp("(^| )" + x + "=([^;]*)(;|$)"));
	                if (arr != null) {
	                    return (arr[2]);
	                }
	                return null;
	            },
	            setItem: function (x, value) {
	                var exp = new Date();
	                exp.setTime(exp.getTime() + 15 * 24 * 3600 * 1000);
	                doc.cookie = x + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
	            },
	            removeItem: function (x) {
	                if (this.getItem(x)) {
	                    doc.cookie = x + "=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
	                }
	            },
	            clear: function () {
	                var keys = doc.cookie.match(/[^ =;]+(?=\=)/g);
	                if (keys) {
	                    for (var i = keys.length; i--;)
	                        doc.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
	                }
	            }
	        }
	    }
	    return obj;
	})();
	tool.load(function () {
	    tool._pageLoaded = true;
	    if (!global.JSON) {
	        tool.JSON = {
	            parse: function (sJSON) {
	                return eval('(' + sJSON + ')');
	            },
	            stringify: (function () {
	                var toString = Object.prototype.toString;
	                var isArray = Array.isArray || function (a) {
	                        return toString.call(a) === '[object Array]';
	                    };
	                var escMap = {
	                    '"': '\\"',
	                    '\\': '\\\\',
	                    '\b': '\\b',
	                    '\f': '\\f',
	                    '\n': '\\n',
	                    '\r': '\\r',
	                    '\t': '\\t'
	                };
	                var escFunc = function (m) {
	                    return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
	                };
	                var escRE = new RegExp('[\\"' + unescape("%00-%1F%u2028%u2029") + ']', 'g');
	                return function stringify(value) {
	                    if (value == null) {
	                        return 'null';
	                    } else if (typeof value === 'number') {
	                        return isFinite(value) ? value.toString() : 'null';
	                    } else if (typeof value === 'boolean') {
	                        return value.toString();
	                    } else if (typeof value === 'object') {
	                        if (typeof value.toJSON === 'function') {
	                            return stringify(value.toJSON());
	                        } else if (isArray(value)) {
	                            var res = '[';
	                            for (var i = 0; i < value.length; i++)
	                                res += (i ? ', ' : '') + stringify(value[i]);
	                            return res + ']';
	                        } else if (toString.call(value) === '[object Object]') {
	                            var tmp = [];
	                            for (var k in value) {
	                                if (value.hasOwnProperty(k))
	                                    tmp.push(stringify(k) + ': ' + stringify(value[k]));
	                            }
	                            return '{' + tmp.join(', ') + '}';
	                        }
	                    }
	                    return '"' + value.toString().replace(escRE, escFunc) + '"';
	                };
	            })()
	        };
	    } else {
	        tool.JSON = global.JSON;
	    }
	    tool.messageIdHandler = (function () {
	        var messageId = 0,
	            isXHR = tool.getTransportType() === "xhr-polling",
	            init = function () {
	                messageId = +(tool.cookieHelper.getItem("msgId") || tool.cookieHelper.setItem("msgId", 0) || 0);
	            };
	        isXHR && init();
	        return {
	            //messageid 加一并返回
	            messageIdPlus: function (method) {
	                isXHR && init();
	                if (messageId >= 0xffff) {
	                    method();
	                    return false;
	                }
	                messageId++;
	                isXHR && tool.cookieHelper.setItem("msgId", messageId);
	                return messageId;
	            },
	            //清空messageid
	            clearMessageId: function () {
	                messageId = 0;
	                isXHR && tool.cookieHelper.setItem("msgId", messageId);
	            },
	            //返回当前messageid
	            getMessageId: function () {
	                isXHR && init();
	                return messageId;
	            }
	        }
	    })()
	});
	module.exports = tool;

/***/ },
/* 3 */
/*!************************!*\
  !*** ./src/mapping.js ***!
  \************************/
/***/ function(module, exports) {

	/**
	 * Created by zhangyatao on 16/1/7.
	 */
	module.exports = {
	    mapping: {
	        "1": 4,
	        "2": 2,
	        "3": 3,
	        "4": 0,
	        "5": 1,
	        "6": 5
	    },
	    //objectname映射
	    typeMapping: {
	        "RC:TxtMsg": "TextMessage",
	        "RC:ImgMsg": "ImageMessage",
	        "RC:VcMsg": "VoiceMessage",
	        "RC:ImgTextMsg": "RichContentMessage",
	        "RC:LBSMsg": "LocationMessage"
	    },
	    //通知类型映射
	    sysNtf: {
	        "RC:InfoNtf": "InformationNotificationMessage",
	        "RC:ContactNtf": "ContactNotificationMessage",
	        "RC:ProfileNtf": "ProfileNotificationMessage",
	        "RC:CmdNtf": "CommandNotificationMessage",
	        "RC:DizNtf": "DiscussionNotificationMessage"
	    },
	    //消息监听器
	    _ReceiveMessageListener: null,
	    //连接状态监听器
	    _ConnectionStatusListener: null,
	    registerMessageTypeMapping: {},
	    userInfoMapping: {},
	    topic: ["invtDiz", "crDiz", "qnUrl", "userInf", "dizInf", "userInf", "joinGrp", "quitDiz", "exitGrp", "evctDiz", ["chatMsg", "pcMsgP", "pdMsgP", "pgMsgP", "ppMsgP"], "pdOpen", "rename", "uGcmpr", "qnTkn", 'destroyChrm', 'createChrm', 'exitChrm', 'queryChrm', 'joinChrm', "pGrps", "addBlack", "rmBlack", "getBlack", "blackStat", "addRelation", 'qryRelation', 'delRelation'],
	    globalConf: {
	        WEB_SOCKET_FORCE_FLASH: null,
	        WEB_XHR_POLLING: null,
	        FORCE_LOCAL_STORAGE: null
	    },
	    Endpoint:{},
	    userId:'',
	    reconnectSet:{
	
	    },
	    chatroomId:''
	};

/***/ },
/* 4 */
/*!******************************!*\
  !*** ./src/IMClient/shim.js ***!
  \******************************/
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Created by zhangyatao on 16/1/11.
	 */
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
	    "1": 5
	};
	var sessionStore = global.sessionStorage || new function () {
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
	var LimitableMap = function (limit) {
	    this.limit = limit || 10;
	    this.map = {};
	    this.keys = [];
	};
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
	module.exports = {
	    list: _func,
	    C2S: C2S,
	    sessionStore: sessionStore,
	    LimitableMap: LimitableMap
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/*!****************************!*\
  !*** ./src/core/bridge.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var client = __webpack_require__(/*! ./client */ 6);
	var e = __webpack_require__(/*! ../message/msgEnum */ 9);
	var Qos = e.Qos;
	
	var Bridge = function (_appkey, _token, _callback) {
	    this.context = client.connect(_appkey, _token, _callback);
	    Bridge.getInstance = function () {
	        return this;
	    }
	};
	Bridge.prototype.setListener = function (_changer) {
	    if (typeof _changer == "object") {
	        if (typeof _changer.onChanged == 'function') {
	            mapping._ConnectionStatusListener = _changer;
	        } else if (typeof _changer.onReceived == 'function') {
	            mapping._ReceiveMessageListener = _changer;
	        }
	    }
	};
	//重连
	Bridge.prototype.reConnect = function (callback) {
	    this.context.channel.reconnect(callback)
	};
	//断连
	Bridge.prototype.disConnect = function () {
	    this.context.clearHeartbeat();
	    this.context.channel.disconnect()
	};
	//执行queryMessage请求
	Bridge.prototype.queryMsg = function (topic, content, targetId, callback, pbname) {
	    if (typeof topic != "string") {
	        topic = mapping.topic[topic]
	    }
	    this.context.queryMessage(topic, content, targetId, Qos.AT_MOST_ONCE, callback, pbname)
	};
	//执行publishMessage请求
	Bridge.prototype.pubMsg = function (topic, content, targetId, callback, msg) {
	    this.context.publishMessage(mapping.topic[10][topic], content, targetId, callback, msg)
	};
	module.exports = Bridge;


/***/ },
/* 6 */
/*!****************************!*\
  !*** ./src/core/client.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	var entity = __webpack_require__(/*! ../message/MessageEntity */ 7);
	var handler = __webpack_require__(/*! ./messageHandler */ 12);
	var channel = __webpack_require__(/*! ./channel */ 24);
	var ack = __webpack_require__(/*! ./messageCallback */ 14);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var md5 = __webpack_require__(/*! ../md5 */ 25);
	var tool = __webpack_require__(/*! ../tool */ 2);
	var en = __webpack_require__(/*! ../message/msgEnum */ 9);
	var Qos = en.Qos;
	var global = window;
	//初始化通道对象
	ack.ConnectAck.redirect = function (callback) {
	    Client.getInstance().channel = new channel(Client.Endpoint, callback, Client.getInstance());
	};
	//连接端类，逻辑处理全在此类中
	function Client(_to, _ap) {
	    this.timeoutMillis = 100000;
	    this.timeout_ = 0;
	    this.appId = _ap;
	    this.token = _to;
	    this.sdkVer = "1.0.0";
	    this.apiVer = "1.0.0";
	    this.channel = null;
	    this.handler = null;
	    this.userId = "";
	    this.heartbeat = 0;
	    this.chatroomId = '';
	    //用于心跳启动定时器
	}
	Client.prototype.resumeTimer = function () {
	    var self = this;
	    if (!this.timeout_) {
	        this.timeout_ = setTimeout(function () {
	            if (!self.timeout_) {
	                return;
	            }
	            try {
	                self.channel.disconnect()
	            } catch (e) {
	            }
	            clearTimeout(self.timeout_);
	            self.timeout_ = 0;
	            self.channel.reconnect();
	            self.channel.socket.fire("StatusChanged", 5);
	        }, self.timeoutMillis)
	    }
	};
	//销毁心跳定时器
	Client.prototype.pauseTimer = function () {
	    if (this.timeout_) {
	        clearTimeout(this.timeout_);
	        this.timeout_ = 0;
	    }
	};
	//连接服务器
	Client.prototype.connect = function (_callback) {
	    var self = this;
	    //判断navi是否已经返回地址
	    if (mapping.Endpoint.host) {
	        if (tool.getTransportType() == "websocket") {
	            if (!global.WebSocket) {
	                _callback.onError(RongIMClient.ConnectErrorStatus.setValue(1));
	                return;
	            }
	            //判断是否是flashsocket  是的话就加载代理文件
	            'loadFlashPolicyFile' in WebSocket && WebSocket.loadFlashPolicyFile();
	        }
	        //实例消息处理类
	        this.handler = new handler(this);
	        //设置连接回调
	        this.handler.setConnectCallback(_callback);
	        //实例通道类型
	        this.channel = new channel(mapping.Endpoint, function () {
	            tool.getTransportType() == "websocket" && self.keepLive()
	        }, this);
	        //触发状态改变观察者
	        this.channel.socket.fire("StatusChanged", 1)
	    } else {
	        //没有返回地址就手动抛出错误
	        _callback.onError(RongIMClient.ConnectErrorStatus.setValue(5));
	    }
	};
	//心跳启动方法
	Client.prototype.keepLive = function () {
	    var self = this;
	    if (this.heartbeat > 0) {
	        clearInterval(this.heartbeat);
	    }
	    this.heartbeat = setInterval(function () {
	        self.resumeTimer();
	        self.channel.writeAndFlush(new entity.PingReqMessage());
	        console.log("keep live pingReqMessage sending appId " + self.appId);
	    }, 180000);
	};
	//心跳停止方法
	Client.prototype.clearHeartbeat = function () {
	    clearInterval(this.heartbeat);
	    this.heartbeat = 0;
	    this.pauseTimer();
	};
	//发送publishMessage消息
	Client.prototype.publishMessage = function (_topic, _data, _targetId, _callback, _msg) {
	    var msgId = tool.messageIdHandler.messageIdPlus(this.channel.reconnect);
	    if (!msgId) {
	        return;
	    }
	    var msg = new entity.PublishMessage(_topic, _data, _targetId);
	    msg.setMessageId(msgId);
	    if (_callback) {
	        msg.setQos(Qos.AT_LEAST_ONCE);
	        this.handler.putCallback(new ack.PublishCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), _msg)
	    } else {
	        msg.setQos(Qos.AT_MOST_ONCE);
	    }
	    this.channel.writeAndFlush(msg);
	};
	//发送queryMessage消息
	Client.prototype.queryMessage = function (_topic, _data, _targetId, _qos, _callback, pbtype) {
	    //如果topic是userinfo，就去userinfo缓存对象里拿，没有的话再去请求服务器拉取userinfo
	    if (_topic == "userInf") {
	        if (mapping.userInfoMapping[_targetId]) {
	            _callback.onSuccess(mapping.userInfoMapping[_targetId]);
	            return;
	        }
	    }
	    var msgId = tool.messageIdHandler.messageIdPlus(this.channel.reconnect);
	    if (!msgId) {
	        return;
	    }
	    var msg = new entity.QueryMessage(_topic, _data, _targetId);
	    msg.setMessageId(msgId);
	    msg.setQos(_qos);
	    this.handler.putCallback(new ack.QueryCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), pbtype);
	    this.channel.writeAndFlush(msg)
	};
	//同步消息
	Client.prototype.syncTime = function (_type, pullTime) {
	    SyncTimeQueue.push({type: _type, pulltime: pullTime});
	    //如果队列中只有一个成员并且状态已经完成就执行invoke方法
	    if (SyncTimeQueue.length == 1 && SyncTimeQueue.state == "complete") {
	        invoke()
	    }
	};
	//声明Client.connect静态方法，返回Client实例
	Client.connect = function (appId, token, callback) {
	    //如果appid和本地存储的不一样，清空所有本地存储数据
	    var oldAppId = tool.cookieHelper.getItem("appId");
	    if (oldAppId && oldAppId != appId) {
	        tool.cookieHelper.clear();
	        tool.cookieHelper.setItem("appId", appId);
	    }
	    var client = new Client(token, appId);
	    Client.getInstance = function () {
	        return client;
	    };
	    //请求navi导航
	    Client.getServerEndpoint(token, appId, callback, true);
	    return client;
	};
	Client.getServerEndpoint = function (_token, _appId, callback, unignore) {
	    if (unignore) {
	        //根据token生成MD5截取8-16下标的数据与本地存储的导航信息进行比对
	        //如果信息和上次的通道类型都一样，不执行navi请求，用本地存储的导航信息连接服务器
	        var naviStr = md5(_token).slice(8, 16),
	            _old = tool.cookieHelper.getItem("navi\\w+?"),
	            _new = tool.cookieHelper.getItem("navi" + naviStr);
	        if (_old == _new && _new !== null && tool.cookieHelper.getItem("rongSDK") == tool.getTransportType()) {
	            var obj = unescape(_old).split(",");
	            setTimeout(function () {
	                RongBinaryHelper.__host = mapping.Endpoint.host = obj[0];
	                mapping.Endpoint.userId = obj[1];
	                Client.getInstance().connect(callback);
	            }, 500);
	            return;
	        }
	    }
	    //导航信息，切换Url对象的key进行线上线下测试操作
	    var Url = {
	        //测试环境
	        "navUrl-Debug": "http://nav.sunquan.rongcloud.net:9001/",
	        //线上环境
	        "navUrl-Release": "http://nav.cn.rong.io/"
	    };
	    tool.jsonp(Url["navUrl-Release"] +
	        (tool.getTransportType() == "xhr-polling" ? "cometnavi.js" : "navi.js") +
	        "?appId=" + _appId + "&token=" + encodeURIComponent(_token),
	        "callBack",
	        function (data) {
	            Client.getInstance().connect(callback);
	            //把导航返回的server字段赋值给RongBinaryHelper.__host，因为flash widget需要使用
	            RongBinaryHelper.__host = mapping.Endpoint.host = data["server"];
	            mapping.Endpoint.userId = data.userId;
	            //替换本地存储的导航信息
	            var temp = document.cookie.match(new RegExp("(^| )navi\\w+?=([^;]*)(;|$)"));
	            temp !== null && tool.cookieHelper.removeItem(temp[0].split("=")[0].replace(/^\s/, ""));
	            tool.cookieHelper.setItem("navi" + md5(Client.getInstance().token).slice(8, 16), data["server"] + "," + (data.userId || ""));
	        }, function () {
	            callback.onError(RongIMClient.ConnectErrorStatus.setValue(4));
	        });
	};
	//同步消息队列
	var SyncTimeQueue = [];
	//队列的执行状态
	SyncTimeQueue.state = "complete";
	function invoke() {
	    var time, modules, str, target;
	    //从队列开头取出一个赋值给temp变量
	    var temp = SyncTimeQueue.shift();
	    var self = Client.getInstance();
	    if (!temp) {
	        return;
	    }
	    //改变状态为pending
	    SyncTimeQueue.state = "pending";
	    if (temp.type != 2) {
	        //普通消息
	        time = tool.cookieHelper.getItem(self.userId) || 0;
	        modules = new Modules.SyncRequestMsg();
	        modules.setIspolling(false);
	        str = 'pullMsg';
	        target = self.userId;
	    } else {
	        //聊天室消息
	        time = tool.cookieHelper.getItem(self.userId + "CST") || 0;
	        modules = new Modules.ChrmPullMsg();
	        modules.setCount(0);
	        str = 'chrmPull';
	        if (self.chatroomId === '') {
	            //受到聊天室消息，但是本地没有加入聊天室就手动抛出一个错误
	            throw new Error("syncTime:Received messages of chatroom but was not init");
	        }
	        target = self.chatroomId;
	    }
	    //判断服务器给的时间是否消息本地存储的时间，小于的话不执行拉取操作，进行一下步队列操作
	    if (temp.pulltime <= time) {
	        SyncTimeQueue.state = "complete";
	        invoke();
	        return;
	    }
	    modules.setSyncTime(time);
	    //发送queryMessage请求
	    self.queryMessage(str, tool.arrayFrom(modules.toArrayBuffer()), target, Qos.AT_LEAST_ONCE, {
	        onSuccess: function (collection) {
	            var sync = tool.int64ToTimestamp(collection.syncTime),
	                symbol = self.userId;
	            if (str == "chrmPull") {
	                symbol += 'CST';
	            }
	            //把返回时间戳存入本地，普通消息key为userid，聊天室消息key为userid＋'CST'；value都为服务器返回的时间戳
	            tool.cookieHelper.setItem(symbol, sync);
	            //把拉取到的消息逐条传给消息监听器
	            var list = collection.list;
	            for (var i = 0; i < list.length; i++) {
	                Client.getInstance().handler.onReceived(list[i])
	            }
	            SyncTimeQueue.state = "complete";
	            invoke();
	        },
	        onError: function () {
	            SyncTimeQueue.state = "complete";
	            invoke();
	        }
	    }, "DownStreamMessages");
	}
	module.exports = Client;

/***/ },
/* 7 */
/*!**************************************!*\
  !*** ./src/message/MessageEntity.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var msg = __webpack_require__(/*! ./Message */ 8);
	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var e = __webpack_require__(/*! ./msgEnum */ 9);
	var util = __webpack_require__(/*! ../tool */ 2);
	var Message = msg.Message;
	var Header = msg.Header;
	var Type = e.Type;
	var ConnectionState = e.ConnectionState;
	var DisconnectionStatus = e.DisconnectionStatus;
	function ConnectMessage() {
	    var CONNECT_HEADER_SIZE = 12,
	        protocolId = "RCloud",
	        protocolVersion = 3,
	        clientId, keepAlive, appId, token, cleanSession, willTopic, will, willQos, retainWill, hasAppId, hasToken, hasWill;
	    switch (arguments.length) {
	        case 0:
	            Message.call(this, Type.CONNECT);
	            break;
	        case 1:
	            Message.call(this, arguments[0]);
	            break;
	        case 3:
	            Message.call(this, Type.CONNECT);
	            if (!arguments[0] || arguments[0].length > 64) {
	                throw new Error("ConnectMessage:Client Id cannot be null and must be at most 64 characters long: " + arguments[0])
	            }
	            clientId = arguments[0];
	            cleanSession = arguments[1];
	            keepAlive = arguments[2];
	            break
	    }
	    this.messageLength = function () {
	        var payloadSize = TinyStream.toMQTString(clientId).length;
	        payloadSize += TinyStream.toMQTString(willTopic).length;
	        payloadSize += TinyStream.toMQTString(will).length;
	        payloadSize += TinyStream.toMQTString(appId).length;
	        payloadSize += TinyStream.toMQTString(token).length;
	        return payloadSize + CONNECT_HEADER_SIZE
	    };
	    this.readMessage = function (In) {
	        var stream = TinyStream.parse(In);
	        protocolId = stream.readUTF();
	        protocolVersion = stream.readByte();
	        var cFlags = stream.readByte();
	        hasAppId = (cFlags & 128) > 0;
	        hasToken = (cFlags & 64) > 0;
	        retainWill = (cFlags & 32) > 0;
	        willQos = cFlags >> 3 & 3;
	        hasWill = (cFlags & 4) > 0;
	        cleanSession = (cFlags & 32) > 0;
	        keepAlive = stream.read() * 256 + stream.read();
	        clientId = stream.readUTF();
	        if (hasWill) {
	            willTopic = stream.readUTF();
	            will = stream.readUTF()
	        }
	        if (hasAppId) {
	            try {
	                appId = stream.readUTF()
	            } catch (ex) {
	            }
	        }
	        if (hasToken) {
	            try {
	                token = stream.readUTF()
	            } catch (ex) {
	            }
	        }
	        return stream
	    };
	    this.writeMessage = function (out) {
	        var stream = TinyStream.parse(out);
	        stream.writeUTF(protocolId);
	        stream.write(protocolVersion);
	        var flags = cleanSession ? 2 : 0;
	        flags |= hasWill ? 4 : 0;
	        flags |= willQos ? willQos >> 3 : 0;
	        flags |= retainWill ? 32 : 0;
	        flags |= hasToken ? 64 : 0;
	        flags |= hasAppId ? 128 : 0;
	        stream.write(flags);
	        stream.writeChar(keepAlive);
	        stream.writeUTF(clientId);
	        if (hasWill) {
	            stream.writeUTF(willTopic);
	            stream.writeUTF(will)
	        }
	        if (hasAppId) {
	            stream.writeUTF(appId)
	        }
	        if (hasToken) {
	            stream.writeUTF(token)
	        }
	        return stream
	    };
	}
	ConnectMessage._name = "ConnectMessage";
	util.inherit(ConnectMessage, Message, true);
	function ConnAckMessage() {
	    var status, userId, MESSAGE_LENGTH = 2;
	    switch (arguments.length) {
	        case 0:
	            Message.call(this, Type.CONNACK);
	            break;
	        case 1:
	            if (arguments[0] instanceof Header) {
	                Message.call(this, arguments[0])
	            } else {
	                if (arguments[0] instanceof ConnectionState) {
	                    Message.call(this, Type.CONNACK);
	                    if (arguments[0] == null) {
	                        throw new Error("ConnAckMessage:The status of ConnAskMessage can't be null")
	                    }
	                    status = arguments[0]
	                }
	            }
	    }
	    this.messageLength = function () {
	        var length = MESSAGE_LENGTH;
	        if (userId) {
	            length += TinyStream.toMQTString(userId).length
	        }
	        return length
	    };
	    this.readMessage = function (In, msglength) {
	        var stream = TinyStream.parse(In);
	        stream.read();
	        var result = +stream.read();
	        if (result >= 0 && result <= 9) {
	            this.setStatus(result);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + result)
	        }
	        if (msglength > MESSAGE_LENGTH) {
	            this.setUserId(stream.readUTF())
	        }
	    };
	    this.writeMessage = function (out) {
	        var stream = TinyStream.parse(out);
	        stream.write(128);
	        switch (+status) {
	            case 0:
	            case 1:
	            case 2:
	            case 5:
	            case 6:
	                stream.write(+status);
	                break;
	            case 3:
	            case 4:
	                stream.write(3);
	                break;
	            default:
	                throw new Error("Unsupported CONNACK code:" + status);
	        }
	        if (userId) {
	            stream.writeUTF(userId)
	        }
	        return stream
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.setStatus = function (x) {
	        status = x instanceof ConnectionState ? x : ConnectionState.setValue(x);
	    };
	    this.setUserId = function (_userId) {
	        userId = _userId
	    };
	    this.getUserId = function () {
	        return userId
	    };
	}
	ConnAckMessage._name = "ConnAckMessage";
	util.inherit(ConnAckMessage, Message, true);
	function DisconnectMessage(one) {
	    var status;
	    this.MESSAGE_LENGTH = 2;
	    if (one instanceof Header) {
	        Message.call(this, one)
	    } else {
	        Message.call(this, Type.DISCONNECT);
	        if (one instanceof DisconnectionStatus) {
	            status = one
	        }
	    }
	    this.messageLength = function () {
	        return this.MESSAGE_LENGTH
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In);
	        _in.read();
	        var result = +_in.read();
	        if (result >= 0 && result <= 5) {
	            this.setStatus(result);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + result)
	        }
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.write(0);
	        if (+status >= 1 && +status <= 3) {
	            out.write((+status) - 1);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + status)
	        }
	    };
	    this.setStatus = function (x) {
	        status = x instanceof DisconnectionStatus ? x : DisconnectionStatus.setValue(x);
	    };
	    this.getStatus = function () {
	        return status
	    };
	}
	DisconnectMessage._name = "DisconnectMessage";
	util.inherit(DisconnectMessage, Message, true);
	function PingReqMessage(header) {
	    if (header && header instanceof Header) {
	        Message.call(this, header)
	    } else {
	        Message.call(this, Type.PINGREQ)
	    }
	}
	PingReqMessage._name = "PingReqMessage";
	util.inherit(PingReqMessage, Message, true);
	function PingRespMessage(header) {
	    if (header && header instanceof Header) {
	        Message.call(this, header)
	    } else {
	        Message.call(this, Type.PINGRESP)
	    }
	}
	PingRespMessage._name = "PingRespMessage";
	util.inherit(PingRespMessage, Message, true);
	function RetryableMessage(argu) {
	    var messageId;
	    Message.call(this, argu);
	    this.messageLength = function () {
	        return 2
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out),
	            Id = this.getMessageId(),
	            lsb = Id & 255,
	            msb = (Id & 65280) >> 8;
	        out.write(msb);
	        out.write(lsb);
	        return out
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In),
	            msgId = _in.read() * 256 + _in.read();
	        this.setMessageId(parseInt(msgId, 10));
	    };
	    this.setMessageId = function (_messageId) {
	        messageId = _messageId
	    };
	    this.getMessageId = function () {
	        return messageId
	    }
	}
	RetryableMessage._name = "RetryableMessage";
	util.inherit(RetryableMessage, Message, true);
	function PubAckMessage(args) {
	    var status, msgLen = 2,
	        date = 0;
	    if (args instanceof Header) {
	        RetryableMessage.call(this, args)
	    } else {
	        RetryableMessage.call(this, Type.PUBACK);
	        this.setMessageId(args)
	    }
	    this.messageLength = function () {
	        return msgLen
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        PubAckMessage.prototype.writeMessage.call(this, out)
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In);
	        PubAckMessage.prototype.readMessage.call(this, _in);
	        date = _in.readInt();
	        status = _in.read() * 256 + _in.read()
	    };
	    this.setStatus = function (x) {
	        status = x;
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.getDate = function () {
	        return date
	    };
	}
	PubAckMessage._name = "PubAckMessage";
	util.inherit(PubAckMessage, RetryableMessage, true);
	function PublishMessage(one, two, three) {
	    var topic, data, targetId, date;
	    if (arguments.length == 1 && one instanceof Header) {
	        RetryableMessage.call(this, one)
	    } else {
	        if (arguments.length == 3) {
	            RetryableMessage.call(this, Type.PUBLISH);
	            topic = one;
	            targetId = three;
	            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
	        }
	    }
	    this.messageLength = function () {
	        var length = 10;
	        length += TinyStream.toMQTString(topic).length;
	        length += TinyStream.toMQTString(targetId).length;
	        length += data.length;
	        return length
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.writeUTF(topic);
	        out.writeUTF(targetId);
	        PublishMessage.prototype.writeMessage.apply(this, arguments);
	        out.write(data)
	    };
	    this.readMessage = function (In, msgLength) {
	        var pos = 6,
	            _in = TinyStream.parse(In);
	        date = _in.readInt();
	        topic = _in.readUTF();
	        pos += TinyStream.toMQTString(topic).length;
	        PublishMessage.prototype.readMessage.apply(this, arguments);
	        data = new Array(msgLength - pos);
	        _in.read(data)
	    };
	    this.setTopic = function (x) {
	        topic = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.setTargetId = function (x) {
	        targetId = x;
	    };
	    this.setDate = function (x) {
	        date = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.getTopic = function () {
	        return topic
	    };
	    this.getData = function () {
	        return data
	    };
	    this.getTargetId = function () {
	        return targetId
	    };
	    this.getDate = function () {
	        return date
	    }
	}
	PublishMessage._name = "PublishMessage";
	util.inherit(PublishMessage, RetryableMessage, true);
	function QueryMessage(one, two, three) {
	    var topic, data, targetId;
	    if (one instanceof Header) {
	        RetryableMessage.call(this, one)
	    } else {
	        if (arguments.length == 3) {
	            RetryableMessage.call(this, Type.QUERY);
	            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
	            topic = one;
	            targetId = three;
	        }
	    }
	    this.messageLength = function () {
	        var length = 0;
	        length += TinyStream.toMQTString(topic).length;
	        length += TinyStream.toMQTString(targetId).length;
	        length += 2;
	        length += data.length;
	        return length
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.writeUTF(topic);
	        out.writeUTF(targetId);
	        this.constructor.prototype.writeMessage.call(this, out);
	        out.write(data)
	    };
	    this.readMessage = function (In, msgLength) {
	        var pos = 0,
	            _in = TinyStream.parse(In);
	        topic = _in.readUTF();
	        targetId = _in.readUTF();
	        pos += TinyStream.toMQTString(topic).length;
	        pos += TinyStream.toMQTString(targetId).length;
	        this.constructor.prototype.readMessage.apply(this, arguments);
	        pos += 2;
	        data = new Array(msgLength - pos);
	        _in.read(data)
	    };
	    this.setTopic = function (x) {
	        topic = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.setTargetId = function (x) {
	        targetId = x;
	    };
	    this.getTopic = function () {
	        return topic
	    };
	    this.getData = function () {
	        return data
	    };
	    this.getTargetId = function () {
	        return targetId
	    };
	}
	QueryMessage._name = "QueryMessage";
	util.inherit(QueryMessage, RetryableMessage, true);
	function QueryConMessage(messageId) {
	    if (messageId instanceof Header) {
	        RetryableMessage.call(this, messageId)
	    } else {
	        RetryableMessage.call(this, Type.QUERYCON);
	        this.setMessageId(messageId)
	    }
	}
	QueryConMessage._name = "QueryConMessage";
	util.inherit(QueryConMessage, RetryableMessage, true);
	function QueryAckMessage(header) {
	    var data, status, date;
	    RetryableMessage.call(this, header);
	    this.readMessage = function (In, msgLength) {
	        var _in = TinyStream.parse(In);
	        QueryAckMessage.prototype.readMessage.call(this, _in);
	        date = _in.readInt();
	        status = _in.read() * 256 + _in.read();
	        if (msgLength > 0) {
	            data = new Array(msgLength - 8);
	            _in.read(data)
	        }
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.getDate = function () {
	        return date
	    };
	    this.setDate = function (x) {
	        date = x;
	    };
	    this.setStatus = function (x) {
	        status = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.getData = function () {
	        return data
	    };
	}
	QueryAckMessage._name = "QueryAckMessage";
	util.inherit(QueryAckMessage, RetryableMessage, true);
	module.exports = {
	    ConnectMessage: ConnectMessage,
	    ConnAckMessage: ConnAckMessage,
	    DisconnectMessage: DisconnectMessage,
	    PingReqMessage: PingReqMessage,
	    PingRespMessage: PingRespMessage,
	    RetryableMessage: RetryableMessage,
	    PubAckMessage: PubAckMessage,
	    PublishMessage: PublishMessage,
	    QueryMessage: QueryMessage,
	    QueryConMessage: QueryConMessage,
	    QueryAckMessage: QueryAckMessage
	};
	


/***/ },
/* 8 */
/*!********************************!*\
  !*** ./src/message/Message.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 消息类，对java逻辑的重新实现
	 * */
	var e = __webpack_require__(/*! ./msgEnum */ 9);
	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var Qos = e.Qos;
	var Type = e.Type;
	function Message(argu) {
	    var _header, _headerCode, lengthSize = 0;
	    if (argu instanceof Header) {
	        _header = argu
	    } else {
	        _header = new Header(argu, false, Qos.AT_MOST_ONCE, false)
	    }
	    this.write = function (Out) {
	        var out = TinyStream.parse(Out);
	        _headerCode = this.getHeaderFlag();
	        out.write(_headerCode);
	        this.writeMessage(out);
	        return out
	    };
	    this.getHeaderFlag = function () {
	        return _header.encode();
	    };
	    this.getLengthSize = function () {
	        return lengthSize
	    };
	    this.setRetained = function (retain) {
	        _header.retain = retain
	    };
	    this.isRetained = function () {
	        return _header.retain
	    };
	    this.setQos = function (qos) {
	        _header.qos = qos instanceof Qos ? qos : Qos.setValue(qos);
	    };
	    this.getQos = function () {
	        return _header.qos
	    };
	    this.setDup = function (dup) {
	        _header.dup = dup
	    };
	    this.isDup = function () {
	        return _header.dup
	    };
	    this.getType = function () {
	        return _header.type
	    };
	}
	Message._name = "Message";
	Message.prototype = {
	    read: function (In, length) {
	        this.readMessage(In, length)
	    },
	    toBytes: function () {
	        return this.write([]).getBytesArray()
	    }, messageLength: function () {
	        return 0
	    }, writeMessage: function (out) {
	    }, readMessage: function (In) {
	    }, init: function (args) {
	        var valName, nana;
	        for (nana in args) {
	            if (!args.hasOwnProperty(nana))
	                continue;
	            valName = nana.replace(/^\w/, function (x) {
	                var tt = x.charCodeAt(0);
	                return 'set' + (tt >= 0x61 ? String.fromCharCode(tt & ~32) : x)
	            });
	            if (valName in this) {
	                this[valName](args[nana])
	            }
	        }
	    }
	};
	function Header(_type, _retain, _qos, _dup) {
	    this.type = null;
	    this.retain = false;
	    this.qos = Qos.AT_LEAST_ONCE;
	    this.dup = false;
	    if (_type && +_type == _type && arguments.length == 1) {
	        this.retain = (_type & 1) > 0;
	        this.qos = Qos.setValue((_type & 6) >> 1);
	        this.dup = (_type & 8) > 0;
	        this.type = Type.setValue((_type >> 4) & 15);
	    } else {
	        this.type = Type.setValue(_type);
	        this.retain = _retain;
	        this.qos = Qos.setValue(_qos);
	        this.dup = _dup;
	    }
	}
	Header.prototype = {
	    getType: function () {
	        return this.type
	    }, encode: function () {
	        var _byte = (this.type << 4);
	        _byte |= this.retain ? 1 : 0;
	        _byte |= this.qos << 1;
	        _byte |= this.dup ? 8 : 0;
	        return _byte
	    }, toString: function () {
	        return "Header [type=" + this.type + ",retain=" + this.retain + ",qos=" + this.qos + ",dup=" + this.dup + "]"
	    }
	};
	module.exports = {
	    Message: Message,
	    Header: Header
	};

/***/ },
/* 9 */
/*!********************************!*\
  !*** ./src/message/msgEnum.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	var myEnum = __webpack_require__(/*! ../enum */ 10);
	var Qos = myEnum({AT_MOST_ONCE: 0, AT_LEAST_ONCE: 1, EXACTLY_ONCE: 2, DEFAULT: 3}),
	    Type = myEnum({
	        CONNECT: 1,
	        CONNACK: 2,
	        PUBLISH: 3,
	        PUBACK: 4,
	        QUERY: 5,
	        QUERYACK: 6,
	        QUERYCON: 7,
	        SUBSCRIBE: 8,
	        SUBACK: 9,
	        UNSUBSCRIBE: 10,
	        UNSUBACK: 11,
	        PINGREQ: 12,
	        PINGRESP: 13,
	        DISCONNECT: 14
	    }),
	    DisconnectionStatus = myEnum({
	        RECONNECT: 0,
	        OTHER_DEVICE_LOGIN: 1,
	        CLOSURE: 2,
	        UNKNOWN_ERROR: 3,
	        LOGOUT: 4,
	        BLOCK: 5
	    }),
	    ConnectionState = myEnum({
	        ACCEPTED: 0,
	        UNACCEPTABLE_PROTOCOL_VERSION: 1,
	        IDENTIFIER_REJECTED: 2,
	        SERVER_UNAVAILABLE: 3,
	        TOKEN_INCORRECT: 4,
	        NOT_AUTHORIZED: 5,
	        REDIRECT: 6,
	        PACKAGE_ERROR: 7,
	        APP_BLOCK_OR_DELETE: 8,
	        BLOCK: 9,
	        TOKEN_EXPIRE: 10,
	        DEVICE_ERROR: 11
	    });
	module.exports = {
	    Qos: Qos,
	    Type: Type,
	    DisconnectionStatus: DisconnectionStatus,
	    ConnectionState: ConnectionState
	};


/***/ },
/* 10 */
/*!*********************!*\
  !*** ./src/enum.js ***!
  \*********************/
/***/ function(module, exports) {

	function inherit(superCtor) {
	    var f = function () {
	    };
	    f.prototype = superCtor;
	    return new f;
	}
	var Enum = function (namesToValues) {
	    var enumeration = function () {
	        throw "can't Instantiate Enumerations";
	    };
	    enumeration.setValue = function (x) {
	        var val = null;
	        enumeration.foreach(function (i) {
	            if (i.value == x || i.name == x) {
	                val = enumeration[i.name];
	            }
	        }, null);
	        return val;
	    };
	
	
	    var proto = enumeration.prototype = {
	        constructor: enumeration,
	        toString: function () {
	            return this.name;
	        },
	        valueOf: function () {
	            return this.value;
	        },
	        toJSON: function () {
	            return this.name;
	        }
	    };
	    enumeration.values = [];
	    for (var _name in namesToValues) {
	        var e = inherit(proto);
	        e.name = _name;
	        e.value = namesToValues[_name];
	        enumeration[_name] = e;
	        enumeration.values.push(e);
	    }
	    enumeration.foreach = function (f, c) {
	        for (var i = 0; i < this.values.length; i++) {
	            f.call(c, this.values[i]);
	        }
	    };
	    return enumeration;
	};
	module.exports = Enum;

/***/ },
/* 11 */
/*!***********************!*\
  !*** ./src/binary.js ***!
  \***********************/
/***/ function(module, exports) {

	var global = window;
	var binaryPot = global.RongBinaryHelper = {
	    /**
	     * 初始化字节流,把-128至128的区间改为0-256的区间.便于计算
	     * @param {Array} array 字节流数组
	     * @return {Array} 转化好的字节流数组
	     */
	    init: function (array) {
	        for (var i = 0; i < array.length; i++) {
	            array[i] *= 1;
	            if (array[i] < 0) {
	                array[i] += 256
	            }
	            if (array[i] > 255) {
	                throw new Error('不合法字节流')
	            }
	        }
	        return array;
	    },
	    /**
	     * 把一段字符串按照utf8编码写到缓冲区中
	     * @param {String} str 将要写入缓冲区的字符串
	     * @param {Boolean} isGetBytes  是否只得到内容字节(不包括最开始的两位占位字节)
	     * @returns {Array} 字节流
	     */
	    writeUTF: function (str, isGetBytes) {
	        var back = [],
	            byteSize = 0;
	        for (var i = 0; i < str.length; i++) {
	            var code = str.charCodeAt(i);
	            if (code >= 0 && code <= 127) {
	                byteSize += 1;
	                back.push(code);
	            } else if (code >= 128 && code <= 2047) {
	                byteSize += 2;
	                back.push((192 | (31 & (code >> 6))));
	                back.push((128 | (63 & code)))
	            } else if (code >= 2048 && code <= 65535) {
	                byteSize += 3;
	                back.push((224 | (15 & (code >> 12))));
	                back.push((128 | (63 & (code >> 6))));
	                back.push((128 | (63 & code)))
	            }
	        }
	        for (i = 0; i < back.length; i++) {
	            if (back[i] > 255) {
	                back[i] &= 255
	            }
	        }
	        if (isGetBytes) {
	            return back
	        }
	        if (byteSize <= 255) {
	            return [0, byteSize].concat(back);
	        } else {
	            return [byteSize >> 8, byteSize & 255].concat(back);
	        }
	    },
	    /**
	     *  把一串字节流按照utf8编码读取出来
	     * @param arr 字节流
	     * @returns {String} 读取出来的字符串
	     */
	    readUTF: function (arr) {
	        if (Object.prototype.toString.call(arr) == "[object String]") {
	            return arr;
	        }
	        var UTF = "",
	            _arr = this.init(arr);
	        for (var i = 0; i < _arr.length; i++) {
	            var one = _arr[i].toString(2),
	                v = one.match(/^1+?(?=0)/);
	            if (v && one.length == 8) {
	                var bytesLength = v[0].length,
	                    store = _arr[i].toString(2).slice(7 - bytesLength);
	                for (var st = 1; st < bytesLength; st++) {
	                    store += _arr[st + i].toString(2).slice(2)
	                }
	                UTF += String.fromCharCode(parseInt(store, 2));
	                i += bytesLength - 1
	            } else {
	                UTF += String.fromCharCode(_arr[i])
	            }
	        }
	        return UTF
	    },
	    /**
	     * 转换成Stream对象
	     * @param x
	     * @returns {TinyStream}
	     */
	    convertStream: function (x) {
	        if (x instanceof TinyStream) {
	            return x
	        } else {
	            return new TinyStream(x)
	        }
	    },
	    /**
	     * 把一段字符串转为mqtt格式
	     * @param str
	     * @returns {*|Array}
	     */
	    toMQttString: function (str) {
	        return this.writeUTF(str)
	    }
	};
	/**
	 * 读取指定长度的字节流到指定数组中
	 * @param {TinyStream} m Stream实例
	 * @param {number} i 读取的长度
	 * @param {Array} a 存入的数组
	 * @returns {Array} 存入的数组
	 */
	function baseRead(m, i, a) {
	    var t = a ? a : [];
	    for (var start = 0; start < i; start++) {
	        t[start] = m.pool[m.position++]
	    }
	    return t
	}
	/**
	 * 判断浏览器是否支持ArrayBuffer
	 */
	var supportArrayBuffer = (function () {
	    return !!window.ArrayBuffer;
	})();
	/**
	 * 字节流处理实体类
	 * @param {String|Array} array 初始化字节流,如果是字符串则按照UTF8的格式写入缓冲区
	 * @constructor
	 */
	function TinyStream(array) {
	    if (!(this instanceof TinyStream)) {
	        return new TinyStream(array);
	    }
	    /**
	     * 字节流缓冲区
	     * @type {Array}
	     */
	    this.pool = [];
	    if (Object.prototype.toString.call(array) === '[object Array]') {
	        this.pool = binaryPot.init(array);
	    } else if (Object.prototype.toString.call(array) == "[object ArrayBuffer]") {
	        var arr = new Int8Array(array);
	        this.pool = binaryPot.init([].slice.call(arr));
	    } else if (typeof array === 'string') {
	        this.pool = binaryPot.writeUTF(array);
	    }
	    var self = this;
	    //当前流执行的起始位置
	    this.position = 0;
	    //当前流写入的多少字节
	    this.writen = 0;
	    //返回当前流执行的起始位置是否已经大于整个流的长度
	    this.check = function () {
	        return self.position >= self.pool.length
	    };
	}
	/**
	 * 强制转换为Stream对象
	 * @param x
	 * @returns {*|TinyStream}
	 */
	TinyStream.parse = function (x) {
	    return binaryPot.convertStream(x);
	};
	TinyStream.toMQTString = function (x) {
	    return binaryPot.toMQttString(x);
	};
	TinyStream.prototype = {
	    /**
	     * 从缓冲区读取4个字节的长度并转换为int值,position往后移4位
	     * @returns {Number} 读取到的数字
	     * @description 如果position大于等于缓冲区的长度则返回-1
	     */
	    readInt: function () {
	        if (this.check()) {
	            return -1
	        }
	        var end = "";
	        for (var i = 0; i < 4; i++) {
	            end += this.pool[this.position++].toString(16)
	        }
	        return parseInt(end, 16);
	    },
	    /**
	     * 从缓冲区读取1个字节,position往后移1位
	     * @returns {Number}
	     * @description 如果position大于等于缓冲区的长度则返回-1
	     */
	    readByte: function () {
	        if (this.check()) {
	            return -1
	        }
	        var val = this.pool[this.position++];
	        if (val > 255) {
	            val &= 255;
	        }
	        return val;
	    },
	    /**
	     * 从缓冲区读取1个字节,或读取指定长度的字节到传入的数组中,position往后移1或bytesArray.length位
	     * @param {Array|undefined} bytesArray
	     * @returns {Array|Number}
	     */
	    read: function (bytesArray) {
	        if (this.check()) {
	            return -1
	        }
	        if (bytesArray) {
	            return baseRead(this, bytesArray.length | 0, bytesArray)
	        } else {
	            return this.readByte();
	        }
	    },
	    /**
	     * 从缓冲区的position位置按UTF8的格式读取字符串,position往后移指定的长度
	     * @returns {String} 读取的字符串
	     */
	    readUTF: function () {
	        var big = (this.readByte() << 8) | this.readByte();
	        return binaryPot.readUTF(this.pool.slice(this.position, this.position += big));
	    },
	    /**
	     * 把字节流写入缓冲区,writen往后移指定的位
	     * @param {Number|Array} _byte 写入缓冲区的字节(流)
	     * @returns {Array} 写入的字节流
	     */
	    write: function (_byte) {
	        var b = _byte;
	        if (Object.prototype.toString.call(b).toLowerCase() == "[object array]") {
	            [].push.apply(this.pool, b);
	            this.writen += b.length;
	        } else {
	            if (+b == b) {
	                if (b > 255) {
	                    b &= 255;
	                }
	                this.pool.push(b);
	                this.writen++
	            }
	        }
	        return b
	    },
	    /**
	     * 把参数当成char类型写入缓冲区,writen往后移2位
	     * @param {Number} v 写入缓冲区的字节
	     */
	    writeChar: function (v) {
	        if (+v != v) {
	            throw new Error("writeChar:arguments type is error")
	        }
	        this.write((v >> 8) & 255);
	        this.write(v & 255);
	        this.writen += 2
	    },
	    /**
	     * 把字符串按照UTF8的格式写入缓冲区,writen往后移指定的位
	     * @param {String} str 字符串
	     * @return {Array} 缓冲区
	     */
	    writeUTF: function (str) {
	        var val = binaryPot.writeUTF(str);
	        [].push.apply(this.pool, val);
	        this.writen += val.length;
	    },
	    /**
	     * 把缓冲区字节流的格式从0至256的区间改为-128至128的区间
	     * @returns {Array} 转换后的字节流
	     */
	    toComplements: function () {
	        var _tPool = this.pool;
	        for (var i = 0; i < _tPool.length; i++) {
	            if (_tPool[i] > 128) {
	                _tPool[i] -= 256
	            }
	        }
	        return _tPool
	    },
	    /**
	     * 获取整个缓冲区的字节
	     * @param {Boolean} isCom 是否转换字节流区间
	     * @returns {Array} 转换后的缓冲区
	     */
	    getBytesArray: function (isCom) {
	        if (isCom) {
	            return this.toComplements()
	        }
	        return this.pool
	    },
	    /**
	     * 把缓冲区的字节流转换为ArrayBuffer
	     * @returns {ArrayBuffer}
	     * @throw {Error} 不支持ArrayBuffer
	     */
	    toArrayBuffer: function () {
	        if (supportArrayBuffer) {
	            return new ArrayBuffer(this.getBytesArray());
	        } else {
	            throw new Error('not support arraybuffer');
	        }
	    },
	    clear: function () {
	        this.pool = [];
	        this.writen = this.position = 0;
	    }
	};
	module.exports = TinyStream;

/***/ },
/* 12 */
/*!************************************!*\
  !*** ./src/core/messageHandler.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var parser = __webpack_require__(/*! ./messageParser */ 13);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var ack = __webpack_require__(/*! ./messageCallback */ 14);
	var tool = __webpack_require__(/*! ../tool */ 2);
	var entity=__webpack_require__(/*! ../message/MessageEntity */ 7);
	var self = null;
	function MessageHandler(client) {
	    if (!mapping._ReceiveMessageListener) {
	        throw new Error("please set onReceiveMessageListener");
	    }
	    self = this;
	    this.context = client;
	    this._map = {};
	    this._onReceived = mapping._ReceiveMessageListener.onReceived;
	    this.connectCallback = null;
	}
	MessageHandler.prototype.putCallback = function (callbackObj, _publishMessageId, _msg) {
	    var item = {
	        Callback: callbackObj,
	        Message: _msg
	    };
	    item.Callback.resumeTimer();
	    this._map[_publishMessageId] = item;
	};
	//设置连接回调对象，启动定时器
	MessageHandler.prototype.setConnectCallback = function (_connectCallback) {
	    if (_connectCallback) {
	        this.connectCallback = new ack.ConnectAck(_connectCallback.onSuccess, _connectCallback.onError, this.context);
	        this.connectCallback.resumeTimer();
	    }
	};
	//处理具体的消息对象
	MessageHandler.prototype.onReceived = function (msg) {
	    //实体对象
	    var entity;
	    if (msg.constructor._name != "PublishMessage") {
	        //如果msg不是一个内置消息对象，直接赋值给实体，进行下一步处理
	        entity = msg;
	        tool.cookieHelper.setItem(this.context.userId, tool.int64ToTimestamp(entity.dataTime));
	    } else {
	        if (msg.getTopic() == "s_ntf") {
	            entity = Modules.NotifyMsg.decode(msg.getData());
	            this.context.syncTime(entity.type, tool.int64ToTimestamp(entity.time));
	            return;
	        } else if (msg.getTopic() == "s_msg") {
	            entity = Modules.DownStreamMessage.decode(msg.getData());
	            tool.cookieHelper.setItem(this.context.userId, tool.int64ToTimestamp(entity.dataTime));
	        } else {
	            return;
	        }
	    }
	    //解析实体对象为消息对象。
	    var message = parser(entity);
	    if (message.getObjectName() in mapping.sysNtf) {
	        this._onReceived(message);
	        return;
	    }
	    //创建会话对象
	    var con = RongIMClient.getInstance().getConversationList().get(message.getConversationType(), message.getTargetId());
	    if (!con) {
	        con = RongIMClient.getInstance().createConversation(message.getConversationType(), message.getTargetId(), "");
	    }
	    //根据messageTag判断是否进行消息数累加
	    if (/ISCOUNTED/.test(message.getMessageTag())) {
	        con.getConversationType() != 0 && con.setUnreadMessageCount(con.getUnreadMessageCount() + 1);
	    }
	    con.setReceivedTime((new Date).getTime());
	    con.setReceivedStatus(new RongIMClient.ReceivedStatus());
	    con.setSenderUserId(message.getSenderUserId());
	    con.setObjectName(message.getObjectName());
	    con.setNotificationStatus(RongIMClient.ConversationNotificationStatus.DO_NOT_DISTURB);
	    con.setLatestMessageId(message.getMessageId());
	    con.setLatestMessage(message);
	    con.setTop();
	    //把消息传递给消息监听器
	    this._onReceived(message);
	};
	//处理通道对象传送过来的内置消息对象
	MessageHandler.prototype.handleMessage = function (msg) {
	    if (!msg) {
	        return
	    }
	    switch (msg.constructor._name) {
	        case "ConnAckMessage":
	            self.connectCallback.process(msg.getStatus(), msg.getUserId());
	            break;
	        case "PublishMessage":
	            if (msg.getQos() != 0) {
	                self.context.channel.writeAndFlush(new entity.PubAckMessage(msg.getMessageId()));
	            }
	            //如果是PublishMessage就把该对象给onReceived方法执行处理
	            self.onReceived(msg);
	            break;
	        case "QueryAckMessage":
	            if (msg.getQos() != 0) {
	                self.context.channel.writeAndFlush(new entity.QueryConMessage(msg.getMessageId()))
	            }
	            var temp = self._map[msg.getMessageId()];
	            if (temp) {
	                //执行回调操作
	                temp.Callback.process(msg.getStatus(), msg.getData(), msg.getDate(), temp.Message);
	                delete self._map[msg.getMessageId()];
	            }
	            break;
	        case "PubAckMessage":
	            var item = self._map[msg.getMessageId()];
	            if (item) {
	                //执行回调操作
	                item.Callback.process(msg.getStatus() || 0, msg.getDate(), item.Message);
	                delete self._map[msg.getMessageId()];
	            }
	            break;
	        case "PingRespMessage":
	            self.context.pauseTimer();
	            break;
	        case "DisconnectMessage":
	            self.context.channel.disconnect(msg.getStatus());
	            break;
	        default:
	    }
	};
	module.exports = MessageHandler;

/***/ },
/* 13 */
/*!***********************************!*\
  !*** ./src/core/messageParser.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by zhangyatao on 16/1/7.
	 */
	
	var com = __webpack_require__(/*! ../mapping */ 3);
	var tool=__webpack_require__(/*! ../tool */ 2);
	//消息转换方法
	function messageParser(entity) {
	    var message, content = entity.content;
	    var result, objectName = entity.classname;
	
	    try {
	        result = JSON.parse(RongBinaryHelper.readUTF(content.offset ? tool.arrayFrom(content.buffer).slice(content.offset, content.limit) : content))
	    } catch (ex) {
	        return null;
	    }
	
	    //处理表情
	    if ("Expression" in RongIMClient && "RC:TxtMsg" == objectName && result.content) {
	        result.content = result.content.replace(/[\uf000-\uf700]/g, function (x) {
	            return RongIMClient.Expression.calcUTF(x) || x;
	        })
	    }
	
	    //映射为具体消息对象
	    if (objectName in com.typeMapping) {
	        message = new RongIMClient[com.typeMapping[objectName]](result);
	    } else if (objectName in com.sysNtf) {
	        message = new RongIMClient[com.sysNtf[objectName]](result);
	    } else if (objectName in com.registerMessageTypeMapping) {
	        //自定义消息
	        message = new RongIMClient[com.registerMessageTypeMapping[objectName]](result);
	    } else {
	        //未知消息
	        message = new RongIMClient.UnknownMessage(result, objectName);
	    }
	
	    //根据实体对象设置message对象
	    message.setSentTime(tool.int64ToTimestamp(entity.dataTime));
	    message.setSenderUserId(entity.fromUserId);
	    message.setConversationType(RongIMClient.ConversationType.setValue(com.mapping[entity.type]));
	    message.setTargetId(/^[234]$/.test(entity.type || entity.getType()) ? entity.groupId : message.getSenderUserId());
	    if (entity.fromUserId == com.userId) {
	        message.setMessageDirection(RongIMClient.MessageDirection.SEND);
	    } else {
	        message.setMessageDirection(RongIMClient.MessageDirection.RECEIVE);
	    }
	    message.setReceivedTime((new Date).getTime());
	    message.setMessageId(message.getConversationType() + "_" + ~~(Math.random() * 0xffffff));
	    message.setReceivedStatus(new RongIMClient.ReceivedStatus());
	    return message;
	}
	module.exports = messageParser;

/***/ },
/* 14 */
/*!*************************************!*\
  !*** ./src/core/messageCallback.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	var tool = __webpack_require__(/*! ../tool */ 2);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var factory = __webpack_require__(/*! ../io/factory */ 15);
	//protobuf映射
	function callbackMapping(entity, tag) {
	    switch (tag) {
	        case "GetUserInfoOutput":
	            var userInfo = new RongIMClient.UserInfo();
	            userInfo.setUserId(entity.userId);
	            userInfo.setUserName(entity.userName);
	            userInfo.setPortraitUri(entity.userPortrait);
	            return userInfo;
	        case "GetQNupTokenOutput":
	            return {
	                deadline: util.int64ToTimestamp(entity.deadline),
	                token: entity.token
	            };
	        case "GetQNdownloadUrlOutput":
	            return {
	                downloadUrl: entity.downloadUrl
	            };
	        case "CreateDiscussionOutput":
	            return entity.id;
	        case "ChannelInfoOutput":
	            var disInfo = new RongIMClient.Discussion();
	            disInfo.setCreatorId(entity.adminUserId);
	            disInfo.setId(entity.channelId);
	            disInfo.setMemberIdList(entity.firstTenUserIds);
	            disInfo.setName(entity.channelName);
	            disInfo.setOpen(RongIMClient.DiscussionInviteStatus.setValue(entity.openStatus));
	            return disInfo;
	        case "GroupHashOutput":
	            return entity.result;
	        case "QueryBlackListOutput":
	            return entity.userIds;
	        default:
	            return entity;
	    }
	}
	function MessageCallback(error) {
	    var timeoutMillis, me = this;
	    this.timeout = null;
	    this.onError = null;
	    if (error && typeof error == "number") {
	        timeoutMillis = error
	    } else {
	        timeoutMillis = 6000;
	        this.onError = error;
	    }
	    this.resumeTimer = function () {
	        if (timeoutMillis > 0 && !this.timeout) {
	            this.timeout = setTimeout(function () {
	                me.readTimeOut(true);
	            }, timeoutMillis)
	        }
	    }
	}
	MessageCallback.prototype = {
	    pauseTimer: function () {
	        if (this.timeout) {
	            clearTimeout(this.timeout);
	            this.timeout = null
	        }
	    }, readTimeOut: function (isTimeout) {
	        if (isTimeout && this.onError) {
	            this.onError(RongIMClient.callback.ErrorCode.TIMEOUT)
	        } else {
	            this.pauseTimer()
	        }
	    }
	};
	//发送PublishMessage消息回调类
	function PublishCallback(cb, _timeout) {
	    MessageCallback.call(this, _timeout);
	    this.done = cb || function () {
	        };
	    this.fail = _timeout || function () {
	        };
	}
	tool.inherit(PublishCallback, MessageCallback);
	PublishCallback.prototype.process = function (_staus, _serverTime, _msg) {
	    this.readTimeOut();
	    if (_staus == 0) {
	        if (_msg) {
	            //把发送的消息发送状态改为已接收
	            _msg.setSentStatus(RongIMClient.SentStatus.RECEIVED)
	        }
	        this.done();
	    } else {
	        this.fail(RongIMClient.SendErrorStatus.setValue(_staus));
	    }
	};
	PublishCallback.prototype.readTimeOut = function (x) {
	    PublishCallback.super_.prototype.readTimeOut.call(this, x)
	};
	
	//发送QueryMessage消息回调类
	function QueryCallback(cb, _timeout) {
	    MessageCallback.call(this, _timeout);
	    this.done = cb || function () {
	        };
	    this.fail = _timeout || function () {
	        };
	}
	tool.inherit(QueryCallback, MessageCallback);
	QueryCallback.prototype.process = function (status, data, serverTime, pbtype) {
	    this.readTimeOut();
	    if (pbtype && data && status == 0) {
	        try {
	            data = callbackMapping(Modules[pbtype].decode(data), pbtype);
	        } catch (e) {
	            this.fail(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
	            return;
	        }
	        if ("GetUserInfoOutput" == pbtype) {
	            //pb类型为GetUserInfoOutput的话就把data放入userinfo缓存队列
	            mapping.userInfoMapping[data.getUserId()] = data;
	        }
	        this.done(data);
	    } else {
	        status > 0 ? this.fail(status) : this.done(status)
	    }
	};
	QueryCallback.prototype.readTimeOut = function (x) {
	    QueryCallback.super_.prototype.readTimeOut.call(this, x)
	};
	
	//连接回调类
	function ConnectAck(cb, _timeout, context) {
	    MessageCallback.call(this, _timeout);
	    this.context = context;
	    this.done = cb || function () {
	        };
	    this.fail = _timeout || function () {
	        };
	}
	tool.inherit(ConnectAck, MessageCallback);
	ConnectAck.prototype.process = function (status, userId) {
	    this.readTimeOut();
	    if (status == 0) {
	        mapping.userId = this.context.userId = userId;
	        if (!RongIMClient.isNotPullMsg) {
	            this.context.syncTime();
	        }
	        if (mapping.reconnectSet.onSuccess) {
	            mapping.reconnectSet.onSuccess(userId);
	            try {
	                delete mapping.reconnectSet.onSuccess;
	            } catch (e) {
	            }
	        } else {
	            this.done(userId);
	        }
	        factory.getInstance().fire("StatusChanged", 0);
	        factory.getInstance()._doQueue()
	    } else if (status == 6) {
	        var that = this;
	        ConnectAck.redirect(this.context.token, this.context.appId, function () {
	            that.context.clearHeartbeat();
	            ConnectAck.redirect();
	            that.context.channel.socket.fire("StatusChanged", 2);
	        }, function () {
	            that.fail();
	        }, false);
	    } else {
	        if (mapping.reconnectSet.onError) {
	            mapping.reconnectSet.onError(RongIMClient.ConnectErrorStatus.setValue(status));
	            delete mapping.reconnectSet.onError;
	        } else {
	            this.fail(RongIMClient.ConnectErrorStatus.setValue(status))
	        }
	    }
	};
	ConnectAck.prototype.readTimeOut = function (x) {
	    ConnectAck.super_.prototype.readTimeOut.call(this, x)
	};
	ConnectAck.redirect = function () {
	};
	
	module.exports = {
	    MessageCallback: MessageCallback,
	    PublishCallback: PublishCallback,
	    QueryCallback: QueryCallback,
	    ConnectAck: ConnectAck
	};

/***/ },
/* 15 */
/*!***************************!*\
  !*** ./src/io/factory.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	//var io = require('./base');
	var util = __webpack_require__(/*! ../tool */ 2);
	var WS = __webpack_require__(/*! ./websocket */ 16);
	var XHR = __webpack_require__(/*! ./polling */ 23);
	var _Transport = {
	    'websocket': WS,
	    'xhr-polling': XHR
	};
	var Socket = function () {
	    this.options = {
	        token: "",
	        transports: ["websocket", "xhr-polling"]//主要有两种(websocket，flashsocket)、comet
	    };
	    this.connected = false;
	    this.connecting = false;
	    this._events = {};
	    this.currentURL = "";
	    this.transport = this.getTransport(util.getTransportType());
	    if (this.transport === null) {
	        throw new Error("the channel was not supported")
	    }
	};
	//此方法用于生产通道对象
	Socket.prototype.getTransport = function (override) {
	    var i = 0,
	        transport = override || this.options.transports[i];
	    if (_Transport[transport] && _Transport[transport].check() && _Transport[transport].XDomainCheck()) {
	        return new _Transport[transport](this, {})
	    }
	    return null;
	};
	//连接服务器
	Socket.prototype.connect = function (url, cb) {
	    if (this.transport && arguments.length == 2) {
	        if (url) {
	            this.on("connect", cb || function () {
	                })
	        }
	        if (this.connecting || this.connected) {
	            this.disconnect()
	        }
	        this.connecting = true;
	        if (url) {
	            this.currentURL = url
	        }
	        this.transport.connect(this.currentURL); //是否重连
	    }
	    return this
	};
	Socket.prototype.send = function (data) {
	    if (!this.transport || !this.connected) {
	        //如果通道不可用，把消息压入队列中，等到通道可用时处理
	        return this._queue(data)
	    }
	    this.transport.send(data)
	};
	Socket.prototype.disconnect = function (callback) {
	    if (callback) {
	        //出发状态改变观察者
	        this.fire("StatusChanged", callback)
	    }
	    this.transport.disconnect();
	    return this;
	};
	Socket.prototype.reconnect = function () {
	    if (this.currentURL) {
	        return this.connect(null, null);
	    } else {
	        throw new Error("reconnect:no have URL");
	    }
	};
	Socket.prototype.fire = function (x, args) {
	    if (x in this._events) {
	        for (var i = 0, ii = this._events[x].length; i < ii; i++) {
	            this._events[x][i](args);
	        }
	    }
	    return this
	};
	Socket.prototype.removeEvent = function (x, fn) {
	    if (x in this._events) {
	        for (var a = 0, l = this._events[x].length; a < l; a++) {
	            if (this._events[x][a] == fn) {
	                this._events[x].splice(a, 1)
	            }
	        }
	    }
	    return this
	};
	Socket.prototype._queue = function (message) {
	    if (!("_queueStack" in this)) {
	        this._queueStack = []
	    }
	    this._queueStack.push(message);
	    return this
	};
	Socket.prototype._doQueue = function () {
	    if (!("_queueStack" in this) || !this._queueStack.length) {
	        return this
	    }
	    for (var i = 0; i < this._queueStack.length; i++) {
	        this.transport.send(this._queueStack[i])
	    }
	    this._queueStack = [];
	    return this
	};
	Socket.prototype._onConnect = function () {
	    this.connected = true;
	    this.connecting = false;
	    util.cookieHelper.setItem("rongSDK",util.getTransportType());
	    this.fire("connect");
	};
	Socket.prototype._onMessage = function (data) {
	    this.fire("message", data)
	};
	Socket.prototype._onDisconnect = function () {
	    var wasConnected = this.connected;
	    this.connected = false;
	    this.connecting = false;
	    this._queueStack = [];
	    if (wasConnected) {
	        this.fire("disconnect")
	    }
	};
	//注册观察者
	Socket.prototype.on = function (x, func) {
	    if (!(typeof func == "function" && x)) {
	        return this
	    }
	    if (x in this._events) {
	        util.indexOf(this._events, func) == -1 && this._events[x].push(func)
	    } else {
	        this._events[x] = [func];
	    }
	    return this
	};
	
	var connect = function (token, args) {
	    var instance = new Socket();
	    connect.getInstance = function () {
	        return instance
	    };
	    instance.connect(token, args);
	    return instance;
	};
	
	module.exports = connect;

/***/ },
/* 16 */
/*!*****************************!*\
  !*** ./src/io/websocket.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Transport = __webpack_require__(/*! ./base */ 17);
	var util = __webpack_require__(/*! ../tool */ 2);
	var tinyStream = __webpack_require__(/*! ../binary */ 11);
	var IOStream = __webpack_require__(/*! ../message/throttleStream */ 22);
	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var WS = Transport.websocket = function () {
	    Transport.apply(this, arguments)
	};
	util.inherit(WS, Transport);
	WS.prototype.type = "websocket";
	WS.prototype.connect = function (url) {
	    var self = this;
	    //操作html5 websocket API
	    this.socket = new WebSocket("ws://" + url);
	    this.socket.binaryType = "arraybuffer";
	    this.socket.onopen = function () {
	        self._onConnect();
	    };
	    this.socket.onmessage = function (ev) {
	        //判断数据是不是字符串，如果是字符串那么就是flash传过来的。
	        if (typeof ev.data == "string") {
	            self._decode(ev.data.split(","))
	        } else {
	            self._decode(ev.data)
	        }
	    };
	    this.socket.onclose = function () {
	        self._onClose()
	    };
	    this.socket.onerror = function () {
	        //当websocket执行出错的时候，判断是否已经注册了重连对象。有的话就执行重连对象的onError，没有的话主动抛出一个错误
	        if (mapping.reconnectSet.onError) {
	            mapping.reconnectSet.onError(RongIMClient.ConnectErrorStatus.setValue(2));
	            delete mapping.reconnectSet.onError;
	        } else {
	            throw new Error("network is unavailable or unknown error");
	        }
	    };
	    return this
	};
	//发送数据到服务器
	WS.prototype.send = function (data) {
	    var stream = new tinyStream([]),
	        msg = new IOStream.MessageOutputStream(stream);
	    msg.writeMessage(data);
	    var val = stream.getBytesArray(true);
	    if (this.socket.readyState == 1) {
	        if (util.getType(global.Int8Array) === 'Function' && !mapping.globalConf.WEB_SOCKET_FORCE_FLASH) {
	            //Int8Array为html5 API
	            var binary = new Int8Array(val);
	            this.socket.send(binary.buffer)
	        } else {
	            this.socket.send(val + "")
	        }
	    }
	    return this
	};
	WS.prototype.disconnect = function () {
	    if (this.socket) {
	        this.socket.close()
	    }
	    return this
	};
	WS.prototype._onClose = function () {
	    this._onDisconnect();
	    return this
	};
	WS.check = function () {
	    return "WebSocket" in global && WebSocket.prototype && WebSocket.prototype.send && typeof WebSocket !== "undefined"
	};
	WS.XDomainCheck = function () {
	    return true;
	};
	module.exports = WS;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 17 */
/*!************************!*\
  !*** ./src/io/base.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(/*! ../tool */ 2);
	var IOstream = __webpack_require__(/*! ../Message/throttleStream */ 18);
	var mapping=__webpack_require__(/*! ../mapping */ 3);
	var global = window;
	//获取消息id标识符对象，如果是comet消息通道就将messageid放入本地存储(localstorage或cookie)中。其他消息通道则放入内存中。
	
	var Transport = function (base, options) {
	    this.base = base;
	    this.options = {
	        timeout: 30000
	    };
	    util.merge(this.options, options)
	};
	Transport.prototype.send = function () {
	    throw new Error("No rewrite send() method")
	};
	Transport.prototype.connect = function () {
	    throw new Error("No rewrite connect() method")
	};
	Transport.prototype.disconnect = function () {
	    throw new Error("No rewrite disconnect() method")
	};
	//此方法只有comet用到
	Transport.prototype._encode = function (x) {
	    var str = "?messageid=" + x.getMessageId() + "&header=" + x.getHeaderFlag() + "&sessionid=" + util.cookieHelper.getItem(mapping.Endpoint.userId + "sId");
	    if (!/(PubAckMessage|QueryConMessage)/.test(x.constructor._name)) {
	        str += "&topic=" + x.getTopic() + "&targetid=" + (x.getTargetId() || "");
	    }
	    return {
	        url: str,
	        data: "getData" in x ? x.getData() : ""
	    };
	};
	//转化服务器返回的二进制数组为一个具体的消息对象
	Transport.prototype._decode = function (data) {
	    if (!data) {
	        return;
	    }
	    if (util.isArray(data)) {
	        this._onMessage(new IOstream.MessageInputStream(data).readMessage());
	    } else if (util.getType(data) === "ArrayBuffer") {
	        this._onMessage(new IOstream.MessageInputStream(util.arrayFrom(data)).readMessage());
	    }
	};
	//此方法只有comet用到。接收服务器返回的json对象
	Transport.prototype._onData = function (data, header) {
	    if (!data || data == "lost params") {
	        return;
	    }
	    if (header) {
	        util.cookieHelper.getItem(mapping.Endpoint.userId + "sId") || util.cookieHelper.setItem(mapping.Endpoint.userId + "sId", header);
	    }
	    var self = this, val = util.JSON.parse(data);
	    if (!util.isArray(val)) {
	        val = [val];
	    }
	    util.forEach(val, function (x) {
	        self._onMessage(new IOstream.MessageInputStream(x, true).readMessage());
	    });
	};
	Transport.prototype._onMessage = function (message) {
	    this.base._onMessage(message)
	};
	Transport.prototype._onConnect = function () {
	    this.connected = true;
	    this.connecting = false;
	    this.base._onConnect()
	};
	Transport.prototype._onDisconnect = function () {
	    this.connecting = false;
	    this.connected = false;
	    this.base._onDisconnect()
	};
	Transport.prototype._baseConnect = function () {
	    this.base.connect(null, null);
	};
	
	module.exports = Transport;

/***/ },
/* 18 */
/*!***************************************!*\
  !*** ./src/Message/throttleStream.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var Message = __webpack_require__(/*! ./Message */ 19);
	var eneity = __webpack_require__(/*! ./MessageEntity */ 21);
	
	function output(_out) {
	    var out = TinyStream.parse(_out);
	    this.writeMessage = function (msg) {
	        if (msg instanceof Message.Message) {
	            msg.write(out)
	        }
	    }
	}
	//converted input stream to message object ,that was server send to client，把服务器返回的二进制流生成具体的消息对象
	function input(In, isPolling) {
	    var flags, header, msg = null;
	    if (!isPolling) {
	        var _in = TinyStream.parse(In);
	        flags = _in.readByte();
	    } else {
	        flags = In["headerCode"];
	    }
	    header = new Message.Header(flags);
	    this.readMessage = function () {
	        switch (+header.getType()) {
	            case 2:
	                msg = new eneity.ConnAckMessage(header);
	                break;
	            case 3:
	                msg = new eneity.PublishMessage(header);
	                break;
	            case 4:
	                msg = new eneity.PubAckMessage(header);
	                break;
	            case 5:
	                msg = new eneity.QueryMessage(header);
	                break;
	            case 6:
	                msg = new eneity.QueryAckMessage(header);
	                break;
	            case 7:
	                msg = new eneity.QueryConMessage(header);
	                break;
	            case 9:
	            case 11:
	            case 13:
	                msg = new eneity.PingRespMessage(header);
	                break;
	            case 1:
	                msg = new eneity.ConnectMessage(header);
	                break;
	            case 8:
	            case 10:
	            case 12:
	                msg = new eneity.PingReqMessage(header);
	                break;
	            case 14:
	                msg = new eneity.DisconnectMessage(header);
	                break;
	            default:
	                throw new Error("No support for deserializing " + header.getType() + " messages")
	        }
	        if (isPolling) {
	            msg.init(In);
	        } else {
	            msg.read(_in, In.length - 1);
	        }
	        return msg
	    }
	}
	module.exports = {
	    MessageOutputStream: output,
	    MessageInputStream: input
	};

/***/ },
/* 19 */
/*!********************************!*\
  !*** ./src/Message/Message.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 消息类，对java逻辑的重新实现
	 * */
	var e = __webpack_require__(/*! ./msgEnum */ 20);
	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var Qos = e.Qos;
	var Type = e.Type;
	function Message(argu) {
	    var _header, _headerCode, lengthSize = 0;
	    if (argu instanceof Header) {
	        _header = argu
	    } else {
	        _header = new Header(argu, false, Qos.AT_MOST_ONCE, false)
	    }
	    this.write = function (Out) {
	        var out = TinyStream.parse(Out);
	        _headerCode = this.getHeaderFlag();
	        out.write(_headerCode);
	        this.writeMessage(out);
	        return out
	    };
	    this.getHeaderFlag = function () {
	        return _header.encode();
	    };
	    this.getLengthSize = function () {
	        return lengthSize
	    };
	    this.setRetained = function (retain) {
	        _header.retain = retain
	    };
	    this.isRetained = function () {
	        return _header.retain
	    };
	    this.setQos = function (qos) {
	        _header.qos = qos instanceof Qos ? qos : Qos.setValue(qos);
	    };
	    this.getQos = function () {
	        return _header.qos
	    };
	    this.setDup = function (dup) {
	        _header.dup = dup
	    };
	    this.isDup = function () {
	        return _header.dup
	    };
	    this.getType = function () {
	        return _header.type
	    };
	}
	Message._name = "Message";
	Message.prototype = {
	    read: function (In, length) {
	        this.readMessage(In, length)
	    },
	    toBytes: function () {
	        return this.write([]).getBytesArray()
	    }, messageLength: function () {
	        return 0
	    }, writeMessage: function (out) {
	    }, readMessage: function (In) {
	    }, init: function (args) {
	        var valName, nana;
	        for (nana in args) {
	            if (!args.hasOwnProperty(nana))
	                continue;
	            valName = nana.replace(/^\w/, function (x) {
	                var tt = x.charCodeAt(0);
	                return 'set' + (tt >= 0x61 ? String.fromCharCode(tt & ~32) : x)
	            });
	            if (valName in this) {
	                this[valName](args[nana])
	            }
	        }
	    }
	};
	function Header(_type, _retain, _qos, _dup) {
	    this.type = null;
	    this.retain = false;
	    this.qos = Qos.AT_LEAST_ONCE;
	    this.dup = false;
	    if (_type && +_type == _type && arguments.length == 1) {
	        this.retain = (_type & 1) > 0;
	        this.qos = Qos.setValue((_type & 6) >> 1);
	        this.dup = (_type & 8) > 0;
	        this.type = Type.setValue((_type >> 4) & 15);
	    } else {
	        this.type = Type.setValue(_type);
	        this.retain = _retain;
	        this.qos = Qos.setValue(_qos);
	        this.dup = _dup;
	    }
	}
	Header.prototype = {
	    getType: function () {
	        return this.type
	    }, encode: function () {
	        var _byte = (this.type << 4);
	        _byte |= this.retain ? 1 : 0;
	        _byte |= this.qos << 1;
	        _byte |= this.dup ? 8 : 0;
	        return _byte
	    }, toString: function () {
	        return "Header [type=" + this.type + ",retain=" + this.retain + ",qos=" + this.qos + ",dup=" + this.dup + "]"
	    }
	};
	module.exports = {
	    Message: Message,
	    Header: Header
	};

/***/ },
/* 20 */
/*!********************************!*\
  !*** ./src/Message/msgEnum.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	var myEnum = __webpack_require__(/*! ../enum */ 10);
	var Qos = myEnum({AT_MOST_ONCE: 0, AT_LEAST_ONCE: 1, EXACTLY_ONCE: 2, DEFAULT: 3}),
	    Type = myEnum({
	        CONNECT: 1,
	        CONNACK: 2,
	        PUBLISH: 3,
	        PUBACK: 4,
	        QUERY: 5,
	        QUERYACK: 6,
	        QUERYCON: 7,
	        SUBSCRIBE: 8,
	        SUBACK: 9,
	        UNSUBSCRIBE: 10,
	        UNSUBACK: 11,
	        PINGREQ: 12,
	        PINGRESP: 13,
	        DISCONNECT: 14
	    }),
	    DisconnectionStatus = myEnum({
	        RECONNECT: 0,
	        OTHER_DEVICE_LOGIN: 1,
	        CLOSURE: 2,
	        UNKNOWN_ERROR: 3,
	        LOGOUT: 4,
	        BLOCK: 5
	    }),
	    ConnectionState = myEnum({
	        ACCEPTED: 0,
	        UNACCEPTABLE_PROTOCOL_VERSION: 1,
	        IDENTIFIER_REJECTED: 2,
	        SERVER_UNAVAILABLE: 3,
	        TOKEN_INCORRECT: 4,
	        NOT_AUTHORIZED: 5,
	        REDIRECT: 6,
	        PACKAGE_ERROR: 7,
	        APP_BLOCK_OR_DELETE: 8,
	        BLOCK: 9,
	        TOKEN_EXPIRE: 10,
	        DEVICE_ERROR: 11
	    });
	module.exports = {
	    Qos: Qos,
	    Type: Type,
	    DisconnectionStatus: DisconnectionStatus,
	    ConnectionState: ConnectionState
	};


/***/ },
/* 21 */
/*!**************************************!*\
  !*** ./src/Message/MessageEntity.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var msg = __webpack_require__(/*! ./Message */ 19);
	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var e = __webpack_require__(/*! ./msgEnum */ 20);
	var util = __webpack_require__(/*! ../tool */ 2);
	var Message = msg.Message;
	var Header = msg.Header;
	var Type = e.Type;
	var ConnectionState = e.ConnectionState;
	var DisconnectionStatus = e.DisconnectionStatus;
	function ConnectMessage() {
	    var CONNECT_HEADER_SIZE = 12,
	        protocolId = "RCloud",
	        protocolVersion = 3,
	        clientId, keepAlive, appId, token, cleanSession, willTopic, will, willQos, retainWill, hasAppId, hasToken, hasWill;
	    switch (arguments.length) {
	        case 0:
	            Message.call(this, Type.CONNECT);
	            break;
	        case 1:
	            Message.call(this, arguments[0]);
	            break;
	        case 3:
	            Message.call(this, Type.CONNECT);
	            if (!arguments[0] || arguments[0].length > 64) {
	                throw new Error("ConnectMessage:Client Id cannot be null and must be at most 64 characters long: " + arguments[0])
	            }
	            clientId = arguments[0];
	            cleanSession = arguments[1];
	            keepAlive = arguments[2];
	            break
	    }
	    this.messageLength = function () {
	        var payloadSize = TinyStream.toMQTString(clientId).length;
	        payloadSize += TinyStream.toMQTString(willTopic).length;
	        payloadSize += TinyStream.toMQTString(will).length;
	        payloadSize += TinyStream.toMQTString(appId).length;
	        payloadSize += TinyStream.toMQTString(token).length;
	        return payloadSize + CONNECT_HEADER_SIZE
	    };
	    this.readMessage = function (In) {
	        var stream = TinyStream.parse(In);
	        protocolId = stream.readUTF();
	        protocolVersion = stream.readByte();
	        var cFlags = stream.readByte();
	        hasAppId = (cFlags & 128) > 0;
	        hasToken = (cFlags & 64) > 0;
	        retainWill = (cFlags & 32) > 0;
	        willQos = cFlags >> 3 & 3;
	        hasWill = (cFlags & 4) > 0;
	        cleanSession = (cFlags & 32) > 0;
	        keepAlive = stream.read() * 256 + stream.read();
	        clientId = stream.readUTF();
	        if (hasWill) {
	            willTopic = stream.readUTF();
	            will = stream.readUTF()
	        }
	        if (hasAppId) {
	            try {
	                appId = stream.readUTF()
	            } catch (ex) {
	            }
	        }
	        if (hasToken) {
	            try {
	                token = stream.readUTF()
	            } catch (ex) {
	            }
	        }
	        return stream
	    };
	    this.writeMessage = function (out) {
	        var stream = TinyStream.parse(out);
	        stream.writeUTF(protocolId);
	        stream.write(protocolVersion);
	        var flags = cleanSession ? 2 : 0;
	        flags |= hasWill ? 4 : 0;
	        flags |= willQos ? willQos >> 3 : 0;
	        flags |= retainWill ? 32 : 0;
	        flags |= hasToken ? 64 : 0;
	        flags |= hasAppId ? 128 : 0;
	        stream.write(flags);
	        stream.writeChar(keepAlive);
	        stream.writeUTF(clientId);
	        if (hasWill) {
	            stream.writeUTF(willTopic);
	            stream.writeUTF(will)
	        }
	        if (hasAppId) {
	            stream.writeUTF(appId)
	        }
	        if (hasToken) {
	            stream.writeUTF(token)
	        }
	        return stream
	    };
	}
	ConnectMessage._name = "ConnectMessage";
	util.inherit(ConnectMessage, Message, true);
	function ConnAckMessage() {
	    var status, userId, MESSAGE_LENGTH = 2;
	    switch (arguments.length) {
	        case 0:
	            Message.call(this, Type.CONNACK);
	            break;
	        case 1:
	            if (arguments[0] instanceof Header) {
	                Message.call(this, arguments[0])
	            } else {
	                if (arguments[0] instanceof ConnectionState) {
	                    Message.call(this, Type.CONNACK);
	                    if (arguments[0] == null) {
	                        throw new Error("ConnAckMessage:The status of ConnAskMessage can't be null")
	                    }
	                    status = arguments[0]
	                }
	            }
	    }
	    this.messageLength = function () {
	        var length = MESSAGE_LENGTH;
	        if (userId) {
	            length += TinyStream.toMQTString(userId).length
	        }
	        return length
	    };
	    this.readMessage = function (In, msglength) {
	        var stream = TinyStream.parse(In);
	        stream.read();
	        var result = +stream.read();
	        if (result >= 0 && result <= 9) {
	            this.setStatus(result);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + result)
	        }
	        if (msglength > MESSAGE_LENGTH) {
	            this.setUserId(stream.readUTF())
	        }
	    };
	    this.writeMessage = function (out) {
	        var stream = TinyStream.parse(out);
	        stream.write(128);
	        switch (+status) {
	            case 0:
	            case 1:
	            case 2:
	            case 5:
	            case 6:
	                stream.write(+status);
	                break;
	            case 3:
	            case 4:
	                stream.write(3);
	                break;
	            default:
	                throw new Error("Unsupported CONNACK code:" + status);
	        }
	        if (userId) {
	            stream.writeUTF(userId)
	        }
	        return stream
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.setStatus = function (x) {
	        status = x instanceof ConnectionState ? x : ConnectionState.setValue(x);
	    };
	    this.setUserId = function (_userId) {
	        userId = _userId
	    };
	    this.getUserId = function () {
	        return userId
	    };
	}
	ConnAckMessage._name = "ConnAckMessage";
	util.inherit(ConnAckMessage, Message, true);
	function DisconnectMessage(one) {
	    var status;
	    this.MESSAGE_LENGTH = 2;
	    if (one instanceof Header) {
	        Message.call(this, one)
	    } else {
	        Message.call(this, Type.DISCONNECT);
	        if (one instanceof DisconnectionStatus) {
	            status = one
	        }
	    }
	    this.messageLength = function () {
	        return this.MESSAGE_LENGTH
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In);
	        _in.read();
	        var result = +_in.read();
	        if (result >= 0 && result <= 5) {
	            this.setStatus(result);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + result)
	        }
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.write(0);
	        if (+status >= 1 && +status <= 3) {
	            out.write((+status) - 1);
	        } else {
	            throw new Error("Unsupported CONNACK code:" + status)
	        }
	    };
	    this.setStatus = function (x) {
	        status = x instanceof DisconnectionStatus ? x : DisconnectionStatus.setValue(x);
	    };
	    this.getStatus = function () {
	        return status
	    };
	}
	DisconnectMessage._name = "DisconnectMessage";
	util.inherit(DisconnectMessage, Message, true);
	function PingReqMessage(header) {
	    if (header && header instanceof Header) {
	        Message.call(this, header)
	    } else {
	        Message.call(this, Type.PINGREQ)
	    }
	}
	PingReqMessage._name = "PingReqMessage";
	util.inherit(PingReqMessage, Message, true);
	function PingRespMessage(header) {
	    if (header && header instanceof Header) {
	        Message.call(this, header)
	    } else {
	        Message.call(this, Type.PINGRESP)
	    }
	}
	PingRespMessage._name = "PingRespMessage";
	util.inherit(PingRespMessage, Message, true);
	function RetryableMessage(argu) {
	    var messageId;
	    Message.call(this, argu);
	    this.messageLength = function () {
	        return 2
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out),
	            Id = this.getMessageId(),
	            lsb = Id & 255,
	            msb = (Id & 65280) >> 8;
	        out.write(msb);
	        out.write(lsb);
	        return out
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In),
	            msgId = _in.read() * 256 + _in.read();
	        this.setMessageId(parseInt(msgId, 10));
	    };
	    this.setMessageId = function (_messageId) {
	        messageId = _messageId
	    };
	    this.getMessageId = function () {
	        return messageId
	    }
	}
	RetryableMessage._name = "RetryableMessage";
	util.inherit(RetryableMessage, Message, true);
	function PubAckMessage(args) {
	    var status, msgLen = 2,
	        date = 0;
	    if (args instanceof Header) {
	        RetryableMessage.call(this, args)
	    } else {
	        RetryableMessage.call(this, Type.PUBACK);
	        this.setMessageId(args)
	    }
	    this.messageLength = function () {
	        return msgLen
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        PubAckMessage.prototype.writeMessage.call(this, out)
	    };
	    this.readMessage = function (In) {
	        var _in = TinyStream.parse(In);
	        PubAckMessage.prototype.readMessage.call(this, _in);
	        date = _in.readInt();
	        status = _in.read() * 256 + _in.read()
	    };
	    this.setStatus = function (x) {
	        status = x;
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.getDate = function () {
	        return date
	    };
	}
	PubAckMessage._name = "PubAckMessage";
	util.inherit(PubAckMessage, RetryableMessage, true);
	function PublishMessage(one, two, three) {
	    var topic, data, targetId, date;
	    if (arguments.length == 1 && one instanceof Header) {
	        RetryableMessage.call(this, one)
	    } else {
	        if (arguments.length == 3) {
	            RetryableMessage.call(this, Type.PUBLISH);
	            topic = one;
	            targetId = three;
	            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
	        }
	    }
	    this.messageLength = function () {
	        var length = 10;
	        length += TinyStream.toMQTString(topic).length;
	        length += TinyStream.toMQTString(targetId).length;
	        length += data.length;
	        return length
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.writeUTF(topic);
	        out.writeUTF(targetId);
	        PublishMessage.prototype.writeMessage.apply(this, arguments);
	        out.write(data)
	    };
	    this.readMessage = function (In, msgLength) {
	        var pos = 6,
	            _in = TinyStream.parse(In);
	        date = _in.readInt();
	        topic = _in.readUTF();
	        pos += TinyStream.toMQTString(topic).length;
	        PublishMessage.prototype.readMessage.apply(this, arguments);
	        data = new Array(msgLength - pos);
	        _in.read(data)
	    };
	    this.setTopic = function (x) {
	        topic = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.setTargetId = function (x) {
	        targetId = x;
	    };
	    this.setDate = function (x) {
	        date = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.getTopic = function () {
	        return topic
	    };
	    this.getData = function () {
	        return data
	    };
	    this.getTargetId = function () {
	        return targetId
	    };
	    this.getDate = function () {
	        return date
	    }
	}
	PublishMessage._name = "PublishMessage";
	util.inherit(PublishMessage, RetryableMessage, true);
	function QueryMessage(one, two, three) {
	    var topic, data, targetId;
	    if (one instanceof Header) {
	        RetryableMessage.call(this, one)
	    } else {
	        if (arguments.length == 3) {
	            RetryableMessage.call(this, Type.QUERY);
	            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
	            topic = one;
	            targetId = three;
	        }
	    }
	    this.messageLength = function () {
	        var length = 0;
	        length += TinyStream.toMQTString(topic).length;
	        length += TinyStream.toMQTString(targetId).length;
	        length += 2;
	        length += data.length;
	        return length
	    };
	    this.writeMessage = function (Out) {
	        var out = TinyStream.parse(Out);
	        out.writeUTF(topic);
	        out.writeUTF(targetId);
	        this.constructor.prototype.writeMessage.call(this, out);
	        out.write(data)
	    };
	    this.readMessage = function (In, msgLength) {
	        var pos = 0,
	            _in = TinyStream.parse(In);
	        topic = _in.readUTF();
	        targetId = _in.readUTF();
	        pos += TinyStream.toMQTString(topic).length;
	        pos += TinyStream.toMQTString(targetId).length;
	        this.constructor.prototype.readMessage.apply(this, arguments);
	        pos += 2;
	        data = new Array(msgLength - pos);
	        _in.read(data)
	    };
	    this.setTopic = function (x) {
	        topic = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.setTargetId = function (x) {
	        targetId = x;
	    };
	    this.getTopic = function () {
	        return topic
	    };
	    this.getData = function () {
	        return data
	    };
	    this.getTargetId = function () {
	        return targetId
	    };
	}
	QueryMessage._name = "QueryMessage";
	util.inherit(QueryMessage, RetryableMessage, true);
	function QueryConMessage(messageId) {
	    if (messageId instanceof Header) {
	        RetryableMessage.call(this, messageId)
	    } else {
	        RetryableMessage.call(this, Type.QUERYCON);
	        this.setMessageId(messageId)
	    }
	}
	QueryConMessage._name = "QueryConMessage";
	util.inherit(QueryConMessage, RetryableMessage, true);
	function QueryAckMessage(header) {
	    var data, status, date;
	    RetryableMessage.call(this, header);
	    this.readMessage = function (In, msgLength) {
	        var _in = TinyStream.parse(In);
	        QueryAckMessage.prototype.readMessage.call(this, _in);
	        date = _in.readInt();
	        status = _in.read() * 256 + _in.read();
	        if (msgLength > 0) {
	            data = new Array(msgLength - 8);
	            _in.read(data)
	        }
	    };
	    this.getStatus = function () {
	        return status
	    };
	    this.getDate = function () {
	        return date
	    };
	    this.setDate = function (x) {
	        date = x;
	    };
	    this.setStatus = function (x) {
	        status = x;
	    };
	    this.setData = function (x) {
	        data = x;
	    };
	    this.getData = function () {
	        return data
	    };
	}
	QueryAckMessage._name = "QueryAckMessage";
	util.inherit(QueryAckMessage, RetryableMessage, true);
	module.exports = {
	    ConnectMessage: ConnectMessage,
	    ConnAckMessage: ConnAckMessage,
	    DisconnectMessage: DisconnectMessage,
	    PingReqMessage: PingReqMessage,
	    PingRespMessage: PingRespMessage,
	    RetryableMessage: RetryableMessage,
	    PubAckMessage: PubAckMessage,
	    PublishMessage: PublishMessage,
	    QueryMessage: QueryMessage,
	    QueryConMessage: QueryConMessage,
	    QueryAckMessage: QueryAckMessage
	};
	


/***/ },
/* 22 */
/*!***************************************!*\
  !*** ./src/message/throttleStream.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	var TinyStream = __webpack_require__(/*! ../binary */ 11);
	var Message = __webpack_require__(/*! ./Message */ 8);
	var eneity = __webpack_require__(/*! ./MessageEntity */ 7);
	
	function output(_out) {
	    var out = TinyStream.parse(_out);
	    this.writeMessage = function (msg) {
	        if (msg instanceof Message.Message) {
	            msg.write(out)
	        }
	    }
	}
	//converted input stream to message object ,that was server send to client，把服务器返回的二进制流生成具体的消息对象
	function input(In, isPolling) {
	    var flags, header, msg = null;
	    if (!isPolling) {
	        var _in = TinyStream.parse(In);
	        flags = _in.readByte();
	    } else {
	        flags = In["headerCode"];
	    }
	    header = new Message.Header(flags);
	    this.readMessage = function () {
	        switch (+header.getType()) {
	            case 2:
	                msg = new eneity.ConnAckMessage(header);
	                break;
	            case 3:
	                msg = new eneity.PublishMessage(header);
	                break;
	            case 4:
	                msg = new eneity.PubAckMessage(header);
	                break;
	            case 5:
	                msg = new eneity.QueryMessage(header);
	                break;
	            case 6:
	                msg = new eneity.QueryAckMessage(header);
	                break;
	            case 7:
	                msg = new eneity.QueryConMessage(header);
	                break;
	            case 9:
	            case 11:
	            case 13:
	                msg = new eneity.PingRespMessage(header);
	                break;
	            case 1:
	                msg = new eneity.ConnectMessage(header);
	                break;
	            case 8:
	            case 10:
	            case 12:
	                msg = new eneity.PingReqMessage(header);
	                break;
	            case 14:
	                msg = new eneity.DisconnectMessage(header);
	                break;
	            default:
	                throw new Error("No support for deserializing " + header.getType() + " messages")
	        }
	        if (isPolling) {
	            msg.init(In);
	        } else {
	            msg.read(_in, In.length - 1);
	        }
	        return msg
	    }
	}
	module.exports = {
	    MessageOutputStream: output,
	    MessageInputStream: input
	};

/***/ },
/* 23 */
/*!***************************!*\
  !*** ./src/io/polling.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	var Transport = __webpack_require__(/*! ./base */ 17);
	var util = __webpack_require__(/*! ../tool */ 2);
	var mapping=__webpack_require__(/*! ../mapping */ 3);
	var global = window;
	var empty = new Function;
	//利用withCredentials判断是否支持跨域操作
	var XMLHttpRequestCORS = (function () {
	    if (!('XMLHttpRequest' in global))
	        return false;
	    var a = new XMLHttpRequest();
	    return a.withCredentials !== undefined;
	})();
	//生成跨域传输对象
	var request = function () {
	    if ('XDomainRequest' in global)
	        return new global["XDomainRequest"]();
	    if ('XMLHttpRequest' in global && XMLHttpRequestCORS)
	        return new XMLHttpRequest();
	    return false;
	};
	var XHR = Transport.XHR = function () {
	    Transport.apply(this, arguments);
	};
	util.inherit(XHR, Transport);
	//comet链接服务器，先从本地存储对象里是否存有当前登陆人员的sessionid，如果有的话就不再从服务器申请sessionid，直接用本地存储的sessionid链接服务器。
	XHR.prototype.connect = function (url) {
	    var sid = util.cookieHelper.getItem(mapping.Endpoint.userId + "sId"),
	        _that = this;
	    if (sid) {
	        //io.getInstance().currentURL = url;
	        setTimeout(function () {
	            _that.onopen("{\"status\":0,\"userId\":\"" + mapping.Endpoint.userId + "\",\"headerCode\":32,\"messageId\":0,\"sessionid\":\"" + sid + "\"}");
	            _that._onConnect();
	        }, 500);
	        return this;
	    }
	    this._get(url);
	    return this;
	};
	XHR.prototype._checkSend = function (data) {
	    //格式化数据为comet指定的数据格式，然后发送
	    var encoded = this._encode(data);
	    this._send(encoded);
	};
	XHR.prototype.send = function (data) {
	    this._checkSend(data);
	    return this;
	};
	//利用post方法发送数据，有数据返回就执行_onData(responseText)方法
	XHR.prototype._send = function (data) {
	    var self = this;
	    this._sendXhr = this._request(mapping.Endpoint.host + "/websocket" + data.url, 'POST');
	    if ("onload" in this._sendXhr) {
	        this._sendXhr.onload = function () {
	            this.onload = empty;
	            self._onData(this.responseText);
	        };
	        this._sendXhr.onerror = function () {
	            this.onerror = empty;
	        };
	    } else {
	        this._sendXhr.onreadystatechange = function () {
	            if (this.readyState == 4) {
	                this.onreadystatechange = empty;
	                if (/^(202|200)$/.test(this.status)) {
	                    self._onData(this.responseText);
	                }
	            }
	        };
	    }
	    this._sendXhr.send(util.JSON.stringify(data.data));
	};
	XHR.prototype.disconnect = function () {
	    this._onDisconnect();
	    return this;
	};
	//断开连接，强制中止所有正在连接的http请求
	XHR.prototype._onDisconnect = function (isrecon) {
	    if (this._xhr) {
	        this._xhr.onreadystatechange = this._xhr.onload = empty;
	        this._xhr.abort();
	        this._xhr = null;
	    }
	    if (this._sendXhr) {
	        this._sendXhr.onreadystatechange = this._sendXhr.onload = empty;
	        this._sendXhr.abort();
	        this._sendXhr = null;
	    }
	    if (isrecon === undefined) {
	        Transport.prototype._onDisconnect.call(this);
	    }
	};
	//打开跨域请求对象
	XHR.prototype._request = function (url, method, multipart) {
	    var req = request();
	    if (multipart)
	        req.multipart = true;
	    req.open(method || 'GET', "http://" + url);
	    if (method == 'POST' && 'setRequestHeader' in req) {
	        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
	    }
	    return req;
	};
	XHR.check = function () {
	    try {
	        if (request())
	            return true;
	    } catch (e) {
	    }
	    return false;
	};
	XHR.XDomainCheck = function () {
	    return XHR.check();
	};
	XHR.request = request;
	var XHRPolling = Transport['xhr-polling'] = function () {
	    Transport.XHR.apply(this, arguments);
	};
	util.inherit(XHRPolling, Transport.XHR);
	XHRPolling.prototype.type = 'xhr-polling';
	//链接服务器，如果是ios和安卓就等10毫秒执行。
	XHRPolling.prototype.connect = function (x) {
	    if (util.ios || util.android) {
	        var self = this;
	        util.load(function () {
	            setTimeout(function () {
	                Transport.XHR.prototype.connect.call(self, x);
	            }, 10);
	        });
	    } else {
	        Transport.XHR.prototype.connect.call(this, x);
	    }
	};
	//发送pullmsg.js请求，这里是一个死循环调用。用于保持pullmsg.js请求
	XHRPolling.prototype.onopen = function (a, b) {
	    this._onData(a, b);
	    if (/"headerCode":-32,/.test(a)) {
	        return;
	    }
	    this._get(mapping.Endpoint.host + "/pullmsg.js?sessionid=" + util.cookieHelper.getItem(mapping.Endpoint.userId + "sId"), true);
	};
	//http状态码对应执行对象
	var status = {
	    //arg参数有值说明是链接服务器请求，直接_onConnect方法
	    200: function (self, text, arg) {
	        var txt = text.match(/"sessionid":"\S+?(?=")/);
	        self.onopen(text, txt ? txt[0].slice(13) : void 0);
	        arg || self._onConnect();
	    },
	    //http状态码为400，断开连接
	    400: function (self) {
	        util.cookieHelper.removeItem(mapping.Endpoint.userId + "sId");
	        self._onDisconnect(true);
	        self._baseConnect();
	    }
	};
	//用于接收pullmsg.js请求中服务器返回的消息数据
	XHRPolling.prototype._get = function (symbol, arg) {
	    var self = this;
	    this._xhr = this._request(symbol, 'GET');
	    if ("onload" in this._xhr) {
	        this._xhr.onload = function () {
	            this.onload = empty;
	            if (this.responseText == 'lost params') {
	                status['400'](self);
	            } else {
	                status['200'](self, this.responseText, arg);
	            }
	        };
	        this._xhr.onerror = function () {
	            self._onDisconnect();
	        }
	    } else {
	        this._xhr.onreadystatechange = function () {
	            if (this.readyState == 4) {
	                this.onreadystatechange = empty;
	                if (/^(200|202)$/.test(this.status)) {
	                    status['200'](self, this.responseText, arg);
	                } else if (/^(400|403)$/.test(this.status)) {
	                    status['400'](self);
	                } else {
	                    self._onDisconnect();
	                }
	            }
	        };
	    }
	    this._xhr.send();
	};
	XHRPolling.check = function () {
	    return Transport.XHR.check();
	};
	XHRPolling.XDomainCheck = function () {
	    return Transport.XHR.XDomainCheck();
	};
	module.exports = XHRPolling;

/***/ },
/* 24 */
/*!*****************************!*\
  !*** ./src/core/channel.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	var mapping = __webpack_require__(/*! ../mapping */ 3);
	var msgEnum = __webpack_require__(/*! ../message/msgEnum */ 9);
	var factory = __webpack_require__(/*! ../io/factory */ 15);
	var tool = __webpack_require__(/*! ../tool */ 2);
	function Channel(address, cb, self) {
	    //连接服务器
	    this.context = self;
	    this.socket = factory(address.host +
	        "/websocket?appId=" + this.context.appId +
	        "&token=" + encodeURIComponent(this.context.token) +
	        "&sdkVer=" + this.context.sdkVer +
	        "&apiVer=" + this.context.apiVer,
	        cb);
	    //注册状态改变观察者
	    if ("onChanged" in mapping._ConnectionStatusListener) {
	        this.socket.on("StatusChanged", function (code) {
	            //如果参数为DisconnectionStatus，就停止心跳，其他的不停止心跳。每3min连接一次服务器
	            if (code instanceof msgEnum.DisconnectionStatus) {
	                mapping._ConnectionStatusListener.onChanged(RongIMClient.ConnectionStatus.setValue(code + 2));
	                self.clearHeartbeat();
	                return;
	            }
	            mapping._ConnectionStatusListener.onChanged(RongIMClient.ConnectionStatus.setValue(code))
	        })
	    } else {
	        throw new Error("setConnectStatusListener:Parameter format is incorrect")
	    }
	    //注册message观察者
	    this.socket.on("message", this.context.handler.handleMessage);
	//注册断开连接观察者
	    var that = this;
	    this.socket.on("disconnect", function () {
	        that.socket.fire("StatusChanged", 4);
	    });
	}
	//发送，如果通道可写就发送，不可写就重连服务器
	Channel.prototype.writeAndFlush = function (val) {
	    var that = this;
	    if (this.isWritable()) {
	        this.socket.send(val);
	    } else {
	        this.reconnect({
	            onSuccess: function () {
	                that.socket.send(val);
	            },
	            onError: function () {
	                throw new Error("reconnect fail")
	            }
	        })
	    }
	};
	//重连并清空messageid
	Channel.prototype.reconnect = function (callback) {
	    tool.messageIdHandler.clearMessageId();
	    this.socket = this.socket.reconnect();
	    if (callback) {
	        mapping.reconnectSet = callback;
	    }
	};
	Channel.prototype.disconnect = function (x) {
	    this.socket.disconnect(x);
	};
	//通道是否可写
	Channel.prototype.isWritable = function () {
	    return this.socket.connected || this.socket.connecting;
	};
	module.exports = Channel;

/***/ },
/* 25 */
/*!********************!*\
  !*** ./src/md5.js ***!
  \********************/
/***/ function(module, exports) {

	var MD5 = function (e) {
	    function n(d) {
	        for (var a = 0, b = ""; 3 >= a; a++)b += "0123456789abcdef".charAt(d >> 8 * a + 4 & 15) + "0123456789abcdef".charAt(d >> 8 * a & 15);
	        return b
	    }
	
	    function m(a, b) {
	        var d = (a & 65535) + (b & 65535);
	        return (a >> 16) + (b >> 16) + (d >> 16) << 16 | d & 65535
	    }
	
	    function h(a, b, d, c, e, f) {
	        a = m(m(b, a), m(c, f));
	        return m(a << e | a >>> 32 - e, d)
	    }
	
	    function g(a, b, d, c, e, f, g) {
	        return h(b & d | ~b & c, a, b, e, f, g)
	    }
	
	    function k(a, b, d, c, e, f, g) {
	        return h(b & c | d & ~c, a, b, e, f, g)
	    }
	
	    function l(a, b, d, c, e, f, g) {
	        return h(d ^ (b | ~c), a, b, e, f, g)
	    }
	
	    e = function (a) {
	        for (var b =
	            (a.length + 8 >> 6) + 1, d = Array(16 * b), c = 0; c < 16 * b; c++)d[c] = 0;
	        for (c = 0; c < a.length; c++)d[c >> 2] |= a.charCodeAt(c) << c % 4 * 8;
	        d[c >> 2] |= 128 << c % 4 * 8;
	        d[16 * b - 2] = 8 * a.length;
	        return d
	    }(e);
	    for (var d = 1732584193, a = -271733879, b = -1732584194, c = 271733878, f = 0; f < e.length; f += 16)var p = d, q = a, r = b, t = c, d = g(d, a, b, c, e[f + 0], 7, -680876936), c = g(c, d, a, b, e[f + 1], 12, -389564586), b = g(b, c, d, a, e[f + 2], 17, 606105819), a = g(a, b, c, d, e[f + 3], 22, -1044525330), d = g(d, a, b, c, e[f + 4], 7, -176418897), c = g(c, d, a, b, e[f + 5], 12, 1200080426), b = g(b, c, d, a, e[f + 6], 17, -1473231341),
	        a = g(a, b, c, d, e[f + 7], 22, -45705983), d = g(d, a, b, c, e[f + 8], 7, 1770035416), c = g(c, d, a, b, e[f + 9], 12, -1958414417), b = g(b, c, d, a, e[f + 10], 17, -42063), a = g(a, b, c, d, e[f + 11], 22, -1990404162), d = g(d, a, b, c, e[f + 12], 7, 1804603682), c = g(c, d, a, b, e[f + 13], 12, -40341101), b = g(b, c, d, a, e[f + 14], 17, -1502002290), a = g(a, b, c, d, e[f + 15], 22, 1236535329), d = k(d, a, b, c, e[f + 1], 5, -165796510), c = k(c, d, a, b, e[f + 6], 9, -1069501632), b = k(b, c, d, a, e[f + 11], 14, 643717713), a = k(a, b, c, d, e[f + 0], 20, -373897302), d = k(d, a, b, c, e[f + 5], 5, -701558691), c = k(c, d, a, b, e[f + 10], 9, 38016083),
	        b = k(b, c, d, a, e[f + 15], 14, -660478335), a = k(a, b, c, d, e[f + 4], 20, -405537848), d = k(d, a, b, c, e[f + 9], 5, 568446438), c = k(c, d, a, b, e[f + 14], 9, -1019803690), b = k(b, c, d, a, e[f + 3], 14, -187363961), a = k(a, b, c, d, e[f + 8], 20, 1163531501), d = k(d, a, b, c, e[f + 13], 5, -1444681467), c = k(c, d, a, b, e[f + 2], 9, -51403784), b = k(b, c, d, a, e[f + 7], 14, 1735328473), a = k(a, b, c, d, e[f + 12], 20, -1926607734), d = h(a ^ b ^ c, d, a, e[f + 5], 4, -378558), c = h(d ^ a ^ b, c, d, e[f + 8], 11, -2022574463), b = h(c ^ d ^ a, b, c, e[f + 11], 16, 1839030562), a = h(b ^ c ^ d, a, b, e[f + 14], 23, -35309556), d = h(a ^ b ^ c, d, a, e[f +
	        1], 4, -1530992060), c = h(d ^ a ^ b, c, d, e[f + 4], 11, 1272893353), b = h(c ^ d ^ a, b, c, e[f + 7], 16, -155497632), a = h(b ^ c ^ d, a, b, e[f + 10], 23, -1094730640), d = h(a ^ b ^ c, d, a, e[f + 13], 4, 681279174), c = h(d ^ a ^ b, c, d, e[f + 0], 11, -358537222), b = h(c ^ d ^ a, b, c, e[f + 3], 16, -722521979), a = h(b ^ c ^ d, a, b, e[f + 6], 23, 76029189), d = h(a ^ b ^ c, d, a, e[f + 9], 4, -640364487), c = h(d ^ a ^ b, c, d, e[f + 12], 11, -421815835), b = h(c ^ d ^ a, b, c, e[f + 15], 16, 530742520), a = h(b ^ c ^ d, a, b, e[f + 2], 23, -995338651), d = l(d, a, b, c, e[f + 0], 6, -198630844), c = l(c, d, a, b, e[f + 7], 10, 1126891415), b = l(b, c, d, a, e[f + 14], 15,
	            -1416354905), a = l(a, b, c, d, e[f + 5], 21, -57434055), d = l(d, a, b, c, e[f + 12], 6, 1700485571), c = l(c, d, a, b, e[f + 3], 10, -1894986606), b = l(b, c, d, a, e[f + 10], 15, -1051523), a = l(a, b, c, d, e[f + 1], 21, -2054922799), d = l(d, a, b, c, e[f + 8], 6, 1873313359), c = l(c, d, a, b, e[f + 15], 10, -30611744), b = l(b, c, d, a, e[f + 6], 15, -1560198380), a = l(a, b, c, d, e[f + 13], 21, 1309151649), d = l(d, a, b, c, e[f + 4], 6, -145523070), c = l(c, d, a, b, e[f + 11], 10, -1120210379), b = l(b, c, d, a, e[f + 2], 15, 718787259), a = l(a, b, c, d, e[f + 9], 21, -343485551), d = m(d, p), a = m(a, q), b = m(b, r), c = m(c, t);
	    return n(d) +
	        n(a) + n(b) + n(c)
	};
	module.exports = MD5;

/***/ },
/* 26 */
/*!**********************!*\
  !*** ./src/ready.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	var global = window;
	var tool = __webpack_require__(/*! ./tool */ 2);
	var mappding = __webpack_require__(/*! ./mapping */ 3);
	var config = {
	    canFlashWidget: (function () {
	        if ('navigator' in global && 'plugins' in navigator && navigator.plugins['Shockwave Flash']) {
	            return !!navigator.plugins['Shockwave Flash'].description;
	        }
	        if ('ActiveXObject' in global) {
	            try {
	                return !!new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	            } catch (e) {
	            }
	        }
	        return false;
	    })(),
	    supportedWebSocket: function () {
	        return "WebSocket" in global && "ArrayBuffer" in global && WebSocket.prototype.CLOSED === 3 && !mappding.globalConf.WEB_SOCKET_FORCE_FLASH && !mappding.globalConf.WEB_XHR_POLLING;
	    },
	    supportedFlash: function () {
	        return !/opera/i.test(navigator.userAgent) && !mappding.globalConf.WEB_XHR_POLLING && this.canFlashWidget
	    }
	};
	// 程序入口
	tool.ready(function () {
	    var src = '';
	    //此属性为通道标识。根据这个标识生产通道对象，默认为websocket
	    tool.setTransportType('websocket');
	    //当前浏览器是否支持webSocket，并且window.WEB_SOCKET_FORCE_FLASH 和 !window.WEB_XHR_POLLING都是false
	    if (config.supportedWebSocket()) {
	        //加载protobuf
	        src = "http://res.websdk.rongcloud.cn/protobuf-0.2.min.js";
	        //是否支持flash widget
	    } else if (config.supportedFlash()) {
	        //加载flash widget帮助库
	        src = "http://res.websdk.rongcloud.cn/swfobject-0.2.min.js";
	    } else {
	        //如果上述条件都不支持则执行comet逻辑
	        tool.setTransportType('xhr-polling');
	        //加载comet帮助库
	        src = "http://res.websdk.rongcloud.cn/xhrpolling-0.2.min.js";
	    }
	    tool.loadScript(src);
	});

/***/ },
/* 27 */
/*!*******************************************!*\
  !*** ./src/IMClient/affiliatedMessage.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	var RongIMClient=__webpack_require__(/*! ./RongIMClient */ 1);
	var tool=__webpack_require__(/*! ../tool */ 2);
	//把具体的消息类型转化为protobuf格式的类
	RongIMClient.MessageContent = function (f) {
	    if (!(f instanceof RongIMClient.RongIMMessage)) {
	        throw new Error("wrong parameter")
	    }
	};
	RongIMClient.MessageContent.prototype.getMessage = function () {
	    return f
	};
	RongIMClient.MessageContent.prototype.encode = function () {
	    var c = new Modules.UpStreamMessage();
	    c.setSessionId(0);
	    c.setClassname(f.getObjectName());
	    c.setContent(tool.JSON.stringify(f.getDetail()));
	    var val = c.toArrayBuffer();
	    if (Object.prototype.toString.call(val) == "[object ArrayBuffer]") {
	        return [].slice.call(new Int8Array(val))
	    }
	    return val
	};
	//发送中处理消息的类，sendMessage方法的第三个参数就是这个对象
	RongIMClient.MessageHandler = function (a) {
	    if (typeof a == "function") {
	        this.process = a;
	    } else {
	        throw new Error("MessageHandler:arguments type is error")
	    }
	};
	//接收状态
	RongIMClient.ReceivedStatus = function (d) {
	    var a = d || 1;
	    this.getFlag = function () {
	        return a
	    };
	    this.isDownload = function () {
	        return a == 1
	    };
	    this.isListened = function () {
	        return a == 2
	    };
	    this.isRead = function () {
	        return a == 3
	    };
	    this.setDownload = function () {
	        a = 1
	    };
	    this.setListened = function () {
	        a = 2
	    };
	    this.setRead = function () {
	        a = 3
	    };
	};
	//用户信息
	RongIMClient.UserInfo = function (h, l, a) {
	    var k = h,
	        j = l,
	        i = a;
	    this.getUserName = function () {
	        return j
	    };
	    this.getPortraitUri = function () {
	        return i
	    };
	    this.getUserId = function () {
	        return k
	    };
	    this.setUserName = function (c) {
	        j = c
	    };
	    this.setPortraitUri = function (c) {
	        i = c
	    };
	    this.setUserId = function (c) {
	        k = c
	    }
	};
	//会话信息
	RongIMClient.Conversation = function () {
	    var s = this,
	        a = (new Date).getTime(),
	        D, v, B, w, E, G, t, F, y, C, A, H, x, u = 0, por,
	        z = RongIMClient.ConversationNotificationStatus.NOTIFY;
	    this.getConversationTitle = function () {
	        return G
	    };
	    this.toJSON = function () {
	        var c = {
	            "senderUserName": E,
	            lastTime: a,
	            "objectName": D,
	            "senderUserId": v,
	            "receivedTime": B,
	            "conversationTitle": G,
	            "conversationType": t,
	            "latestMessageId": C,
	            "sentTime": H,
	            "targetId": x,
	            "notificationStatus": z
	        };
	        return tool.JSON.stringify(c)
	    };
	    this.setReceivedStatus = function (c) {
	        w = c
	    };
	    this.getReceivedStatus = function () {
	        return w
	    };
	    this.getConversationType = function () {
	        return t
	    };
	    this.getDraft = function () {
	        return F
	    };
	    this.getLatestMessage = function () {
	        return y
	    };
	    this.getLatestMessageId = function () {
	        return C
	    };
	    this.getNotificationStatus = function () {
	        return z
	    };
	    this.getObjectName = function () {
	        return D
	    };
	    this.getReceivedTime = function () {
	        return B
	    };
	    this.getSenderUserId = function () {
	        return v
	    };
	    this.getSentStatus = function () {
	        return A
	    };
	    this.getSentTime = function () {
	        return H
	    };
	    this.getTargetId = function () {
	        return x
	    };
	    this.getUnreadMessageCount = function () {
	        return u
	    };
	    this.isTop = function () {
	        var e = RongIMClient.getInstance().getConversationList();
	        return e[0] != undefined && e[0].getTargetId() == this.getTargetId() && e[0].getConversationType() == this.getConversationType();
	    };
	    this.setConversationTitle = function (c) {
	        G = c
	    };
	    this.getConversationPortrait = function () {
	        return por;
	    };
	    this.setConversationPortrait = function (p) {
	        por = p;
	    };
	    this.setConversationType = function (c) {
	        t = c
	    };
	    this.setDraft = function (c) {
	        F = c
	    };
	    this.setSenderUserName = function (c) {
	        E = c
	    };
	    this.setLatestMessage = function (c) {
	        y = c
	    };
	    this.setLatestMessageId = function (c) {
	        C = c
	    };
	    this.setNotificationStatus = function (c) {
	        z = c instanceof RongIMClient.ConversationNotificationStatus ? c : RongIMClient.ConversationNotificationStatus.setValue(c);
	    };
	    this.setObjectName = function (c) {
	        D = c
	    };
	    this.setReceivedTime = function (c) {
	        a = B = c
	    };
	    this.setSenderUserId = function (c) {
	        v = c
	    };
	    this.getLatestTime = function () {
	        return a
	    };
	    this.setSentStatus = function (c) {
	        return !!(A = c)
	    };
	    this.setSentTime = function (c) {
	        a = H = c
	    };
	    this.setTargetId = function (c) {
	        x = c
	    };
	    this.setTop = function () {
	        if (s.getTargetId() == undefined || this.isTop()) {
	            return
	        }
	        RongIMClient.getInstance().getConversationList().add(this);
	    };
	    this.setUnreadMessageCount = function (c) {
	        u = c
	    }
	};
	//讨论组信息
	RongIMClient.Discussion = function (m, l, a, q, p) {
	    var s = m,
	        t = l,
	        r = a,
	        o = q,
	        n = p;
	    this.getCreatorId = function () {
	        return r
	    };
	    this.getId = function () {
	        return s
	    };
	    this.getMemberIdList = function () {
	        return n
	    };
	    this.getName = function () {
	        return t
	    };
	    this.isOpen = function () {
	        return o
	    };
	    this.setCreatorId = function (c) {
	        r = c
	    };
	    this.setId = function (c) {
	        s = c
	    };
	    this.setMemberIdList = function (c) {
	        n = c
	    };
	    this.setName = function (c) {
	        t = c
	    };
	    this.setOpen = function (c) {
	        o = !!c
	    }
	};
	//群信息
	RongIMClient.Group = function (j, l, a) {
	    var h = j,
	        k = l,
	        i = a;
	    this.getId = function () {
	        return h
	    };
	    this.getName = function () {
	        return k
	    };
	    this.getPortraitUri = function () {
	        return i
	    };
	    this.setId = function (c) {
	        h = c
	    };
	    this.setName = function (c) {
	        k = c
	    };
	    this.setPortraitUri = function (c) {
	        i = c
	    }
	};


/***/ },
/* 28 */
/*!****************************************!*\
  !*** ./src/IMClient/coustomMessage.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	var RongIMClient=__webpack_require__(/*! ./RongIMClient */ 1);
	var tool=__webpack_require__(/*! ../tool */ 2);
	//消息基类，此类是对安卓消息基类的重新实现
	RongIMClient.RongIMMessage = function (content) {
	    var x = "unknown",
	        u, z = content || {},
	        o, q, t, y, a, p, s, v, r;
	    this.getDetail = function () {
	        return z;
	    };
	    this.getMessageTag = function () {
	        return [RongIMClient.MessageTag.ISPERSISTED, RongIMClient.MessageTag.ISCOUNTED, RongIMClient.MessageTag.ISDISPLAYED];
	    };
	    this.getContent = function () {
	        return z.content
	    };
	    this.getConversationType = function () {
	        return o
	    };
	    this.getExtra = function () {
	        return z.extra;
	    };
	    this.getMessageDirection = function () {
	        return q
	    };
	    this.getMessageId = function () {
	        return t
	    };
	    this.getObjectName = function () {
	        return y
	    };
	    this.getReceivedStatus = function () {
	        return a
	    };
	    this.getReceivedTime = function () {
	        return u
	    };
	    this.getSenderUserId = function () {
	        return p
	    };
	    this.getSentStatus = function () {
	        return s
	    };
	    this.getTargetId = function () {
	        return r
	    };
	    this.setContent = function (c, d) {
	        z[d || "content"] = c
	    };
	    this.setConversationType = function (c) {
	        o = c
	    };
	    this.setExtra = function (c) {
	        z.extra = c;
	    };
	    this.setMessageDirection = function (c) {
	        q = c
	    };
	    this.setMessageId = function (c) {
	        t = c
	    };
	    this.setObjectName = function (c) {
	        y = c
	    };
	    this.setReceivedStatus = function (c) {
	        a = c
	    };
	    this.setSenderUserId = function (c) {
	        p = c
	    };
	    this.setSentStatus = function (c) {
	        return !!(s = c)
	    };
	    this.setSentTime = function (c) {
	        v = tool.int64ToTimestamp(c);
	    };
	    this.getSentTime = function () {
	        return v;
	    };
	    this.setTargetId = function (c) {
	        r = c
	    };
	    this.setReceivedTime = function (c) {
	        u = c
	    };
	    this.toJSON = function () {
	        var c = {
	            "receivedTime": u,
	            "messageType": x,
	            "details": z,
	            "conversationType": o,
	            "direction": q,
	            "messageId": t,
	            "objectName": y,
	            "senderUserId": p,
	            "sendTime": v,
	            "targetId": r
	        };
	        return tool.JSON.stringify(c)
	    };
	    this.getMessageType = function () {
	        return x
	    };
	    this.setMessageType = function (c) {
	        x = c
	    }
	};
	//通知类型消息基类，继承自RongIMMessage
	RongIMClient.NotificationMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.getMessageTag = function () {
	        return [RongIMClient.MessageTag.ISPERSISTED, RongIMClient.MessageTag.ISDISPLAYED];
	    };
	};
	tool.inherit(RongIMClient.NotificationMessage, RongIMClient.RongIMMessage, true);
	//状态类型消息基类，继承自RongIMMessage
	RongIMClient.StatusMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.getMessageTag = function () {
	        return ['NONE'];
	    };
	};
	tool.inherit(RongIMClient.StatusMessage, RongIMClient.RongIMMessage, true);
	//文本消息
	RongIMClient.TextMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.TextMessage);
	    this.setObjectName("RC:TxtMsg");
	};
	RongIMClient.TextMessage.obtain = function (text) {
	    return new RongIMClient.TextMessage({
	        content: text,
	        extra: ""
	    })
	};
	tool.inherit(RongIMClient.TextMessage, RongIMClient.RongIMMessage, true);
	//图片消息
	RongIMClient.ImageMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.ImageMessage);
	    this.setObjectName("RC:ImgMsg");
	    this.setImageUri = function (a) {
	        this.setContent(a, "imageUri")
	    };
	    this.getImageUri = function () {
	        return this.getDetail().imageUri
	    };
	};
	RongIMClient.ImageMessage.obtain = function (content, imageUri) {
	    return new RongIMClient.ImageMessage({
	        content: content,
	        imageUri: imageUri,
	        extra: ""
	    });
	};
	tool.inherit(RongIMClient.ImageMessage, RongIMClient.RongIMMessage, true);
	//图文消息
	RongIMClient.RichContentMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.RichContentMessage);
	    this.setObjectName("RC:ImgTextMsg");
	    this.setTitle = function (a) {
	        this.setContent(a, "title")
	    };
	    this.getTitle = function () {
	        return this.getDetail().title;
	    };
	    this.setImageUri = function (a) {
	        this.setContent(a, "imageUri")
	    };
	    this.getImageUri = function () {
	        return this.getDetail().imageUri;
	    };
	};
	RongIMClient.RichContentMessage.obtain = function (title, content, imageUri) {
	    return new RongIMClient.RichContentMessage({
	        title: title,
	        content: content,
	        imageUri: imageUri,
	        extra: ""
	    })
	};
	tool.inherit(RongIMClient.RichContentMessage, RongIMClient.RongIMMessage, true);
	//音频消息
	RongIMClient.VoiceMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setObjectName("RC:VcMsg");
	    this.setMessageType(RongIMClient.MessageType.VoiceMessage);
	    this.setDuration = function (a) {
	        this.setContent(a, "duration")
	    };
	    this.getDuration = function () {
	        return this.getDetail().duration;
	    };
	};
	RongIMClient.VoiceMessage.obtain = function (content, duration) {
	    return new RongIMClient.VoiceMessage({
	        content: content,
	        duration: duration,
	        extra: ""
	    })
	};
	tool.inherit(RongIMClient.VoiceMessage, RongIMClient.RongIMMessage, true);
	//客服握手消息
	RongIMClient.HandshakeMessage = function () {
	    RongIMClient.RongIMMessage.call(this);
	    this.setMessageType(RongIMClient.MessageType.HandshakeMessage);
	    this.setObjectName("RC:HsMsg");
	};
	tool.inherit(RongIMClient.HandshakeMessage, RongIMClient.RongIMMessage, true);
	//中断客服消息
	RongIMClient.SuspendMessage = function () {
	    RongIMClient.RongIMMessage.call(this);
	    this.setMessageType(RongIMClient.MessageType.SuspendMessage);
	    this.setObjectName("RC:SpMsg");
	};
	tool.inherit(RongIMClient.SuspendMessage, RongIMClient.RongIMMessage, true);
	//未知消息
	RongIMClient.UnknownMessage = function (c, o) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.UnknownMessage);
	    this.setObjectName(o);
	};
	tool.inherit(RongIMClient.UnknownMessage, RongIMClient.RongIMMessage, true);
	//地理位置消息
	RongIMClient.LocationMessage = function (c) {
	    RongIMClient.RongIMMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.LocationMessage);
	    this.setObjectName("RC:LBSMsg");
	    this.setLatitude = function (a) {
	        this.setContent(a, "latitude")
	    };
	    this.getLatitude = function () {
	        return this.getDetail().latitude;
	    };
	    this.setLongitude = function (a) {
	        this.setContent(a, "longitude")
	    };
	    this.getLongitude = function () {
	        return this.getDetail().longitude;
	    };
	    this.setPoi = function (a) {
	        this.setContent(a, "poi")
	    };
	    this.getPoi = function () {
	        return this.getDetail().poi;
	    };
	};
	RongIMClient.LocationMessage.obtain = function (content, latitude, longitude, poi) {
	    return new RongIMClient.LocationMessage({
	        content: content,
	        latitude: latitude,
	        longitude: longitude,
	        poi: poi,
	        extra: ""
	    })
	};
	tool.inherit(RongIMClient.LocationMessage, RongIMClient.RongIMMessage, true);
	//讨论组通知消息
	RongIMClient.DiscussionNotificationMessage = function (c) {
	    RongIMClient.NotificationMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.DiscussionNotificationMessage);
	    this.setObjectName("RC:DizNtf");
	    var isReceived = false;
	    this.getExtension = function () {
	        return this.getDetail().extension;
	    };
	    this.getOperator = function () {
	        return this.getDetail().operator;
	    };
	    this.getType = function () {
	        return this.getDetail().type;
	    };
	    this.isHasReceived = function () {
	        return isReceived;
	    };
	    this.setExtension = function (a) {
	        this.setContent(a, "extension")
	    };
	    this.setHasReceived = function (x) {
	        isReceived = !!x;
	    };
	    this.setOperator = function (a) {
	        this.setContent(a, "operator")
	    };
	    this.setType = function (a) {
	        this.setContent(a, "type");
	        //1:加入讨论组 2：退出讨论组 3:讨论组改名 4：讨论组群主T人
	    };
	};
	tool.inherit(RongIMClient.DiscussionNotificationMessage, RongIMClient.NotificationMessage, true);
	//信息通知消息，继承自NotificationMessage
	RongIMClient.InformationNotificationMessage = function (c) {
	    RongIMClient.NotificationMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.InformationNotificationMessage);
	    this.setObjectName("RC:InfoNtf");
	};
	RongIMClient.InformationNotificationMessage.obtain = function (content) {
	    return new RongIMClient.InformationNotificationMessage({
	        content: content,
	        extra: ""
	    })
	};
	tool.inherit(RongIMClient.InformationNotificationMessage, RongIMClient.NotificationMessage, true);
	//加删好友消息
	RongIMClient.ContactNotificationMessage = function (c) {
	    RongIMClient.NotificationMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.ContactNotificationMessage);
	    this.setObjectName("RC:ContactNtf");
	    this.getOperation = function () {
	        return this.getDetail().operation;
	    };
	    this.setOperation = function (o) {
	        this.setContent(o, 'operation');
	    };
	    this.setMessage = function (m) {
	        this.setContent(m, 'message');
	    };
	    this.getMessage = function () {
	        return this.getDetail().message;
	    };
	    this.getSourceUserId = function () {
	        return this.getDetail().sourceUserId;
	    };
	    this.setSourceUserId = function (m) {
	        this.setContent(m, 'sourceUserId');
	    };
	    this.getTargetUserId = function () {
	        return this.getDetail().targetUserId;
	    };
	    this.setTargetUserId = function (m) {
	        this.setContent(m, 'targetUserId');
	    };
	};
	RongIMClient.ContactNotificationMessage.obtain = function (operation, sourceUserId, targetUserId, message) {
	    return new RongIMClient.ContactNotificationMessage({
	        operation: operation,
	        sourceUserId: sourceUserId,
	        targetUserId: targetUserId,
	        message: message,
	        extra: ""
	    });
	};
	//允许加好友
	RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_ACCEPT_RESPONSE = 'ContactOperationAcceptResponse';
	//拒绝加好友
	RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_REJECT_RESPONSE = 'ContactOperationRejectResponse';
	//发起加好友请求
	RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_REQUEST = 'ContactOperationRequest';
	tool.inherit(RongIMClient.ContactNotificationMessage, RongIMClient.NotificationMessage, true);
	//个人信息通知消息
	RongIMClient.ProfileNotificationMessage = function (c) {
	    RongIMClient.NotificationMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.ProfileNotificationMessage);
	    this.setObjectName("RC:ProfileNtf");
	    this.getOperation = function () {
	        return this.getDetail().operation;
	    };
	    this.setOperation = function (o) {
	        this.setContent(o, 'operation');
	    };
	    this.getData = function () {
	        return this.getDetail().data;
	    };
	    this.setData = function (o) {
	        this.setContent(o, 'data');
	    };
	};
	RongIMClient.ProfileNotificationMessage.obtain = function (operation, data) {
	    return new RongIMClient.ProfileNotificationMessage({
	        operation: operation,
	        data: data,
	        extra: ""
	    });
	};
	tool.inherit(RongIMClient.ProfileNotificationMessage, RongIMClient.NotificationMessage, true);
	//命令通知消息
	RongIMClient.CommandNotificationMessage = function (c) {
	    RongIMClient.NotificationMessage.call(this, c);
	    this.setMessageType(RongIMClient.MessageType.CommandNotificationMessage);
	    this.setObjectName("RC:CmdNtf");
	    this.getData = function () {
	        return this.getDetail().data;
	    };
	    this.setData = function (o) {
	        this.setContent(o, "data");
	    };
	    this.getName = function () {
	        return this.getDetail().name;
	    };
	    this.setName = function (o) {
	        this.setContent(o, 'name');
	    };
	};
	RongIMClient.CommandNotificationMessage.obtain = function (x, data) {
	    return new RongIMClient.CommandNotificationMessage({
	        name: x,
	        data: data,
	        extra: ""
	    });
	};
	tool.inherit(RongIMClient.CommandNotificationMessage, RongIMClient.NotificationMessage, true);

/***/ },
/* 29 */
/*!********************************!*\
  !*** ./src/IMClient/IMEnum.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by zhangyatao on 16/1/11.
	 */
	var RongIMClient = __webpack_require__(/*! ./RongIMClient */ 1);
	var tool = __webpack_require__(/*! ../tool */ 2);
	var msgEnum = __webpack_require__(/*! ../message/msgEnum */ 9);
	var en = __webpack_require__(/*! ../enum */ 10);
	var ConnectionState = msgEnum.ConnectionState;
	//create enum object 枚举对象，详情可参考API文档
	var _enum = {
	    'MessageTag': {
	        'ISPERSISTED': 'ISPERSISTED',
	        'ISCOUNTED': 'ISCOUNTED',
	        'NONE': 'NONE',
	        'ISDISPLAYED': "ISDISPLAYED"
	    },
	    'ConversationNotificationStatus': ['DO_NOT_DISTURB', 'NOTIFY'],
	    'ConversationType': ['CHATROOM', 'CUSTOMER_SERVICE', 'DISCUSSION', 'GROUP', 'PRIVATE', 'SYSTEM'],
	    'SentStatus': ['DESTROYED', 'FAILED', 'READ', 'RECEIVED', 'SENDING', 'SENT'],
	    'DiscussionInviteStatus': ['CLOSED', 'OPENED'],
	    'MediaType': ['AUDIO', 'FILE', 'IMAGE', 'VIDEO'],
	    'MessageDirection': ['RECEIVE', 'SEND'],
	    'MessageType': ['DiscussionNotificationMessage', 'TextMessage', 'ImageMessage', 'VoiceMessage', 'RichContentMessage', 'HandshakeMessage', 'UnknownMessage', 'SuspendMessage', 'LocationMessage', 'InformationNotificationMessage', 'ContactNotificationMessage', 'ProfileNotificationMessage', 'CommandNotificationMessage'],
	    'SendErrorStatus': {
	        'REJECTED_BY_BLACKLIST': 405,
	        'NOT_IN_DISCUSSION': 21406,
	        'NOT_IN_GROUP': 22406,
	        'NOT_IN_CHATROOM': 23406
	    },
	    'BlacklistStatus': ['EXIT_BLACK_LIST', 'NOT_EXIT_BLACK_LIST'],
	    'ConnectionStatus': ['CONNECTED', 'CONNECTING', 'RECONNECT', 'OTHER_DEVICE_LOGIN', 'CLOSURE', 'UNKNOWN_ERROR', 'LOGOUT', 'BLOCK']
	};
	//生产枚举对象
	tool.each(_enum, function (_name, option) {
	    var val = {};
	    if (tool.isArray(option)) {
	        tool.forEach(option, function (x, i) {
	            val[x] = i;
	        })
	    } else {
	        val = option;
	    }
	    RongIMClient[_name] = en(val);
	});
	RongIMClient.ConnectErrorStatus = ConnectionState;
	//回调基类
	RongIMClient.callback = function (d, a) {
	    this.onError = a;
	    this.onSuccess = d
	};
	//回调错误枚举值
	RongIMClient.callback.ErrorCode = en({
	    TIMEOUT: -1,
	    UNKNOWN_ERROR: -2
	});

/***/ }
/******/ ])
});
;
//# sourceMappingURL=RongIMClient.js.map