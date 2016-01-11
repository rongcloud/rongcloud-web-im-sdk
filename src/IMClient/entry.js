var RongIMClient = require('./RongIMClient');
var tool = require('../tool');
var mapping = require('../mapping');
require('../ready');
require('./affiliatedMessage');
require('./coustomMessage');
require('./IMEnum');
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
    tool.jsonp("http://api.cn.rong.io/message/exist.js?appKey=" +
        encodeURIComponent(appkey) + "&token=" + encodeURIComponent(token),
        "callBack", function (x) {
            callback.onSuccess(!!+x.status);
        }, function () {
            callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
        });
};
//初始化。生成一个RongIMClient单例
RongIMClient.init = function (d, conf) {

    mapping.WEB_SOCKET_FORCE_FLASH = !!conf.WEB_SOCKET_FORCE_FLASH;
    mapping.WEB_XHR_POLLING = !!conf.WEB_XHR_POLLING;
    mapping.FORCE_LOCAL_STORAGE = !!conf.FORCE_LOCAL_STORAGE;

    var instance = null;
    RongIMClient.getInstance === undefined && (RongIMClient.getInstance = function () {
        if (instance == null) {
            instance = new RongIMClient(d);
        }
        return instance;
    });
};
//注册自定义消息
RongIMClient.registerMessageType = function (regMsg) {
    if (!RongIMClient.getInstance) {
        throw new Error("unInitException")
    }
    if ("messageType" in regMsg && "objectName" in regMsg && "fieldName" in regMsg) {
        mapping.registerMessageTypeMapping[regMsg.objectName] = regMsg.messageType;
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
        tool.inherit(temp, RongIMClient.RongIMMessage, true);
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
window.RongIMClient = RongIMClient;