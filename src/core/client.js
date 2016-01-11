var entity = require('../message/MessageEntity');
var handler = require('./messageHandler');
var channel = require('./channel');
var ack = require('./messageCallback');
var mapping = require('../mapping');
var md5 = require('../md5');
var tool = require('../tool');
var en = require('../message/msgEnum');
var Qos = en.Qos;
var global = window;
//初始化通道对象
ack.ConnectAck.redirect = function (callback) {
    Client.getInstance().channel = new channel(Client.Endpoint, callback, Client.getInstance());
};
//连接端类，逻辑处理全在此类中
function Client(_to, _ap) {
    this.timeoutMillis = 100000;
    this.timeout_ = 0;
    this.appId = _ap;
    this.token = _to;
    this.sdkVer = "1.0.0";
    this.apiVer = "1.0.0";
    this.channel = null;
    this.handler = null;
    this.userId = "";
    this.heartbeat = 0;
    this.chatroomId = '';
    //用于心跳启动定时器
}
Client.prototype.resumeTimer = function () {
    var self = this;
    if (!this.timeout_) {
        this.timeout_ = setTimeout(function () {
            if (!self.timeout_) {
                return;
            }
            try {
                self.channel.disconnect()
            } catch (e) {
            }
            clearTimeout(self.timeout_);
            self.timeout_ = 0;
            self.channel.reconnect();
            self.channel.socket.fire("StatusChanged", 5);
        }, self.timeoutMillis)
    }
};
//销毁心跳定时器
Client.prototype.pauseTimer = function () {
    if (this.timeout_) {
        clearTimeout(this.timeout_);
        this.timeout_ = 0;
    }
};
//连接服务器
Client.prototype.connect = function (_callback) {
    var self = this;
    //判断navi是否已经返回地址
    if (mapping.Endpoint.host) {
        if (tool.getTransportType() == "websocket") {
            if (!global.WebSocket) {
                _callback.onError(RongIMClient.ConnectErrorStatus.setValue(1));
                return;
            }
            //判断是否是flashsocket  是的话就加载代理文件
            'loadFlashPolicyFile' in WebSocket && WebSocket.loadFlashPolicyFile();
        }
        //实例消息处理类
        this.handler = new handler(this);
        //设置连接回调
        this.handler.setConnectCallback(_callback);
        //实例通道类型
        this.channel = new channel(mapping.Endpoint, function () {
            tool.getTransportType() == "websocket" && self.keepLive()
        }, this);
        //触发状态改变观察者
        this.channel.socket.fire("StatusChanged", 1)
    } else {
        //没有返回地址就手动抛出错误
        _callback.onError(RongIMClient.ConnectErrorStatus.setValue(5));
    }
};
//心跳启动方法
Client.prototype.keepLive = function () {
    var self = this;
    if (this.heartbeat > 0) {
        clearInterval(this.heartbeat);
    }
    this.heartbeat = setInterval(function () {
        self.resumeTimer();
        self.channel.writeAndFlush(new entity.PingReqMessage());
        console.log("keep live pingReqMessage sending appId " + self.appId);
    }, 180000);
};
//心跳停止方法
Client.prototype.clearHeartbeat = function () {
    clearInterval(this.heartbeat);
    this.heartbeat = 0;
    this.pauseTimer();
};
//发送publishMessage消息
Client.prototype.publishMessage = function (_topic, _data, _targetId, _callback, _msg) {
    var msgId = tool.messageIdHandler.messageIdPlus(this.channel.reconnect);
    if (!msgId) {
        return;
    }
    var msg = new entity.PublishMessage(_topic, _data, _targetId);
    msg.setMessageId(msgId);
    if (_callback) {
        msg.setQos(Qos.AT_LEAST_ONCE);
        this.handler.putCallback(new ack.PublishCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), _msg)
    } else {
        msg.setQos(Qos.AT_MOST_ONCE);
    }
    this.channel.writeAndFlush(msg);
};
//发送queryMessage消息
Client.prototype.queryMessage = function (_topic, _data, _targetId, _qos, _callback, pbtype) {
    //如果topic是userinfo，就去userinfo缓存对象里拿，没有的话再去请求服务器拉取userinfo
    if (_topic == "userInf") {
        if (mapping.userInfoMapping[_targetId]) {
            _callback.onSuccess(mapping.userInfoMapping[_targetId]);
            return;
        }
    }
    var msgId = tool.messageIdHandler.messageIdPlus(this.channel.reconnect);
    if (!msgId) {
        return;
    }
    var msg = new entity.QueryMessage(_topic, _data, _targetId);
    msg.setMessageId(msgId);
    msg.setQos(_qos);
    this.handler.putCallback(new ack.QueryCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), pbtype);
    this.channel.writeAndFlush(msg)
};
//同步消息
Client.prototype.syncTime = function (_type, pullTime) {
    SyncTimeQueue.push({type: _type, pulltime: pullTime});
    //如果队列中只有一个成员并且状态已经完成就执行invoke方法
    if (SyncTimeQueue.length == 1 && SyncTimeQueue.state == "complete") {
        invoke()
    }
};
//声明Client.connect静态方法，返回Client实例
Client.connect = function (appId, token, callback) {
    //如果appid和本地存储的不一样，清空所有本地存储数据
    var oldAppId = tool.cookieHelper.getItem("appId");
    if (oldAppId && oldAppId != appId) {
        tool.cookieHelper.clear();
        tool.cookieHelper.setItem("appId", appId);
    }
    var client = new Client(token, appId);
    Client.getInstance = function () {
        return client;
    };
    //请求navi导航
    Client.getServerEndpoint(token, appId, callback, true);
    return client;
};
Client.getServerEndpoint = function (_token, _appId, callback, unignore) {
    if (unignore) {
        //根据token生成MD5截取8-16下标的数据与本地存储的导航信息进行比对
        //如果信息和上次的通道类型都一样，不执行navi请求，用本地存储的导航信息连接服务器
        var naviStr = md5(_token).slice(8, 16),
            _old = tool.cookieHelper.getItem("navi\\w+?"),
            _new = tool.cookieHelper.getItem("navi" + naviStr);
        if (_old == _new && _new !== null && tool.cookieHelper.getItem("rongSDK") == tool.getTransportType()) {
            var obj = unescape(_old).split(",");
            setTimeout(function () {
                RongBinaryHelper.__host = mapping.Endpoint.host = obj[0];
                mapping.Endpoint.userId = obj[1];
                Client.getInstance().connect(callback);
            }, 500);
            return;
        }
    }
    //导航信息，切换Url对象的key进行线上线下测试操作
    var Url = {
        //测试环境
        "navUrl-Debug": "http://nav.sunquan.rongcloud.net:9001/",
        //线上环境
        "navUrl-Release": "http://nav.cn.rong.io/"
    };
    tool.jsonp(Url["navUrl-Release"] +
        (tool.getTransportType() == "xhr-polling" ? "cometnavi.js" : "navi.js") +
        "?appId=" + _appId + "&token=" + encodeURIComponent(_token),
        "callBack",
        function (data) {
            Client.getInstance().connect(callback);
            //把导航返回的server字段赋值给RongBinaryHelper.__host，因为flash widget需要使用
            RongBinaryHelper.__host = mapping.Endpoint.host = data["server"];
            mapping.Endpoint.userId = data.userId;
            //替换本地存储的导航信息
            var temp = document.cookie.match(new RegExp("(^| )navi\\w+?=([^;]*)(;|$)"));
            temp !== null && tool.cookieHelper.removeItem(temp[0].split("=")[0].replace(/^\s/, ""));
            tool.cookieHelper.setItem("navi" + md5(Client.getInstance().token).slice(8, 16), data["server"] + "," + (data.userId || ""));
        }, function () {
            callback.onError(RongIMClient.ConnectErrorStatus.setValue(4));
        });
};
//同步消息队列
var SyncTimeQueue = [];
//队列的执行状态
SyncTimeQueue.state = "complete";
function invoke() {
    var time, modules, str, target;
    //从队列开头取出一个赋值给temp变量
    var temp = SyncTimeQueue.shift();
    var self = Client.getInstance();
    if (!temp) {
        return;
    }
    //改变状态为pending
    SyncTimeQueue.state = "pending";
    if (temp.type != 2) {
        //普通消息
        time = tool.cookieHelper.getItem(self.userId) || 0;
        modules = new Modules.SyncRequestMsg();
        modules.setIspolling(false);
        str = 'pullMsg';
        target = self.userId;
    } else {
        //聊天室消息
        time = tool.cookieHelper.getItem(self.userId + "CST") || 0;
        modules = new Modules.ChrmPullMsg();
        modules.setCount(0);
        str = 'chrmPull';
        if (self.chatroomId === '') {
            //受到聊天室消息，但是本地没有加入聊天室就手动抛出一个错误
            throw new Error("syncTime:Received messages of chatroom but was not init");
        }
        target = self.chatroomId;
    }
    //判断服务器给的时间是否消息本地存储的时间，小于的话不执行拉取操作，进行一下步队列操作
    if (temp.pulltime <= time) {
        SyncTimeQueue.state = "complete";
        invoke();
        return;
    }
    modules.setSyncTime(time);
    //发送queryMessage请求
    self.queryMessage(str, tool.arrayFrom(modules.toArrayBuffer()), target, Qos.AT_LEAST_ONCE, {
        onSuccess: function (collection) {
            var sync = tool.int64ToTimestamp(collection.syncTime),
                symbol = self.userId;
            if (str == "chrmPull") {
                symbol += 'CST';
            }
            //把返回时间戳存入本地，普通消息key为userid，聊天室消息key为userid＋'CST'；value都为服务器返回的时间戳
            tool.cookieHelper.setItem(symbol, sync);
            //把拉取到的消息逐条传给消息监听器
            var list = collection.list;
            for (var i = 0; i < list.length; i++) {
                Client.getInstance().handler.onReceived(list[i])
            }
            SyncTimeQueue.state = "complete";
            invoke();
        },
        onError: function () {
            SyncTimeQueue.state = "complete";
            invoke();
        }
    }, "DownStreamMessages");
}
module.exports = Client;