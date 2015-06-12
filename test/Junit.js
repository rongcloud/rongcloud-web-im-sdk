/**
 * Created by yataozhang on 15/4/8.
 * 单元测试
 */
(function (rong) {
    //promise模块
    var _promise = function (affair) {
        this.state = "waiting";
        this.affair = affair || function (o) {
            return o
        };
        this.handles = [];
    };
    _promise.prototype.then = function (nextaffair) {
        var p = new _promise();
        if (this.state != "waiting") {
            this._fire(p, nextaffair);
        } else {
            this._push(p, nextaffair);
        }
        return p;
    };
    _promise.prototype.delay = function (time) {
        return this.then(function (data) {
            var p = new _promise();
            setTimeout(function () {
                p.resolve(data);
            }, time);
            return p;
        });
    };
    _promise.prototype.resolve = function (obj) {
        if (this.state != "waiting") {
            throw new Error("all done");
        }
        this.state = "done";
        this.result = this.affair(obj);
        for (var i = 0; i < this.handles.length; i++) {
            var tmp = this.handles[i];
            this._fire(tmp.nextPromise, tmp.nextAffair);
        }
        return this;
    };
    _promise.prototype._push = function (nextPromise, nextAffair) {
        this.handles.push({
            nextPromise: nextPromise,
            nextAffair: nextAffair
        });
    };
    _promise.prototype._fire = function (nextPromise, nextAffair) {
        if (this.result == false) {
            console.warn("终止操作");
            return;
        }

        var nextVal = nextAffair(this.result);
        if (nextVal instanceof  _promise) {
            nextVal.then(function (obj) {
                nextPromise.resolve(obj);
            })
        } else {
            nextPromise.resolve(nextVal);
        }
    };


    var log = function (x) {
        console.log(x);
    } , error = function (x) {
        console.error("fail", x);
        return false;
    } , info = function (x) {
        console.info("done");
        if (x) {
            console.info(x);
        }
        return true;
    };
    var Junit = window.Junit = {}, instance, _default = {
        ConversationType: RongIMClient.ConversationType.setValue(4),
        targetId: "2189",
        content: "开始测试了",
        discussId: "ee23c0d6-4d38-4aaf-97a7-8155f0b93518",
        chatroomId: "tr002",
        groupId: "group001"
    };
    Junit.init = function () {
        instance = rong.getInstance();
    };
    Junit.config = function (obj) {
        for (var s in obj) {
            _default[s] = obj[s];
        }
    };
    Junit.baseFuncTest = function () {
        var pro = new _promise(function (data) {
            log(data);
            log("保存草稿,输入内容为:123456789");
            instance.saveTextMessageDraft(_default.ConversationType, _default.targetId, "123456789")
            return info();
        });
        pro.then(function () {
            log("得到草稿,预期值为123456789");
            if (instance.getTextMessageDraft(_default.ConversationType, _default.targetId) == "123456789") {
                return info();
            } else {
                return error("getTextMessageDraft");
            }
        }).then(function () {
            log("删除草稿,预期值为null");
            instance.clearTextMessageDraft(_default.ConversationType, _default.targetId);
            if (instance.getTextMessageDraft(_default.ConversationType, _default.targetId)) {
                return error("clearTextMessageDraft");
            } else {
                return info();
            }
        }).then(function () {
            log("得到会话列表");
            log(instance.getConversationList());
            return true;
        })
//            .then(function () {
//            log("同步会话列表");
//            instance.getConversationList().length = 0;
//            instance.syncConversationList();
//        }).delay(5000)
            .then(function () {
//            if (instance.getConversationList().length == 0 && instance.getIO()._TransportType != "xhr-polling") {
//                return error("syncConversationList");
//            }
            log("创建会话列表");
            if (instance.createConversation(_default.ConversationType, _default.targetId, "test")) {
                return info();
            } else {
                return error("createConversation");
            }
        }).then(function () {
            log("得到会话列表");
            if (instance.getConversation(_default.ConversationType, _default.targetId)) {
                return info();
            } else {
                return error("getConversation");
            }
        }).then(function () {
            log("得到会话通知类型");
            instance.getConversationNotificationStatus(_default.ConversationType, _default.targetId, {
                onSuccess: function (x) {
                    log(x)
                }, onError: function (x) {
                    error(x);
                    error("getConversationNotificationStatus")
                }
            });
            return true;
        }).then(function () {
            log("清除某类型会话");
                instance.clearConversations([_default.ConversationType]);
            if (instance.getConversation(_default.ConversationType, _default.targetId) == null) {
                return info();
            } else {
                return error("clearConversations");
            }
        }).then(function () {
            log("得到群类型会话列表");
            instance.createConversation(RongIMClient.ConversationType.GROUP, _default.groupId, "群一");
            if (instance.getGroupConversationList().length != 0) {
                return info();
            } else {
                return error("getGroupConversationList");
            }
        }).then(function () {
            log("删除指定会话");
            instance.removeConversation(RongIMClient.ConversationType.GROUP, _default.groupId);
            if (instance.getConversation(RongIMClient.ConversationType.GROUP, _default.groupId)) {
                return error("removeConversation")
            } else {
                return info();
            }
        }).then(function () {
            log("设置会话通知类型");
            instance.createConversation(_default.ConversationType, _default.targetId, "test");
            instance.setConversationNotificationStatus(_default.ConversationType, _default.targetId, RongIMClient.ConversationNotificationStatus.NOTIFY, {
                onSuccess: function (x) {
                    console.info(x);
                }, onError: function (x) {
                    error(x)
                }
            });
            return true;
        }).then(function () {
            log("会话置顶");
            instance.createConversation(RongIMClient.ConversationType.GROUP, _default.groupId, "群一");
            instance.setConversationToTop(_default.ConversationType, _default.targetId);
            var val = instance.getConversationList()[0];
            if (val.getTargetId() == _default.targetId && val.getConversationType() == _default.ConversationType) {
                return info();
            } else {
                return error("setConversationToTop");
            }
        }).then(function () {
            log("设置会话名称");
            instance.setConversationName(_default.ConversationType, _default.targetId, "修改名称");
            if (instance.getConversation(_default.ConversationType, _default.targetId).getConversationTitle() == "修改名称") {
                return info();
            } else {
                return error("setConversationName");
            }
        }).then(function () {
            log("得到登陆人员信息");
            instance.getCurrentUserInfo({
                onSuccess: function (x) {
                    info(x);
                }, onError: function (x) {
                    error(x);
                    error("getCurrentUserInfo");
                }
            });
            return true;
        }).then(function () {
            log("发送消息");
            instance.sendMessage(_default.ConversationType, _default.targetId, RongIMClient.TextMessage.obtain(_default.content), new RongIMClient.MessageHandler(function () {
                console.log("发送消息中")
            }), {
                onSuccess: function () {
                    info("发送消息成功")
                }, onError: function (x) {
                    error(x);
                    error("sendMessage")
                }
            });
            return true;
        }).then(function () {
            log("得到所有未读消息数量");
            info("未读消息数量：", instance.getTotalUnreadCount());
            return true;
        }).then(function () {
            log("得到指定会话未读消息数量");
            info("指定会话未读消息数量：", instance.getUnreadCount(_default.ConversationType, _default.targetId));
            return true;
        }).then(function () {
            log("清空未读消息数量");
            if (instance.clearMessagesUnreadStatus(_default.ConversationType, _default.targetId)) {
                return info("~~~~~基础功能测试完成~~~~~~\n以下开始高级功能测试");
            } else {
                return error("clearMessagesUnreadStatus");
            }
        }).then(function () {
            log("加入聊天室");
            instance.joinChatRoom(_default.chatroomId, 10, {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("joinChatRoom");
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("退出聊天室");
            instance.quitChatRoom(_default.chatroomId, {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("quitChatRoom");
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("发送通知类型消息");
            instance.sendNotification(RongIMClient.ConversationType.PRIVATE, _default.targetId, RongIMClient.InformationNotificationMessage.obtain(_default.content), {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("sendNotification")
                }
            });
            return true;
        }).then(function () {
            log("发送状态类型消息");
            return true;
        }).delay(2000).then(function () {
            log("创建讨论组");
            instance.createDiscussion("单元测试", ["2180"], {
                onSuccess: function (id) {
                    _default.discussId = id;
                    info();
                }, onError: function (x) {
                    error(x);
                    error("createDiscussion")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("得到指定讨论组信息");
            instance.getDiscussion(_default.discussId, {
                onSuccess: function (x) {
                    console.warn("讨论组Id", x.getId());
                    console.warn("讨论组名称", x.getName());
                    console.warn("讨论组邀请状态", x.isOpen());
                    console.warn("讨论组人员", x.getMemberIdList());
                    console.warn("讨论组管理员", x.getCreatorId());
                    info()
                }, onError: function (x) {
                    error(x);
                    error("getDiscussion")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("设置讨论组名称");
            instance.setDiscussionName(_default.discussId, "修改讨论组名称——", {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("setDiscussionName")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("设置讨论组邀请状态");
            instance.setDiscussionInviteStatus(_default.discussId, RongIMClient.DiscussionInviteStatus.OPENED, {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("setDiscussionInviteStatus")
                }
            });
            return true;
        }).delay(2000).then(function () {

            log("指定人员加入讨论组")//2315
            instance.addMemberToDiscussion(_default.discussId, ["2315"], {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("addMemberToDiscussion")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("将指定人员移出讨论组");
            instance.removeMemberFromDiscussion(_default.discussId, "2315", {
                onSuccess: function () {
                    info()
                }, onError: function (x) {
                    error(x);
                    error("removeMemberFromDiscussion")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("退出讨论组");
            instance.quitDiscussion(_default.discussId, {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("quitDiscussion")
                }
            });
            return true;
        }).delay(2000).then(function () {
            //flash bug
            log("加入群");
            instance.joinGroup(_default.groupId, "群组一", {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("joinGroup")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("退出群");
            instance.quitGroup(_default.groupId, {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("quitGroup")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("同步群");
            var group1 = new RongIMClient.Group();
            group1.setId("group001");
            group1.setName("群组一");
            var group2 = new RongIMClient.Group();
            group2.setId("group002");
            group2.setName("群组二");
            var group3 = new RongIMClient.Group();
            group3.setId("group003");
            group3.setName("群组三");
            instance.syncGroup([group1, group3, group2, group2, group3], {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("syncGroup")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("得到黑名单信息");
            instance.getBlacklist({
                onSuccess: function (x) {
                    info(x);
                }, onError: function (x) {
                    error(x);
                    error("getBlacklistStatus")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("将指定人员加入到黑名单");
            instance.addToBlacklist("2315", {
                onSuccess: function () {
                    info();
                }, onError: function (x) {
                    error(x);
                    error("addToBlacklist")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("得到指定人员在黑名单中的状态");
            instance.getBlacklistStatus("2315", {
                onSuccess: function (x) {
                    info(x);
                }, onError: function (x) {
                    error(x);
                    error("getBlacklistStatus")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("将指定人员移出黑名单");
            instance.removeFromBlacklist("2315", {
                onSuccess: function () {
                    instance.getBlacklist({
                        onSuccess: function (x) {
                            x.indexOf("2315") == -1 ? info(x) : error("removeFromBlacklist");
                        }, onError: function (x) {
                        }
                    })
                }, onError: function (x) {
                    error(x);
                    error("removeFromBlacklist")
                }
            });
            return true;
        }).then(function () {
            log("得到未读消息状态");
            RongIMClient.hasUnreadMessages(RongBrIdge._client.appId, RongBrIdge._client.token, {
                onSuccess: function (x) {
                    info(x);
                }, onError: function (x) {
                    error(x);
                    error("hasUnreadMessages")
                }
            });
            return true;
        }).delay(2000).then(function () {
            log("注册自定义消息");
            RongIMClient.registerMessageType({messageType: "_MessageType", "objectName": "RC:selfMsg", "fieldName": ["name", "id", "age"]});

            if (RongIMClient._MessageType) {
                var val = new RongIMClient._MessageType();
                if (val.getObjectName() == "RC:selfMsg" && val.setname && val.setid && val.setage) {
                    info();
                    return true;
                }
            }
            error("registerMessageType");
            return false;
        }).then(function () {
            log("断开链接测试");
            instance.disconnect();
            return true;
        }).delay(5000).then(function () {
            if (instance.getIO().getInstance().connected != false) {
                return error("disconnect");
            }
            log("重连");
            instance.reconnect({
                onSuccess: function () {

                }, onError: function () {

                }
            });
            return true;
        }).delay(10000).then(function () {
            console.log("~~~~~~~~~~~~测试完毕~~~~~~~~~~");
            if (instance.getIO().getInstance().connected != true) {
                return error("reconnect");
            }
        });
        pro.resolve("~~~~~~~~~~~~start~~~~~~~~~~~");
    };


})();
