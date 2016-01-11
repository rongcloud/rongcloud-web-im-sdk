//var io = require('./base');
var util = require('../tool');
var WS = require('./websocket');
var XHR = require('./polling');
var _Transport = {
    'websocket': WS,
    'xhr-polling': XHR
};
var Socket = function () {
    this.options = {
        token: "",
        transports: ["websocket", "xhr-polling"]//主要有两种(websocket，flashsocket)、comet
    };
    this.connected = false;
    this.connecting = false;
    this._events = {};
    this.currentURL = "";
    this.transport = this.getTransport(util.getTransportType());
    if (this.transport === null) {
        throw new Error("the channel was not supported")
    }
};
//此方法用于生产通道对象
Socket.prototype.getTransport = function (override) {
    var i = 0,
        transport = override || this.options.transports[i];
    if (_Transport[transport] && _Transport[transport].check() && _Transport[transport].XDomainCheck()) {
        return new _Transport[transport](this, {})
    }
    return null;
};
//连接服务器
Socket.prototype.connect = function (url, cb) {
    if (this.transport && arguments.length == 2) {
        if (url) {
            this.on("connect", cb || function () {
                })
        }
        if (this.connecting || this.connected) {
            this.disconnect()
        }
        this.connecting = true;
        if (url) {
            this.currentURL = url
        }
        this.transport.connect(this.currentURL); //是否重连
    }
    return this
};
Socket.prototype.send = function (data) {
    if (!this.transport || !this.connected) {
        //如果通道不可用，把消息压入队列中，等到通道可用时处理
        return this._queue(data)
    }
    this.transport.send(data)
};
Socket.prototype.disconnect = function (callback) {
    if (callback) {
        //出发状态改变观察者
        this.fire("StatusChanged", callback)
    }
    this.transport.disconnect();
    return this;
};
Socket.prototype.reconnect = function () {
    if (this.currentURL) {
        return this.connect(null, null);
    } else {
        throw new Error("reconnect:no have URL");
    }
};
Socket.prototype.fire = function (x, args) {
    if (x in this._events) {
        for (var i = 0, ii = this._events[x].length; i < ii; i++) {
            this._events[x][i](args);
        }
    }
    return this
};
Socket.prototype.removeEvent = function (x, fn) {
    if (x in this._events) {
        for (var a = 0, l = this._events[x].length; a < l; a++) {
            if (this._events[x][a] == fn) {
                this._events[x].splice(a, 1)
            }
        }
    }
    return this
};
Socket.prototype._queue = function (message) {
    if (!("_queueStack" in this)) {
        this._queueStack = []
    }
    this._queueStack.push(message);
    return this
};
Socket.prototype._doQueue = function () {
    if (!("_queueStack" in this) || !this._queueStack.length) {
        return this
    }
    for (var i = 0; i < this._queueStack.length; i++) {
        this.transport.send(this._queueStack[i])
    }
    this._queueStack = [];
    return this
};
Socket.prototype._onConnect = function () {
    this.connected = true;
    this.connecting = false;
    util.cookieHelper.setItem("rongSDK",util.getTransportType());
    this.fire("connect");
};
Socket.prototype._onMessage = function (data) {
    this.fire("message", data)
};
Socket.prototype._onDisconnect = function () {
    var wasConnected = this.connected;
    this.connected = false;
    this.connecting = false;
    this._queueStack = [];
    if (wasConnected) {
        this.fire("disconnect")
    }
};
//注册观察者
Socket.prototype.on = function (x, func) {
    if (!(typeof func == "function" && x)) {
        return this
    }
    if (x in this._events) {
        util.indexOf(this._events, func) == -1 && this._events[x].push(func)
    } else {
        this._events[x] = [func];
    }
    return this
};

var connect = function (token, args) {
    var instance = new Socket();
    connect.getInstance = function () {
        return instance
    };
    instance.connect(token, args);
    return instance;
};

module.exports = connect;