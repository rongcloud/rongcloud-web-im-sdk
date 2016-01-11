var Transport = require('./base');
var util = require('../tool');
var tinyStream = require('../binary');
var IOStream = require('../message/throttleStream');
var mapping = require('../mapping');
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