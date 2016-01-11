var parser = require('./messageParser');
var mapping = require('../mapping');
var ack = require('./messageCallback');
var tool = require('../tool');
var entity=require('../message/MessageEntity');
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