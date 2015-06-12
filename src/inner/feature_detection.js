var func = function () {
    var script = document.createElement("script"), head = document.getElementsByTagName("head")[0];
    //此属性为通道标识。根据这个标识生产通道对象，默认为websocket
    io._TransportType = "websocket";
    //当前浏览器是否支持webSocket，并且window.WEB_SOCKET_FORCE_FLASH 和 !window.WEB_XHR_POLLING都是false
    if ("WebSocket" in global && "ArrayBuffer" in global && WebSocket.prototype.CLOSED === 3 && !global.WEB_SOCKET_FORCE_FLASH && !global.WEB_XHR_POLLING) {
        //加载protobuf
        script.src = "http://res.websdk.rongcloud.cn/protobuf-0.2.min.js";
        //是否支持flash并且window.WEB_XHR_POLLING=false
    } else if (!/opera/i.test(navigator.userAgent) && !global.WEB_XHR_POLLING && (function () {
        if ('navigator' in global && 'plugins' in navigator && navigator.plugins['Shockwave Flash']) {
            return !!navigator.plugins['Shockwave Flash'].description;
        }
        if ('ActiveXObject' in global) {
            try {
                return !!new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
            } catch (e) {
            }
        }
        return false;
    })()) {
        //加载flash widget帮助库
        script.src = "http://res.websdk.rongcloud.cn/swfobject-0.2.min.js";
    } else {
        //如果上述条件都不支持则执行comet逻辑
        io._TransportType = "xhr-polling";
        //加载comet帮助库
        script.src = "http://res.websdk.rongcloud.cn/xhrpolling-0.2.min.js";
    }
    head.appendChild(script);
    //此方法判断是否设置FORCE_LOCAL_STORAGE为true，如果是true则在localstorage中存储。否则在cookie中存储。
    io.util.cookieHelper = (function () {
        var obj, old;
        if (window.FORCE_LOCAL_STORAGE === true) {
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
                    var arr = document.cookie.match(new RegExp("(^| )" + x + "=([^;]*)(;|$)"));
                    if (arr != null) {
                        return (arr[2]);
                    }
                    return null;
                },
                setItem: function (x, value) {
                    var exp = new Date();
                    exp.setTime(exp.getTime() + 15 * 24 * 3600 * 1000);
                    document.cookie = x + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
                },
                removeItem: function (x) {
                    if (this.getItem(x)) {
                        document.cookie = x + "=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
                    }
                },
                clear: function () {
                    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
                    if (keys) {
                        for (var i = keys.length; i--;)
                            document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
                    }
                }
            }
        }
        return obj;
    })();
    //获取消息id标识符对象，如果是comet消息通道就将messageid放入本地存储(localstorage或cookie)中。其他消息通道则放入内存中。
    io.messageIdHandler = (function () {
        var messageId = 0,
            isXHR = io._TransportType === "xhr-polling",
            init = function () {
                messageId = +(io.util.cookieHelper.getItem("msgId") || io.util.cookieHelper.setItem("msgId", 0) || 0);
            };
        isXHR && init();
        return {
            //messageid 加一并返回
            messageIdPlus: function (method) {
                isXHR && init();
                if (messageId >= 65535) {
                    method();
                    return false;
                }
                messageId++;
                isXHR && io.util.cookieHelper.setItem("msgId", messageId);
                return messageId;
            },
            //清空messageid
            clearMessageId: function () {
                messageId = 0;
                isXHR && io.util.cookieHelper.setItem("msgId", messageId);
            },
            //返回当前messageid
            getMessageId: function () {
                isXHR && init();
                return messageId;
            }
        }
    })();

};
//register ready event 判断页面加载状态，执行func方法
if (document.readyState == "interactive" || document.readyState == "complete") {
    func();
} else if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        func();
    }, false)
} else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", function () {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            document.detachEvent("onreadystatechange", arguments.callee);
            func()
        }
    })
}