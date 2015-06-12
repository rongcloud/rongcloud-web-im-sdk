//消息回调映射，处理消息
function MessageHandler(client) {
    if (!_ReceiveMessageListener) {
        throw new Error("please set onReceiveMessageListener");
    }
    var Map = {}, onReceived = _ReceiveMessageListener.onReceived, connectCallback = null;

    //把对象推入回调对象队列中，并启动定时器
    this.putCallback = function (callbackObj, _publishMessageId, _msg) {
        var item = {
            Callback: callbackObj,
            Message: _msg
        };
        item.Callback.resumeTimer();
        Map[_publishMessageId] = item;
    };
    //设置连接回调对象，启动定时器
    this.setConnectCallback = function (_connectCallback) {
        if (_connectCallback) {
            connectCallback = new ConnectAck(_connectCallback.onSuccess, _connectCallback.onError, client);
            connectCallback.resumeTimer();
        }
    };
    //处理具体的消息对象
    this.onReceived = function (msg) {
        //实体对象
        var entity,
        //解析完成的消息对象
            message,
        //会话对象
            con;
        if (msg.constructor._name != "PublishMessage") {
            //如果msg不是一个内置消息对象，直接赋值给实体，进行下一步处理
            entity = msg;
            io.util.cookieHelper.setItem(client.userId, io.util.int64ToTimestamp(entity.dataTime));
        } else {
            if (msg.getTopic() == "s_ntf") {
                entity = Modules.NotifyMsg.decode(msg.getData());
                client.syncTime(entity.type, io.util.int64ToTimestamp(entity.time));
                return;
            } else if (msg.getTopic() == "s_msg") {
                entity = Modules.DownStreamMessage.decode(msg.getData());
                io.util.cookieHelper.setItem(client.userId, io.util.int64ToTimestamp(entity.dataTime));
            } else {
                return;
            }
        }
        //解析实体对象为消息对象。
        message = messageParser(entity, onReceived);
        if (message === null) {
            return;
        }
        //创建会话对象
        con = RongIMClient.getInstance().getConversationList().get(message.getConversationType(), message.getTargetId());
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
        onReceived(message);
    };
    //处理通道对象传送过来的内置消息对象
    this.handleMessage = function (msg) {
        if (!msg) {
            return
        }
        switch (msg.constructor._name) {
            case "ConnAckMessage":
                connectCallback.process(msg.getStatus(), msg.getUserId());
                break;
            case "PublishMessage":
                if (msg.getQos() != 0) {
                    client.channel.writeAndFlush(new PubAckMessage(msg.getMessageId()));
                }
                //如果是PublishMessage就把该对象给onReceived方法执行处理
                client.handler.onReceived(msg);
                break;
            case "QueryAckMessage":
                if (msg.getQos() != 0) {
                    client.channel.writeAndFlush(new QueryConMessage(msg.getMessageId()))
                }
                var temp = Map[msg.getMessageId()];
                if (temp) {
                    //执行回调操作
                    temp.Callback.process(msg.getStatus(), msg.getData(), msg.getDate(), temp.Message);
                    delete Map[msg.getMessageId()];
                }
                break;
            case "PubAckMessage":
                var item = Map[msg.getMessageId()];
                if (item) {
                    //执行回调操作
                    item.Callback.process(msg.getStatus() || 0, msg.getDate(), item.Message);
                    delete Map[msg.getMessageId()];
                }
                break;
            case "PingRespMessage":
                client.pauseTimer();
                break;
            case "DisconnectMessage":
                client.channel.disconnect(msg.getStatus());
                break;
            default:
        }
    }
}
//会话类型映射，key为服务器中会话类型，value为web SDK 会话类型
var mapping = {
        "1": 4,
        "2": 2,
        "3": 3,
        "4": 0,
        "5": 1,
        "6": 5
    },
//objectname映射
    typeMapping = {
        "RC:TxtMsg": "TextMessage",
        "RC:ImgMsg": "ImageMessage",
        "RC:VcMsg": "VoiceMessage",
        "RC:ImgTextMsg": "RichContentMessage",
        "RC:LBSMsg": "LocationMessage"
    },
//通知类型映射
    sysNtf = {
        "RC:InfoNtf": "InformationNotificationMessage",
        "RC:ContactNtf": "ContactNotificationMessage",
        "RC:ProfileNtf": "ProfileNotificationMessage",
        "RC:CmdNtf": "CommandNotificationMessage",
        "RC:DizNtf": "DiscussionNotificationMessage"
    },
//消息监听器
    _ReceiveMessageListener,
//连接状态监听器
    _ConnectionStatusListener;

//消息转换方法
function messageParser(entity, onReceived) {
    var message, content;

    content = entity.content;

    var de = JSON.parse(binaryHelper.readUTF(content.offset ? io.util.arrayFrom(content.buffer).slice(content.offset, content.limit) : content)),
        objectName = entity.classname;

    //处理表情
    if ("Expression" in RongIMClient && "RC:TxtMsg" == objectName && de.content) {
        de.content = de.content.replace(/[\uf000-\uf700]/g, function (x) {
            return RongIMClient.Expression.calcUTF(x) || x;
        })
    }
    //映射为具体消息对象
    if (objectName in typeMapping) {
        message = new RongIMClient[typeMapping[objectName]](de);
    } else if (objectName in sysNtf) {
        message = new RongIMClient[sysNtf[objectName]](de);
        if (onReceived) {
            onReceived(message);
            return null;
        }
    } else if (objectName in registerMessageTypeMapping) {
        //自定义消息
        message = new RongIMClient[registerMessageTypeMapping[objectName]](de);
    } else {
        //未知消息
        message = new RongIMClient.UnknownMessage(de, objectName);
    }
    //根据实体对象设置message对象
    message.setSentTime(io.util.int64ToTimestamp(entity.dataTime));
    message.setSenderUserId(entity.fromUserId);
    message.setConversationType(RongIMClient.ConversationType.setValue(mapping[entity.type]));
    message.setTargetId(/^[234]$/.test(entity.type || entity.getType()) ? entity.groupId : message.getSenderUserId());
    if (entity.fromUserId == bridge._client.userId) {
        message.setMessageDirection(RongIMClient.MessageDirection.SEND);
    } else {
        message.setMessageDirection(RongIMClient.MessageDirection.RECEIVE);
    }
    message.setReceivedTime((new Date).getTime());
    message.setMessageId(message.getConversationType() + "_" + ~~(Math.random() * 0xffffff));
    message.setReceivedStatus(new RongIMClient.ReceivedStatus());
    return message;
}