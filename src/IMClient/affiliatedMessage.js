var RongIMClient=require('./RongIMClient');
var tool=require('../tool');
//把具体的消息类型转化为protobuf格式的类
RongIMClient.MessageContent = function (f) {
    if (!(f instanceof RongIMClient.RongIMMessage)) {
        throw new Error("wrong parameter")
    }
};
RongIMClient.MessageContent.prototype.getMessage = function () {
    return f
};
RongIMClient.MessageContent.prototype.encode = function () {
    var c = new Modules.UpStreamMessage();
    c.setSessionId(0);
    c.setClassname(f.getObjectName());
    c.setContent(tool.JSON.stringify(f.getDetail()));
    var val = c.toArrayBuffer();
    if (Object.prototype.toString.call(val) == "[object ArrayBuffer]") {
        return [].slice.call(new Int8Array(val))
    }
    return val
};
//发送中处理消息的类，sendMessage方法的第三个参数就是这个对象
RongIMClient.MessageHandler = function (a) {
    if (typeof a == "function") {
        this.process = a;
    } else {
        throw new Error("MessageHandler:arguments type is error")
    }
};
//接收状态
RongIMClient.ReceivedStatus = function (d) {
    var a = d || 1;
    this.getFlag = function () {
        return a
    };
    this.isDownload = function () {
        return a == 1
    };
    this.isListened = function () {
        return a == 2
    };
    this.isRead = function () {
        return a == 3
    };
    this.setDownload = function () {
        a = 1
    };
    this.setListened = function () {
        a = 2
    };
    this.setRead = function () {
        a = 3
    };
};
//用户信息
RongIMClient.UserInfo = function (h, l, a) {
    var k = h,
        j = l,
        i = a;
    this.getUserName = function () {
        return j
    };
    this.getPortraitUri = function () {
        return i
    };
    this.getUserId = function () {
        return k
    };
    this.setUserName = function (c) {
        j = c
    };
    this.setPortraitUri = function (c) {
        i = c
    };
    this.setUserId = function (c) {
        k = c
    }
};
//会话信息
RongIMClient.Conversation = function () {
    var s = this,
        a = (new Date).getTime(),
        D, v, B, w, E, G, t, F, y, C, A, H, x, u = 0, por,
        z = RongIMClient.ConversationNotificationStatus.NOTIFY;
    this.getConversationTitle = function () {
        return G
    };
    this.toJSON = function () {
        var c = {
            "senderUserName": E,
            lastTime: a,
            "objectName": D,
            "senderUserId": v,
            "receivedTime": B,
            "conversationTitle": G,
            "conversationType": t,
            "latestMessageId": C,
            "sentTime": H,
            "targetId": x,
            "notificationStatus": z
        };
        return tool.JSON.stringify(c)
    };
    this.setReceivedStatus = function (c) {
        w = c
    };
    this.getReceivedStatus = function () {
        return w
    };
    this.getConversationType = function () {
        return t
    };
    this.getDraft = function () {
        return F
    };
    this.getLatestMessage = function () {
        return y
    };
    this.getLatestMessageId = function () {
        return C
    };
    this.getNotificationStatus = function () {
        return z
    };
    this.getObjectName = function () {
        return D
    };
    this.getReceivedTime = function () {
        return B
    };
    this.getSenderUserId = function () {
        return v
    };
    this.getSentStatus = function () {
        return A
    };
    this.getSentTime = function () {
        return H
    };
    this.getTargetId = function () {
        return x
    };
    this.getUnreadMessageCount = function () {
        return u
    };
    this.isTop = function () {
        var e = RongIMClient.getInstance().getConversationList();
        return e[0] != undefined && e[0].getTargetId() == this.getTargetId() && e[0].getConversationType() == this.getConversationType();
    };
    this.setConversationTitle = function (c) {
        G = c
    };
    this.getConversationPortrait = function () {
        return por;
    };
    this.setConversationPortrait = function (p) {
        por = p;
    };
    this.setConversationType = function (c) {
        t = c
    };
    this.setDraft = function (c) {
        F = c
    };
    this.setSenderUserName = function (c) {
        E = c
    };
    this.setLatestMessage = function (c) {
        y = c
    };
    this.setLatestMessageId = function (c) {
        C = c
    };
    this.setNotificationStatus = function (c) {
        z = c instanceof RongIMClient.ConversationNotificationStatus ? c : RongIMClient.ConversationNotificationStatus.setValue(c);
    };
    this.setObjectName = function (c) {
        D = c
    };
    this.setReceivedTime = function (c) {
        a = B = c
    };
    this.setSenderUserId = function (c) {
        v = c
    };
    this.getLatestTime = function () {
        return a
    };
    this.setSentStatus = function (c) {
        return !!(A = c)
    };
    this.setSentTime = function (c) {
        a = H = c
    };
    this.setTargetId = function (c) {
        x = c
    };
    this.setTop = function () {
        if (s.getTargetId() == undefined || this.isTop()) {
            return
        }
        RongIMClient.getInstance().getConversationList().add(this);
    };
    this.setUnreadMessageCount = function (c) {
        u = c
    }
};
//讨论组信息
RongIMClient.Discussion = function (m, l, a, q, p) {
    var s = m,
        t = l,
        r = a,
        o = q,
        n = p;
    this.getCreatorId = function () {
        return r
    };
    this.getId = function () {
        return s
    };
    this.getMemberIdList = function () {
        return n
    };
    this.getName = function () {
        return t
    };
    this.isOpen = function () {
        return o
    };
    this.setCreatorId = function (c) {
        r = c
    };
    this.setId = function (c) {
        s = c
    };
    this.setMemberIdList = function (c) {
        n = c
    };
    this.setName = function (c) {
        t = c
    };
    this.setOpen = function (c) {
        o = !!c
    }
};
//群信息
RongIMClient.Group = function (j, l, a) {
    var h = j,
        k = l,
        i = a;
    this.getId = function () {
        return h
    };
    this.getName = function () {
        return k
    };
    this.getPortraitUri = function () {
        return i
    };
    this.setId = function (c) {
        h = c
    };
    this.setName = function (c) {
        k = c
    };
    this.setPortraitUri = function (c) {
        i = c
    }
};
