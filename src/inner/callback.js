//a callback function manager constructor，回调函数执行超时管理的基类
function MessageCallback(error) {
    var timeoutMillis, me = this;
    this.timeout = null;
    this.onError = null;
    if (error && typeof error == "number") {
        timeoutMillis = error
    } else {
        timeoutMillis = 30000;
        this.onError = error;
    }
    this.resumeTimer = function () {
        if (timeoutMillis > 0 && !this.timeout) {
            this.timeout = setTimeout(function () {
                me.readTimeOut(true);
            }, timeoutMillis)
        }
    };
    this.pauseTimer = function () {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null
        }
    };
    this.readTimeOut = function (isTimeout) {
        if (isTimeout && this.onError) {
            this.onError(RongIMClient.callback.ErrorCode.TIMEOUT)
        } else {
            this.pauseTimer()
        }
    };
}
//发送PublishMessage消息回调类
function PublishCallback(cb, _timeout) {
    MessageCallback.call(this, _timeout);
    //回调执行此方法
    this.process = function (_staus, _serverTime, _msg) {
        this.readTimeOut();
        if (_staus == 0) {
            if (_msg) {
                //把发送的消息发送状态改为已接收
                _msg.setSentStatus(RongIMClient.SentStatus.RECEIVED)
            }
            cb();
        } else {
            _timeout(RongIMClient.SendErrorStatus.setValue(_staus));
        }
    };
    this.readTimeOut = function (x) {
        PublishCallback.prototype.readTimeOut.call(this, x)
    }
}

io.util._extends(PublishCallback, MessageCallback);
//发送QueryMessage消息回调类
function QueryCallback(cb, _timeout) {
    MessageCallback.call(this, _timeout);
    //回调执行此方法
    this.process = function (status, data, serverTime, pbtype) {
        this.readTimeOut();
        if (pbtype && data && status == 0) {
            try {
                data = callbackMapping(Modules[pbtype].decode(data), pbtype);
            } catch (e) {
                _timeout(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
                return;
            }
            if ("GetUserInfoOutput" == pbtype) {
                //pb类型为GetUserInfoOutput的话就把data放入userinfo缓存队列
                userInfoMapping[data.getUserId()] = data;
            }
            cb(data);
        } else {
            status > 0 ? _timeout(status) : cb(status)
        }
    };
    this.readTimeOut = function (x) {
        QueryCallback.prototype.readTimeOut.call(this, x)
    }
}

io.util._extends(QueryCallback, MessageCallback);

//连接回调类
function ConnectAck(cb, _timeout, self) {
    MessageCallback.call(this, _timeout);
    this.process = function (status, userId) {
        this.readTimeOut();
        if (status == 0) {
            self.userId = userId;
            if (!RongIMClient.isNotPullMsg) {
                self.syncTime();
            }
            if (self.reconnectObj.onSuccess) {
                self.reconnectObj.onSuccess(userId);
                delete self.reconnectObj.onSuccess;
            } else {
                cb(userId);
            }
            io.getInstance().fire("StatusChanged", 0);
            io.getInstance()._doQueue()
        } else if (status == 6) {
            //重定向
            Client.getServerEndpoint(self.token, self.appId, function () {
                self.clearHeartbeat();
                __init.call(e, function () {
                    io._TransportType == "websocket" && self.keepLive()
                });
                self.channel.socket.fire("StatusChanged", 2);
            }, _timeout, false)
        } else {
            if (self.reconnectObj.onError) {
                self.reconnectObj.onError(RongIMClient.ConnectErrorStatus.setValue(status));
                delete self.reconnectObj.onError;
            } else {
                _timeout(RongIMClient.ConnectErrorStatus.setValue(status))
            }
        }
    };
    this.readTimeOut = function (x) {
        ConnectAck.prototype.readTimeOut.call(this, x)
    }
}

io.util._extends(ConnectAck, MessageCallback);