//topic白名单
var _topic = ["invtDiz", "crDiz", "qnUrl", "userInf", "dizInf", "userInf", "joinGrp", "quitDiz", "exitGrp", "evctDiz", ["chatMsg", "pcMsgP", "pdMsgP", "pgMsgP", "ppMsgP"], "pdOpen", "rename", "uGcmpr", "qnTkn", 'destroyChrm', 'createChrm', 'exitChrm', 'queryChrm', 'joinChrm', "pGrps", "addBlack", "rmBlack", "getBlack", "blackStat", "addRelation", 'qryRelation', 'delRelation'];
//桥连类，用于连接外部操作和内部操作
var bridge = function (_appkey, _token, _callback) {
    //bridge._client为Client实例
    bridge._client = Client.connect(_appkey, _token, _callback);
    //设置监听器
    this.setListener = function (_changer) {
        if (typeof _changer == "object") {
            if (typeof _changer.onChanged == 'function') {
                _ConnectionStatusListener = _changer;
            } else if (typeof _changer.onReceived == 'function') {
                _ReceiveMessageListener = _changer;
            }
        }
    };
    //重连
    this.reConnect = function (callback) {
        bridge._client.channel.reconnect(callback)
    };
    //断连
    this.disConnect = function () {
        bridge._client.clearHeartbeat();
        bridge._client.channel.disconnect()
    };
    //执行queryMessage请求
    this.queryMsg = function (topic, content, targetId, callback, pbname) {
        if (typeof topic != "string") {
            topic = _topic[topic]
        }
        bridge._client.queryMessage(topic, content, targetId, Qos.AT_MOST_ONCE, callback, pbname)
    };
    //执行publishMessage请求
    this.pubMsg = function (topic, content, targetId, callback, msg) {
        bridge._client.publishMessage(_topic[10][topic], content, targetId, callback, msg)
    };
};