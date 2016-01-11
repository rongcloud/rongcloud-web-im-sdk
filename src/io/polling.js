var Transport = require('./base');
var util = require('../tool');
var mapping=require('../mapping');
var global = window;
var empty = new Function;
//利用withCredentials判断是否支持跨域操作
var XMLHttpRequestCORS = (function () {
    if (!('XMLHttpRequest' in global))
        return false;
    var a = new XMLHttpRequest();
    return a.withCredentials !== undefined;
})();
//生成跨域传输对象
var request = function () {
    if ('XDomainRequest' in global)
        return new global["XDomainRequest"]();
    if ('XMLHttpRequest' in global && XMLHttpRequestCORS)
        return new XMLHttpRequest();
    return false;
};
var XHR = Transport.XHR = function () {
    Transport.apply(this, arguments);
};
util.inherit(XHR, Transport);
//comet链接服务器，先从本地存储对象里是否存有当前登陆人员的sessionid，如果有的话就不再从服务器申请sessionid，直接用本地存储的sessionid链接服务器。
XHR.prototype.connect = function (url) {
    var sid = util.cookieHelper.getItem(mapping.Endpoint.userId + "sId"),
        _that = this;
    if (sid) {
        //io.getInstance().currentURL = url;
        setTimeout(function () {
            _that.onopen("{\"status\":0,\"userId\":\"" + mapping.Endpoint.userId + "\",\"headerCode\":32,\"messageId\":0,\"sessionid\":\"" + sid + "\"}");
            _that._onConnect();
        }, 500);
        return this;
    }
    this._get(url);
    return this;
};
XHR.prototype._checkSend = function (data) {
    //格式化数据为comet指定的数据格式，然后发送
    var encoded = this._encode(data);
    this._send(encoded);
};
XHR.prototype.send = function (data) {
    this._checkSend(data);
    return this;
};
//利用post方法发送数据，有数据返回就执行_onData(responseText)方法
XHR.prototype._send = function (data) {
    var self = this;
    this._sendXhr = this._request(mapping.Endpoint.host + "/websocket" + data.url, 'POST');
    if ("onload" in this._sendXhr) {
        this._sendXhr.onload = function () {
            this.onload = empty;
            self._onData(this.responseText);
        };
        this._sendXhr.onerror = function () {
            this.onerror = empty;
        };
    } else {
        this._sendXhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                this.onreadystatechange = empty;
                if (/^(202|200)$/.test(this.status)) {
                    self._onData(this.responseText);
                }
            }
        };
    }
    this._sendXhr.send(util.JSON.stringify(data.data));
};
XHR.prototype.disconnect = function () {
    this._onDisconnect();
    return this;
};
//断开连接，强制中止所有正在连接的http请求
XHR.prototype._onDisconnect = function (isrecon) {
    if (this._xhr) {
        this._xhr.onreadystatechange = this._xhr.onload = empty;
        this._xhr.abort();
        this._xhr = null;
    }
    if (this._sendXhr) {
        this._sendXhr.onreadystatechange = this._sendXhr.onload = empty;
        this._sendXhr.abort();
        this._sendXhr = null;
    }
    if (isrecon === undefined) {
        Transport.prototype._onDisconnect.call(this);
    }
};
//打开跨域请求对象
XHR.prototype._request = function (url, method, multipart) {
    var req = request();
    if (multipart)
        req.multipart = true;
    req.open(method || 'GET', "http://" + url);
    if (method == 'POST' && 'setRequestHeader' in req) {
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    }
    return req;
};
XHR.check = function () {
    try {
        if (request())
            return true;
    } catch (e) {
    }
    return false;
};
XHR.XDomainCheck = function () {
    return XHR.check();
};
XHR.request = request;
var XHRPolling = Transport['xhr-polling'] = function () {
    Transport.XHR.apply(this, arguments);
};
util.inherit(XHRPolling, Transport.XHR);
XHRPolling.prototype.type = 'xhr-polling';
//链接服务器，如果是ios和安卓就等10毫秒执行。
XHRPolling.prototype.connect = function (x) {
    if (util.ios || util.android) {
        var self = this;
        util.load(function () {
            setTimeout(function () {
                Transport.XHR.prototype.connect.call(self, x);
            }, 10);
        });
    } else {
        Transport.XHR.prototype.connect.call(this, x);
    }
};
//发送pullmsg.js请求，这里是一个死循环调用。用于保持pullmsg.js请求
XHRPolling.prototype.onopen = function (a, b) {
    this._onData(a, b);
    if (/"headerCode":-32,/.test(a)) {
        return;
    }
    this._get(mapping.Endpoint.host + "/pullmsg.js?sessionid=" + util.cookieHelper.getItem(mapping.Endpoint.userId + "sId"), true);
};
//http状态码对应执行对象
var status = {
    //arg参数有值说明是链接服务器请求，直接_onConnect方法
    200: function (self, text, arg) {
        var txt = text.match(/"sessionid":"\S+?(?=")/);
        self.onopen(text, txt ? txt[0].slice(13) : void 0);
        arg || self._onConnect();
    },
    //http状态码为400，断开连接
    400: function (self) {
        util.cookieHelper.removeItem(mapping.Endpoint.userId + "sId");
        self._onDisconnect(true);
        self._baseConnect();
    }
};
//用于接收pullmsg.js请求中服务器返回的消息数据
XHRPolling.prototype._get = function (symbol, arg) {
    var self = this;
    this._xhr = this._request(symbol, 'GET');
    if ("onload" in this._xhr) {
        this._xhr.onload = function () {
            this.onload = empty;
            if (this.responseText == 'lost params') {
                status['400'](self);
            } else {
                status['200'](self, this.responseText, arg);
            }
        };
        this._xhr.onerror = function () {
            self._onDisconnect();
        }
    } else {
        this._xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                this.onreadystatechange = empty;
                if (/^(200|202)$/.test(this.status)) {
                    status['200'](self, this.responseText, arg);
                } else if (/^(400|403)$/.test(this.status)) {
                    status['400'](self);
                } else {
                    self._onDisconnect();
                }
            }
        };
    }
    this._xhr.send();
};
XHRPolling.check = function () {
    return Transport.XHR.check();
};
XHRPolling.XDomainCheck = function () {
    return Transport.XHR.XDomainCheck();
};
module.exports = XHRPolling;