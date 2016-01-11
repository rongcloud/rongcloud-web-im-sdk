var mapping = require('./mapping');
var doc = document;
var global = window;
var transportType = '';
var tool = {
    //注册页面加载事件
    load: function (fn) {
        if (doc.readyState == "complete" || this._pageLoaded) {
            return fn()
        }
        if (global.attachEvent) {
            global.attachEvent("onload", fn)
        } else {
            global.addEventListener("load", fn, false)
        }
    },
    //继承
    inherit: function (ctor, superCtor,isClassExt) {
        var f = function () {
        };
        if(isClassExt){
            f.prototype = new superCtor;
        }else{
            f.prototype = superCtor.prototype;
        }
        ctor.super_ = superCtor;
        ctor.prototype = new f();
        ctor.prototype.constructor = ctor;
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
    getType: function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    },
    ready: function (callback) {
        if (doc.readyState == "interactive" || doc.readyState == "complete") {
            callback();
        } else if (doc.addEventListener) {
            doc.addEventListener("DOMContentLoaded", function () {
                doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
                callback();
            }, false)
        } else if (doc.attachEvent) {
            doc.attachEvent("onreadystatechange", function () {
                if (doc.readyState === "interactive" || doc.readyState === "complete") {
                    doc.detachEvent("onreadystatechange", arguments.callee);
                    callback()
                }
            })
        }
    },
    loadScript: function (src, callback) {
        var script = doc.createElement("script");
        var body = doc.body || doc.getElementsByTagName("body")[0];
        script.src = src;
        body.appendChild(script);
        if ('onload' in script) {
            script.onload = function () {
                callback && callback();
            }
        } else {
            script.onreadystatechange = function () {
                if (script.readyState === 'complete') {
                    callback && callback();
                }
            }
        }
    },
    jsonp: function (src, jsonpCallback, callback, onFail) {
        var cbName = 'cb' + jsonpCount++;
        var cbAck = 'window.RongIMClient.jsonpPool.' + cbName;
        if (global.RongIMClient.jsonpPool === void 0) {
            global.RongIMClient.jsonpPool = {};
        }
        global.RongIMClient.jsonpPool[cbName] = function (data) {
            try {
                callback(data);
            } finally {
                delete global.RongIMClient.jsonpPool[cbName];
                script.parentNode.removeChild(script);
            }
        };
        var script = doc.createElement('script');
        script.src = src + '&' + jsonpCallback + '=' + cbAck;
        script.onerror = function () {
            onFail();
        };
        doc.body.appendChild(script);
    },
    getTransportType: function () {
        return transportType;
    },
    setTransportType: function (t) {
        transportType = t;
    },
    //是否为ios
    ios: /iphone|ipad/i.test(navigator.userAgent),
    //是否为安卓
    android: /android/i.test(navigator.userAgent),
    _pageLoaded: false
};
var jsonpCount = 1;
//此方法判断是否设置FORCE_LOCAL_STORAGE为true，如果是true则在localstorage中存储。否则在cookie中存储。
tool.cookieHelper = (function () {
    var obj, old;
    if (mapping.globalConf.FORCE_LOCAL_STORAGE === true) {
        old = localStorage.setItem;
        localStorage.setItem = function (x, value) {
            if (localStorage.length == 15) {
                localStorage.removeItem(localStorage.key(0));
            }
            old.call(localStorage, x, value);
        };
        obj = localStorage;
    } else {
        obj = {
            getItem: function (x) {
                var arr = doc.cookie.match(new RegExp("(^| )" + x + "=([^;]*)(;|$)"));
                if (arr != null) {
                    return (arr[2]);
                }
                return null;
            },
            setItem: function (x, value) {
                var exp = new Date();
                exp.setTime(exp.getTime() + 15 * 24 * 3600 * 1000);
                doc.cookie = x + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
            },
            removeItem: function (x) {
                if (this.getItem(x)) {
                    doc.cookie = x + "=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
                }
            },
            clear: function () {
                var keys = doc.cookie.match(/[^ =;]+(?=\=)/g);
                if (keys) {
                    for (var i = keys.length; i--;)
                        doc.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
                }
            }
        }
    }
    return obj;
})();
tool.load(function () {
    tool._pageLoaded = true;
    if (!global.JSON) {
        tool.JSON = {
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
    } else {
        tool.JSON = global.JSON;
    }
    tool.messageIdHandler = (function () {
        var messageId = 0,
            isXHR = tool.getTransportType() === "xhr-polling",
            init = function () {
                messageId = +(tool.cookieHelper.getItem("msgId") || tool.cookieHelper.setItem("msgId", 0) || 0);
            };
        isXHR && init();
        return {
            //messageid 加一并返回
            messageIdPlus: function (method) {
                isXHR && init();
                if (messageId >= 0xffff) {
                    method();
                    return false;
                }
                messageId++;
                isXHR && tool.cookieHelper.setItem("msgId", messageId);
                return messageId;
            },
            //清空messageid
            clearMessageId: function () {
                messageId = 0;
                isXHR && tool.cookieHelper.setItem("msgId", messageId);
            },
            //返回当前messageid
            getMessageId: function () {
                isXHR && init();
                return messageId;
            }
        }
    })()
});
module.exports = tool;