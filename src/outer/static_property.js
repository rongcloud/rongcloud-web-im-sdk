//版本号
RongIMClient.version = "0.9.10";
// RongIMClient.connect静态方法，执行连接操作
RongIMClient.connect = function (d, a) {
    if (!RongIMClient.getInstance) {
        throw new Error("please init")
    }
    //判断protobuf文件加载是否完成
    if (global.Modules) {
        //完成执行connect方法
        RongIMClient.getInstance().connect(d, a);
    } else {
        //把token、回调函数赋值给RongIMClient.connect，让protobuf文件自己来触发连接操作
        RongIMClient.connect.token = d;
        RongIMClient.connect.callback = a
    }

};
//是否有未接收的消息，jsonp方法
RongIMClient.hasUnreadMessages = function (appkey, token, callback) {
    var xss = document.createElement("script");
    xss.src = "http://api.cn.rong.io/message/exist.js?appKey=" + encodeURIComponent(appkey) + "&token=" + encodeURIComponent(token) + "&callBack=RongIMClient.hasUnreadMessages.RCcallback&_=" + Date.now();
    document.body.appendChild(xss);
    xss.onerror = function () {
        callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        xss.parentNode.removeChild(xss);
    };
    RongIMClient.hasUnreadMessages.RCcallback = function (x) {
        callback.onSuccess(!!+x.status);
        xss.parentNode.removeChild(xss);
    };
};
//初始化。生成一个RongIMClient单例
RongIMClient.init = function (d) {
    var instance = null;
    RongIMClient.getInstance === undefined && (RongIMClient.getInstance = function () {
        if (instance == null) {
            instance = new RongIMClient(d);
        }
        return instance;
    });
};
//自定义消息类型映射对象
var registerMessageTypeMapping = {};
//注册自定义消息
RongIMClient.registerMessageType = function (regMsg) {
    if (!RongIMClient.getInstance) {
        throw new Error("unInitException")
    }
    if ("messageType" in regMsg && "objectName" in regMsg && "fieldName" in regMsg) {
        registerMessageTypeMapping[regMsg.objectName] = regMsg.messageType;
        var temp = RongIMClient[regMsg.messageType] = function (c) {
            RongIMClient.RongIMMessage.call(this, c);
            RongIMClient.MessageType[regMsg.messageType] = regMsg.messageType;
            this.setMessageType(regMsg.messageType);
            this.setObjectName(regMsg.objectName);
            for (var i = 0; i < regMsg.fieldName.length; i++) {
                var item = regMsg.fieldName[i];
                this["set" + item] = (function (na) {
                    return function (a) {
                        this.setContent(a, na);
                    }
                })(item);
                this["get" + item] = (function (na) {
                    return function () {
                        return this.getDetail()[na];
                    }
                })(item);
            }
        };
        io.util._extends(temp, RongIMClient.RongIMMessage)
    } else
        throw new Error("registerMessageType:arguments type is error");
};
//设置连接状态监听器
RongIMClient.setConnectionStatusListener = function (a) {
    if (!RongIMClient.getInstance) {
        throw new Error("unInitException")
    }
    RongIMClient.getInstance().setConnectionStatusListener(a)
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
    this.toJSONString = function () {
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
        return JSON.stringify(c)
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