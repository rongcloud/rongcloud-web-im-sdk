var RongIMClient=require('./RongIMClient');
var tool=require('../tool');
//消息基类，此类是对安卓消息基类的重新实现
RongIMClient.RongIMMessage = function (content) {
    var x = "unknown",
        u, z = content || {},
        o, q, t, y, a, p, s, v, r;
    this.getDetail = function () {
        return z;
    };
    this.getMessageTag = function () {
        return [RongIMClient.MessageTag.ISPERSISTED, RongIMClient.MessageTag.ISCOUNTED, RongIMClient.MessageTag.ISDISPLAYED];
    };
    this.getContent = function () {
        return z.content
    };
    this.getConversationType = function () {
        return o
    };
    this.getExtra = function () {
        return z.extra;
    };
    this.getMessageDirection = function () {
        return q
    };
    this.getMessageId = function () {
        return t
    };
    this.getObjectName = function () {
        return y
    };
    this.getReceivedStatus = function () {
        return a
    };
    this.getReceivedTime = function () {
        return u
    };
    this.getSenderUserId = function () {
        return p
    };
    this.getSentStatus = function () {
        return s
    };
    this.getTargetId = function () {
        return r
    };
    this.setContent = function (c, d) {
        z[d || "content"] = c
    };
    this.setConversationType = function (c) {
        o = c
    };
    this.setExtra = function (c) {
        z.extra = c;
    };
    this.setMessageDirection = function (c) {
        q = c
    };
    this.setMessageId = function (c) {
        t = c
    };
    this.setObjectName = function (c) {
        y = c
    };
    this.setReceivedStatus = function (c) {
        a = c
    };
    this.setSenderUserId = function (c) {
        p = c
    };
    this.setSentStatus = function (c) {
        return !!(s = c)
    };
    this.setSentTime = function (c) {
        v = tool.int64ToTimestamp(c);
    };
    this.getSentTime = function () {
        return v;
    };
    this.setTargetId = function (c) {
        r = c
    };
    this.setReceivedTime = function (c) {
        u = c
    };
    this.toJSON = function () {
        var c = {
            "receivedTime": u,
            "messageType": x,
            "details": z,
            "conversationType": o,
            "direction": q,
            "messageId": t,
            "objectName": y,
            "senderUserId": p,
            "sendTime": v,
            "targetId": r
        };
        return tool.JSON.stringify(c)
    };
    this.getMessageType = function () {
        return x
    };
    this.setMessageType = function (c) {
        x = c
    }
};
//通知类型消息基类，继承自RongIMMessage
RongIMClient.NotificationMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.getMessageTag = function () {
        return [RongIMClient.MessageTag.ISPERSISTED, RongIMClient.MessageTag.ISDISPLAYED];
    };
};
tool.inherit(RongIMClient.NotificationMessage, RongIMClient.RongIMMessage, true);
//状态类型消息基类，继承自RongIMMessage
RongIMClient.StatusMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.getMessageTag = function () {
        return ['NONE'];
    };
};
tool.inherit(RongIMClient.StatusMessage, RongIMClient.RongIMMessage, true);
//文本消息
RongIMClient.TextMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.TextMessage);
    this.setObjectName("RC:TxtMsg");
};
RongIMClient.TextMessage.obtain = function (text) {
    return new RongIMClient.TextMessage({
        content: text,
        extra: ""
    })
};
tool.inherit(RongIMClient.TextMessage, RongIMClient.RongIMMessage, true);
//图片消息
RongIMClient.ImageMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.ImageMessage);
    this.setObjectName("RC:ImgMsg");
    this.setImageUri = function (a) {
        this.setContent(a, "imageUri")
    };
    this.getImageUri = function () {
        return this.getDetail().imageUri
    };
};
RongIMClient.ImageMessage.obtain = function (content, imageUri) {
    return new RongIMClient.ImageMessage({
        content: content,
        imageUri: imageUri,
        extra: ""
    });
};
tool.inherit(RongIMClient.ImageMessage, RongIMClient.RongIMMessage, true);
//图文消息
RongIMClient.RichContentMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.RichContentMessage);
    this.setObjectName("RC:ImgTextMsg");
    this.setTitle = function (a) {
        this.setContent(a, "title")
    };
    this.getTitle = function () {
        return this.getDetail().title;
    };
    this.setImageUri = function (a) {
        this.setContent(a, "imageUri")
    };
    this.getImageUri = function () {
        return this.getDetail().imageUri;
    };
};
RongIMClient.RichContentMessage.obtain = function (title, content, imageUri) {
    return new RongIMClient.RichContentMessage({
        title: title,
        content: content,
        imageUri: imageUri,
        extra: ""
    })
};
tool.inherit(RongIMClient.RichContentMessage, RongIMClient.RongIMMessage, true);
//音频消息
RongIMClient.VoiceMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setObjectName("RC:VcMsg");
    this.setMessageType(RongIMClient.MessageType.VoiceMessage);
    this.setDuration = function (a) {
        this.setContent(a, "duration")
    };
    this.getDuration = function () {
        return this.getDetail().duration;
    };
};
RongIMClient.VoiceMessage.obtain = function (content, duration) {
    return new RongIMClient.VoiceMessage({
        content: content,
        duration: duration,
        extra: ""
    })
};
tool.inherit(RongIMClient.VoiceMessage, RongIMClient.RongIMMessage, true);
//客服握手消息
RongIMClient.HandshakeMessage = function () {
    RongIMClient.RongIMMessage.call(this);
    this.setMessageType(RongIMClient.MessageType.HandshakeMessage);
    this.setObjectName("RC:HsMsg");
};
tool.inherit(RongIMClient.HandshakeMessage, RongIMClient.RongIMMessage, true);
//中断客服消息
RongIMClient.SuspendMessage = function () {
    RongIMClient.RongIMMessage.call(this);
    this.setMessageType(RongIMClient.MessageType.SuspendMessage);
    this.setObjectName("RC:SpMsg");
};
tool.inherit(RongIMClient.SuspendMessage, RongIMClient.RongIMMessage, true);
//未知消息
RongIMClient.UnknownMessage = function (c, o) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.UnknownMessage);
    this.setObjectName(o);
};
tool.inherit(RongIMClient.UnknownMessage, RongIMClient.RongIMMessage, true);
//地理位置消息
RongIMClient.LocationMessage = function (c) {
    RongIMClient.RongIMMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.LocationMessage);
    this.setObjectName("RC:LBSMsg");
    this.setLatitude = function (a) {
        this.setContent(a, "latitude")
    };
    this.getLatitude = function () {
        return this.getDetail().latitude;
    };
    this.setLongitude = function (a) {
        this.setContent(a, "longitude")
    };
    this.getLongitude = function () {
        return this.getDetail().longitude;
    };
    this.setPoi = function (a) {
        this.setContent(a, "poi")
    };
    this.getPoi = function () {
        return this.getDetail().poi;
    };
};
RongIMClient.LocationMessage.obtain = function (content, latitude, longitude, poi) {
    return new RongIMClient.LocationMessage({
        content: content,
        latitude: latitude,
        longitude: longitude,
        poi: poi,
        extra: ""
    })
};
tool.inherit(RongIMClient.LocationMessage, RongIMClient.RongIMMessage, true);
//讨论组通知消息
RongIMClient.DiscussionNotificationMessage = function (c) {
    RongIMClient.NotificationMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.DiscussionNotificationMessage);
    this.setObjectName("RC:DizNtf");
    var isReceived = false;
    this.getExtension = function () {
        return this.getDetail().extension;
    };
    this.getOperator = function () {
        return this.getDetail().operator;
    };
    this.getType = function () {
        return this.getDetail().type;
    };
    this.isHasReceived = function () {
        return isReceived;
    };
    this.setExtension = function (a) {
        this.setContent(a, "extension")
    };
    this.setHasReceived = function (x) {
        isReceived = !!x;
    };
    this.setOperator = function (a) {
        this.setContent(a, "operator")
    };
    this.setType = function (a) {
        this.setContent(a, "type");
        //1:加入讨论组 2：退出讨论组 3:讨论组改名 4：讨论组群主T人
    };
};
tool.inherit(RongIMClient.DiscussionNotificationMessage, RongIMClient.NotificationMessage, true);
//信息通知消息，继承自NotificationMessage
RongIMClient.InformationNotificationMessage = function (c) {
    RongIMClient.NotificationMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.InformationNotificationMessage);
    this.setObjectName("RC:InfoNtf");
};
RongIMClient.InformationNotificationMessage.obtain = function (content) {
    return new RongIMClient.InformationNotificationMessage({
        content: content,
        extra: ""
    })
};
tool.inherit(RongIMClient.InformationNotificationMessage, RongIMClient.NotificationMessage, true);
//加删好友消息
RongIMClient.ContactNotificationMessage = function (c) {
    RongIMClient.NotificationMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.ContactNotificationMessage);
    this.setObjectName("RC:ContactNtf");
    this.getOperation = function () {
        return this.getDetail().operation;
    };
    this.setOperation = function (o) {
        this.setContent(o, 'operation');
    };
    this.setMessage = function (m) {
        this.setContent(m, 'message');
    };
    this.getMessage = function () {
        return this.getDetail().message;
    };
    this.getSourceUserId = function () {
        return this.getDetail().sourceUserId;
    };
    this.setSourceUserId = function (m) {
        this.setContent(m, 'sourceUserId');
    };
    this.getTargetUserId = function () {
        return this.getDetail().targetUserId;
    };
    this.setTargetUserId = function (m) {
        this.setContent(m, 'targetUserId');
    };
};
RongIMClient.ContactNotificationMessage.obtain = function (operation, sourceUserId, targetUserId, message) {
    return new RongIMClient.ContactNotificationMessage({
        operation: operation,
        sourceUserId: sourceUserId,
        targetUserId: targetUserId,
        message: message,
        extra: ""
    });
};
//允许加好友
RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_ACCEPT_RESPONSE = 'ContactOperationAcceptResponse';
//拒绝加好友
RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_REJECT_RESPONSE = 'ContactOperationRejectResponse';
//发起加好友请求
RongIMClient.ContactNotificationMessage.CONTACT_OPERATION_REQUEST = 'ContactOperationRequest';
tool.inherit(RongIMClient.ContactNotificationMessage, RongIMClient.NotificationMessage, true);
//个人信息通知消息
RongIMClient.ProfileNotificationMessage = function (c) {
    RongIMClient.NotificationMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.ProfileNotificationMessage);
    this.setObjectName("RC:ProfileNtf");
    this.getOperation = function () {
        return this.getDetail().operation;
    };
    this.setOperation = function (o) {
        this.setContent(o, 'operation');
    };
    this.getData = function () {
        return this.getDetail().data;
    };
    this.setData = function (o) {
        this.setContent(o, 'data');
    };
};
RongIMClient.ProfileNotificationMessage.obtain = function (operation, data) {
    return new RongIMClient.ProfileNotificationMessage({
        operation: operation,
        data: data,
        extra: ""
    });
};
tool.inherit(RongIMClient.ProfileNotificationMessage, RongIMClient.NotificationMessage, true);
//命令通知消息
RongIMClient.CommandNotificationMessage = function (c) {
    RongIMClient.NotificationMessage.call(this, c);
    this.setMessageType(RongIMClient.MessageType.CommandNotificationMessage);
    this.setObjectName("RC:CmdNtf");
    this.getData = function () {
        return this.getDetail().data;
    };
    this.setData = function (o) {
        this.setContent(o, "data");
    };
    this.getName = function () {
        return this.getDetail().name;
    };
    this.setName = function (o) {
        this.setContent(o, 'name');
    };
};
RongIMClient.CommandNotificationMessage.obtain = function (x, data) {
    return new RongIMClient.CommandNotificationMessage({
        name: x,
        data: data,
        extra: ""
    });
};
tool.inherit(RongIMClient.CommandNotificationMessage, RongIMClient.NotificationMessage, true);