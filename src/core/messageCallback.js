var tool = require('../tool');
var mapping = require('../mapping');
var factory = require('../io/factory');
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