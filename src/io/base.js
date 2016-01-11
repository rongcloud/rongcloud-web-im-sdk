var util = require('../tool');
var IOstream = require('../Message/throttleStream');
var mapping=require('../mapping');
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