/**
 * Created by zhangyatao on 16/1/7.
 */

var com = require('../mapping');
var tool=require('../tool');
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