var io = {
    //io帮助对象
    util: {
        //注册页面加载事件
        load: function (fn) {
            if (document.readyState == "complete" || io.util._pageLoaded) {
                return fn()
            }
            if (global.attachEvent) {
                global.attachEvent("onload", fn)
            } else {
                global.addEventListener("load", fn, false)
            }
        },
        //继承
        inherit: function (ctor, superCtor) {
            for (var i in superCtor.prototype) {
                ctor.prototype[i] = superCtor.prototype[i]
            }
        },
        //扩展
        _extends: function (one, two) {
            one.prototype = new two;
            one.prototype.constructor = one;
        },
        //查找数组中位于指定下标的元素
        indexOf: function (arr, item, from) {
            for (var l = arr.length, i = (from < 0) ? Math.max(0, +from) : from || 0; i < l; i++) {
                if (arr[i] == item) {
                    return i
                }
            }
            return -1
        },
        //判断是否为数组
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) == "[object Array]";
        },
        //遍历，只能遍历数组
        forEach: (function () {
            if ([].forEach) {
                return function (arr, func) {
                    [].forEach.call(arr, func)
                }
            } else {
                return function (arr, func) {
                    for (var i = 0; i < arr.length; i++) {
                        func.call(arr, arr[i], i, arr)
                    }
                }
            }
        })(),
        //遍历，可遍历对象也可遍历数组
        each: function (obj, callback) {
            if (this.isArray(obj)) {
                this.forEach(x, callback);
            } else {
                for (var _name in obj) {
                    if (obj.hasOwnProperty(_name)) {
                        callback.call(obj, _name, obj[_name]);
                    }
                }
            }
        },
        //合并
        merge: function (target, additional) {
            for (var i in additional) {
                if (additional.hasOwnProperty(i)) {
                    target[i] = additional[i]
                }
            }
        },
        //把类数组转换为数组
        arrayFrom: function (typedarray) {
            if (Object.prototype.toString.call(typedarray) == "[object ArrayBuffer]") {
                var arr = new Int8Array(typedarray);
                return [].slice.call(arr)
            }
            return typedarray;
        },
        //删除数组指定项
        remove: function (array, func) {
            for (var i = 0; i < array.length; i++) {
                if (func(array[i])) {
                    return array.splice(i, 1)[0]
                }
            }
            return null
        },
        //把int64的时间对象转为时间戳
        int64ToTimestamp: function (obj, isDate) {
            if (obj.low === undefined) {
                return obj;
            }
            var low = obj.low;
            if (low < 0) {
                low += 0xffffffff + 1;
            }
            low = low.toString(16);
            var timestamp = parseInt(obj.high.toString(16) + "00000000".replace(new RegExp('0{' + low.length + '}$'), low), 16);
            if (isDate) {
                return new Date(timestamp)
            }
            return timestamp;
        },
        //是否为ios
        ios: /iphone|ipad/i.test(navigator.userAgent),
        //是否为安卓
        android: /android/i.test(navigator.userAgent)
    }
};
//io is an object for I/O
//io.connect is an Singleton pattern  这是一个单例模式。用于连接服务器
io.connect = function (token, args) {
    var instance = new this.createServer();
    this.getInstance = function () {
        return instance
    };
    instance.connect(token, args);
    return instance;
};
//create utils for io  判断当前浏览器是否支持json操作对象，不支持的话就自己生成一个json操作对象
(function () {
    io.util.load(function () {
        io.util._pageLoaded = true;
        if (!global.JSON) {
            global.JSON = {
                parse: function (sJSON) {
                    return eval('(' + sJSON + ')');
                },
                stringify: (function () {
                    var toString = Object.prototype.toString;
                    var isArray = Array.isArray || function (a) {
                        return toString.call(a) === '[object Array]';
                    };
                    var escMap = {
                        '"': '\\"',
                        '\\': '\\\\',
                        '\b': '\\b',
                        '\f': '\\f',
                        '\n': '\\n',
                        '\r': '\\r',
                        '\t': '\\t'
                    };
                    var escFunc = function (m) {
                        return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
                    };
                    var escRE = new RegExp('[\\"' + unescape("%00-%1F%u2028%u2029") + ']', 'g');
                    return function stringify(value) {
                        if (value == null) {
                            return 'null';
                        } else if (typeof value === 'number') {
                            return isFinite(value) ? value.toString() : 'null';
                        } else if (typeof value === 'boolean') {
                            return value.toString();
                        } else if (typeof value === 'object') {
                            if (typeof value.toJSON === 'function') {
                                return stringify(value.toJSON());
                            } else if (isArray(value)) {
                                var res = '[';
                                for (var i = 0; i < value.length; i++)
                                    res += (i ? ', ' : '') + stringify(value[i]);
                                return res + ']';
                            } else if (toString.call(value) === '[object Object]') {
                                var tmp = [];
                                for (var k in value) {
                                    if (value.hasOwnProperty(k))
                                        tmp.push(stringify(k) + ': ' + stringify(value[k]));
                                }
                                return '{' + tmp.join(', ') + '}';
                            }
                        }
                        return '"' + value.toString().replace(escRE, escFunc) + '"';
                    };
                })()
            };
        }

    });
})();
//the base class of io 通道对象的基类，利用抽象工厂的设计模式生产出具体的通道对象
(function () {
    var Transport = io.Transport = function (base, options) {
        this.base = base;
        this.options = {
            timeout: 30000
        };
        io.util.merge(this.options, options)
    };
    Transport.prototype.send = function () {
        throw new Error("No rewrite send() method")
    };
    Transport.prototype.connect = function () {
        throw new Error("No rewrite connect() method")
    };
    Transport.prototype.disconnect = function () {
        throw new Error("No rewrite disconnect() method")
    };
    //此方法只有comet用到
    Transport.prototype._encode = function (x) {
        var str = "?messageid=" + x.getMessageId() + "&header=" + x.getHeaderFlag() + "&sessionid=" + io.util.cookieHelper.getItem(Client.Endpoint.userId + "sId");
        if (!/(PubAckMessage|QueryConMessage)/.test(x.constructor._name)) {
            str += "&topic=" + x.getTopic() + "&targetid=" + (x.getTargetId() || "");
        }
        return {
            url: str,
            data: "getData" in x ? x.getData() : ""
        };
    };
    //转化服务器返回的二进制数组为一个具体的消息对象
    Transport.prototype._decode = function (data) {
        if (!data) {
            return;
        }
        if (io.util.isArray(data)) {
            this._onMessage(new MessageInputStream(data).readMessage());
        } else if (Object.prototype.toString.call(data) == "[object ArrayBuffer]") {
            this._onMessage(new MessageInputStream(io.util.arrayFrom(data)).readMessage());
        }
    };
    //此方法只有comet用到。接收服务器返回的json对象
    Transport.prototype._onData = function (data, header) {
        if (!data || data == "lost params") {
            return;
        }
        if (header) {
            io.util.cookieHelper.getItem(Client.Endpoint.userId + "sId") || io.util.cookieHelper.setItem(Client.Endpoint.userId + "sId", header);
        }
        var self = this, val = JSON.parse(data);
        if (!io.util.isArray(val)) {
            val = [val];
        }
        io.util.forEach(val, function (x) {
            self._onMessage(new MessageInputStream(x, true).readMessage());
        });
    };
    Transport.prototype._onMessage = function (message) {
        this.base._onMessage(message)
    };
    Transport.prototype._onConnect = function () {
        this.connected = true;
        this.connecting = false;
        this.base._onConnect()
    };
    Transport.prototype._onDisconnect = function () {
        this.connecting = false;
        this.connected = false;
        this.base._onDisconnect()
    };
})();
//build websocket class 创建websocket通道对象
(function () {
    var WS = io.Transport.websocket = function () {
        io.Transport.apply(this, arguments)
    };
    io.util.inherit(WS, io.Transport);
    WS.prototype.type = "websocket";
    WS.prototype.connect = function (url) {
        var self = this;
        //操作html5 websocket API
        this.socket = new WebSocket("ws://" + url);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = function () {
            self._onConnect();
        };
        this.socket.onmessage = function (ev) {
            //判断数据是不是字符串，如果是字符串那么就是flash传过来的。
            if (typeof ev.data == "string") {
                self._decode(ev.data.split(","))
            } else {
                self._decode(ev.data)
            }
        };
        this.socket.onclose = function () {
            self._onClose()
        };
        this.socket.onerror = function () {
            //当websocket执行出错的时候，判断是否已经注册了重连对象。有的话就执行重连对象的onError，没有的话主动抛出一个错误
            if (bridge._client && bridge._client.reconnectObj.onError) {
                bridge._client.reconnectObj.onError(RongIMClient.ConnectErrorStatus.setValue(2));
                delete bridge._client.reconnectObj.onError;
            } else {
                throw new Error("network is unavailable or unknown error");
            }
        };
        return this
    };
    //发送数据到服务器
    WS.prototype.send = function (data) {
        var stream = new RongIMStream([]),
            msg = new MessageOutputStream(stream);
        msg.writeMessage(data);
        var val = stream.getBytesArray(true);
        if (this.socket.readyState == 1) {
            if (global.Int8Array && !global.WEB_SOCKET_FORCE_FLASH) {
                //Int8Array为html5 API
                var binary = new Int8Array(val);
                this.socket.send(binary.buffer)
            } else {
                this.socket.send(val + "")
            }
        }
        return this
    };
    WS.prototype.disconnect = function () {
        if (this.socket) {
            this.socket.close()
        }
        return this
    };
    WS.prototype._onClose = function () {
        this._onDisconnect();
        return this
    };
    WS.check = function () {
        return "WebSocket" in global && WebSocket.prototype && WebSocket.prototype.send && typeof WebSocket !== "undefined"
    };
    WS.XDomainCheck = function () {
        return true;
    }
})();
//the base class of XHR_POLLING  comet通道对象的基类
(function () {
    var empty = new Function,
    //利用withCredentials判断是否支持跨域操作
        XMLHttpRequestCORS = (function () {
            if (!('XMLHttpRequest' in global))
                return false;
            var a = new XMLHttpRequest();
            return a.withCredentials !== undefined;
        })(),
    //生成跨域传输对象
        request = function () {
            if ('XDomainRequest' in global)
                return new window["XDomainRequest"]();
            if ('XMLHttpRequest' in global && XMLHttpRequestCORS)
                return new XMLHttpRequest();
            return false;
        },
        XHR = io.Transport.XHR = function () {
            io.Transport.apply(this, arguments);
        };
    io.util.inherit(XHR, io.Transport);
    //comet链接服务器，先从本地存储对象里是否存有当前登陆人员的sessionid，如果有的话就不再从服务器申请sessionid，直接用本地存储的sessionid链接服务器。
    XHR.prototype.connect = function (url) {
        var sid = io.util.cookieHelper.getItem(Client.Endpoint.userId + "sId"),
            _that = this;
        if (sid) {
            io.getInstance().currentURL = url;
            setTimeout(function () {
                _that.onopen("{\"status\":0,\"userId\":\"" + Client.Endpoint.userId + "\",\"headerCode\":32,\"messageId\":0,\"sessionid\":\"" + sid + "\"}");
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
        this._sendXhr = this._request(Client.Endpoint.host + "/websocket" + data.url, 'POST');
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

        this._sendXhr.send(JSON.stringify(data.data));
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
            io.Transport.prototype._onDisconnect.call(this);
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
})();
//build XHR_POLLING class 构建comet通道对象
(function () {
    var empty = new Function(),
        XHRPolling = io.Transport['xhr-polling'] = function () {
            io.Transport.XHR.apply(this, arguments);
        };
    io.util.inherit(XHRPolling, io.Transport.XHR);
    XHRPolling.prototype.type = 'xhr-polling';
    //链接服务器，如果是ios和安卓就等10毫秒执行。
    XHRPolling.prototype.connect = function (x) {
        if (io.util.ios || io.util.android) {
            var self = this;
            io.util.load(function () {
                setTimeout(function () {
                    io.Transport.XHR.prototype.connect.call(self, x);
                }, 10);
            });
        } else {
            io.Transport.XHR.prototype.connect.call(this, x);
        }
    };
    //发送pullmsg.js请求，这里是一个死循环调用。用于保持pullmsg.js请求
    XHRPolling.prototype.onopen = function (a, b) {
        this._onData(a, b);
        if (/"headerCode":-32,/.test(a)) {
            return;
        }
        this._get(Client.Endpoint.host + "/pullmsg.js?sessionid=" + io.util.cookieHelper.getItem(Client.Endpoint.userId + "sId"), true);
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
            io.util.cookieHelper.removeItem(Client.Endpoint.userId + "sId");
            self._onDisconnect(true);
            io.getInstance().connecting = false;
            io.getInstance().connected = false;
            io.getInstance().connect(null, null);
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
        return io.Transport.XHR.check();
    };
    XHRPolling.XDomainCheck = function () {
        return io.Transport.XHR.XDomainCheck();
    };
})();
//use abstract factory pattern build a I/O object for transport，工厂方法，生产具体消息对象
(function () {
    var Socket = io.createServer = function () {
        this.options = {
            token: "",
            transports: ["websocket", "xhr-polling"]//主要有两种(websocket，flashsocket)、comet
        };
        this.connected = false;
        this.connecting = false;
        this._events = {};
        this.currentURL = "";
        this.transport = this.getTransport(io._TransportType);
        if (this.transport === null) {
            throw new Error("the channel was not supported")
        }
    };
    //此方法用于生产通道对象
    Socket.prototype.getTransport = function (override) {
        var i = 0,
            transport = override || this.options.transports[i];
        if (io.Transport[transport] && io.Transport[transport].check() && io.Transport[transport].XDomainCheck()) {
            return new io.Transport[transport](this, {})
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
        io.util.cookieHelper.setItem("rongSDK", io._TransportType);
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
            io.util.indexOf(this._events, func) == -1 && this._events[x].push(func)
        } else {
            this._events[x] = [func];
        }
        return this
    };
})();