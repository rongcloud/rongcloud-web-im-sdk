var mapping = require('../mapping');
var msgEnum = require('../message/msgEnum');
var factory = require('../io/factory');
var tool = require('../tool');
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