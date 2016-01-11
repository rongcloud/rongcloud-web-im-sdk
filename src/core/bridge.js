var mapping = require('../mapping');
var client = require('./client');
var e = require('../message/msgEnum');
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
