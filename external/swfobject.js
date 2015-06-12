var swfobject = function () {
    var D = "undefined", r = "object", S = "Shockwave Flash", W = "ShockwaveFlash.ShockwaveFlash", q = "application/x-shockwave-flash", R = "SWFObjectExprInst", x = "onreadystatechange", O = window, j = document, t = navigator, T = false, U = [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function () {
        var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, X = !+"\v1", ag = [0, 0, 0], ab = null;
        if (typeof t.plugins != D && typeof t.plugins[S] == r) {
            ab = t.plugins[S].description;
            if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                T = true;
                X = false;
                ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
            }
        } else {
            if (typeof O.ActiveXObject != D) {
                try {
                    var ad = new ActiveXObject(W);
                    if (ad) {
                        ab = ad.GetVariable("$version");
                        if (ab) {
                            X = true;
                            ab = ab.split(" ")[1].split(",");
                            ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                        }
                    }
                } catch (Z) {
                }
            }
        }
        return{w3: aa, pv: ag, wk: af, ie: X, win: ae, mac: ac}
    }(), k = function () {
        if (!M.w3) {
            return
        }
        if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
            f()
        }
        if (!J) {
            if (typeof j.addEventListener != D) {
                j.addEventListener("DOMContentLoaded", f, false)
            }
            if (M.ie && M.win) {
                j.attachEvent(x, function () {
                    if (j.readyState == "complete") {
                        j.detachEvent(x, arguments.callee);
                        f()
                    }
                });
                if (O == top) {
                    (function () {
                        if (J) {
                            return
                        }
                        try {
                            j.documentElement.doScroll("left")
                        } catch (X) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        f()
                    })()
                }
            }
            if (M.wk) {
                (function () {
                    if (J) {
                        return
                    }
                    if (!/loaded|complete/.test(j.readyState)) {
                        setTimeout(arguments.callee, 0);
                        return
                    }
                    f()
                })()
            }
            s(f)
        }
    }();

    function f() {
        if (J) {
            return
        }
        try {
            var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
            Z.parentNode.removeChild(Z)
        } catch (aa) {
            return
        }
        J = true;
        var X = U.length;
        for (var Y = 0; Y < X; Y++) {
            U[Y]()
        }
    }

    function K(X) {
        if (J) {
            X()
        } else {
            U[U.length] = X
        }
    }

    function s(Y) {
        if (typeof O.addEventListener != D) {
            O.addEventListener("load", Y, false)
        } else {
            if (typeof j.addEventListener != D) {
                j.addEventListener("load", Y, false)
            } else {
                if (typeof O.attachEvent != D) {
                    i(O, "onload", Y)
                } else {
                    if (typeof O.onload == "function") {
                        var X = O.onload;
                        O.onload = function () {
                            X();
                            Y()
                        }
                    } else {
                        O.onload = Y
                    }
                }
            }
        }
    }

    function h() {
        if (T) {
            V()
        } else {
            H()
        }
    }

    function V() {
        var X = j.getElementsByTagName("body")[0];
        var aa = C(r);
        aa.setAttribute("type", q);
        var Z = X.appendChild(aa);
        if (Z) {
            var Y = 0;
            (function () {
                if (typeof Z.GetVariable != D) {
                    var ab = Z.GetVariable("$version");
                    if (ab) {
                        ab = ab.split(" ")[1].split(",");
                        M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                    }
                } else {
                    if (Y < 10) {
                        Y++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                }
                X.removeChild(aa);
                Z = null;
                H()
            })()
        } else {
            H()
        }
    }

    function H() {
        var ag = o.length;
        if (ag > 0) {
            for (var af = 0; af < ag; af++) {
                var Y = o[af].id;
                var ab = o[af].callbackFn;
                var aa = {success: false, id: Y};
                if (M.pv[0] > 0) {
                    var ae = c(Y);
                    if (ae) {
                        if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                            w(Y, true);
                            if (ab) {
                                aa.success = true;
                                aa.ref = z(Y);
                                ab(aa)
                            }
                        } else {
                            if (o[af].expressInstall && A()) {
                                var ai = {};
                                ai.data = o[af].expressInstall;
                                ai.width = ae.getAttribute("width") || "0";
                                ai.height = ae.getAttribute("height") || "0";
                                if (ae.getAttribute("class")) {
                                    ai.styleclass = ae.getAttribute("class")
                                }
                                if (ae.getAttribute("align")) {
                                    ai.align = ae.getAttribute("align")
                                }
                                var ah = {};
                                var X = ae.getElementsByTagName("param");
                                var ac = X.length;
                                for (var ad = 0; ad < ac; ad++) {
                                    if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                    }
                                }
                                P(ai, ah, Y, ab)
                            } else {
                                p(ae);
                                if (ab) {
                                    ab(aa)
                                }
                            }
                        }
                    }
                } else {
                    w(Y, true);
                    if (ab) {
                        var Z = z(Y);
                        if (Z && typeof Z.SetVariable != D) {
                            aa.success = true;
                            aa.ref = Z
                        }
                        ab(aa)
                    }
                }
            }
        }
    }

    function z(aa) {
        var X = null;
        var Y = c(aa);
        if (Y && Y.nodeName == "OBJECT") {
            if (typeof Y.SetVariable != D) {
                X = Y
            } else {
                var Z = Y.getElementsByTagName(r)[0];
                if (Z) {
                    X = Z
                }
            }
        }
        return X
    }

    function A() {
        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
    }

    function P(aa, ab, X, Z) {
        a = true;
        E = Z || null;
        B = {success: false, id: X};
        var ae = c(X);
        if (ae) {
            if (ae.nodeName == "OBJECT") {
                l = g(ae);
                Q = null
            } else {
                l = ae;
                Q = X
            }
            aa.id = R;
            if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                aa.width = "310"
            }
            if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                aa.height = "137"
            }
            j.title = j.title.slice(0, 47) + " - Flash Player Installation";
            var ad = M.ie && M.win ? "ActiveX" : "PlugIn", ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
            if (typeof ab.flashvars != D) {
                ab.flashvars += "&" + ac
            } else {
                ab.flashvars = ac
            }
            if (M.ie && M.win && ae.readyState != 4) {
                var Y = C("div");
                X += "SWFObjectNew";
                Y.setAttribute("id", X);
                ae.parentNode.insertBefore(Y, ae);
                ae.style.display = "none";
                (function () {
                    if (ae.readyState == 4) {
                        ae.parentNode.removeChild(ae)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            }
            u(aa, ab, X)
        }
    }

    function p(Y) {
        if (M.ie && M.win && Y.readyState != 4) {
            var X = C("div");
            Y.parentNode.insertBefore(X, Y);
            X.parentNode.replaceChild(g(Y), X);
            Y.style.display = "none";
            (function () {
                if (Y.readyState == 4) {
                    Y.parentNode.removeChild(Y)
                } else {
                    setTimeout(arguments.callee, 10)
                }
            })()
        } else {
            Y.parentNode.replaceChild(g(Y), Y)
        }
    }

    function g(ab) {
        var aa = C("div");
        if (M.win && M.ie) {
            aa.innerHTML = ab.innerHTML
        } else {
            var Y = ab.getElementsByTagName(r)[0];
            if (Y) {
                var ad = Y.childNodes;
                if (ad) {
                    var X = ad.length;
                    for (var Z = 0; Z < X; Z++) {
                        if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                            aa.appendChild(ad[Z].cloneNode(true))
                        }
                    }
                }
            }
        }
        return aa
    }

    function u(ai, ag, Y) {
        var X, aa = c(Y);
        if (M.wk && M.wk < 312) {
            return X
        }
        if (aa) {
            if (typeof ai.id == D) {
                ai.id = Y
            }
            if (M.ie && M.win) {
                var ah = "";
                for (var ae in ai) {
                    if (ai[ae] != Object.prototype[ae]) {
                        if (ae.toLowerCase() == "data") {
                            ag.movie = ai[ae]
                        } else {
                            if (ae.toLowerCase() == "styleclass") {
                                ah += ' class="' + ai[ae] + '"'
                            } else {
                                if (ae.toLowerCase() != "classid") {
                                    ah += " " + ae + '="' + ai[ae] + '"'
                                }
                            }
                        }
                    }
                }
                var af = "";
                for (var ad in ag) {
                    if (ag[ad] != Object.prototype[ad]) {
                        af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                    }
                }
                aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                N[N.length] = ai.id;
                X = c(ai.id)
            } else {
                var Z = C(r);
                Z.setAttribute("type", q);
                for (var ac in ai) {
                    if (ai[ac] != Object.prototype[ac]) {
                        if (ac.toLowerCase() == "styleclass") {
                            Z.setAttribute("class", ai[ac])
                        } else {
                            if (ac.toLowerCase() != "classid") {
                                Z.setAttribute(ac, ai[ac])
                            }
                        }
                    }
                }
                for (var ab in ag) {
                    if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                        e(Z, ab, ag[ab])
                    }
                }
                aa.parentNode.replaceChild(Z, aa);
                X = Z
            }
        }
        return X
    }

    function e(Z, X, Y) {
        var aa = C("param");
        aa.setAttribute("name", X);
        aa.setAttribute("value", Y);
        Z.appendChild(aa)
    }

    function y(Y) {
        var X = c(Y);
        if (X && X.nodeName == "OBJECT") {
            if (M.ie && M.win) {
                X.style.display = "none";
                (function () {
                    if (X.readyState == 4) {
                        b(Y)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            } else {
                X.parentNode.removeChild(X)
            }
        }
    }

    function b(Z) {
        var Y = c(Z);
        if (Y) {
            for (var X in Y) {
                if (typeof Y[X] == "function") {
                    Y[X] = null
                }
            }
            Y.parentNode.removeChild(Y)
        }
    }

    function c(Z) {
        var X = null;
        try {
            X = j.getElementById(Z)
        } catch (Y) {
        }
        return X
    }

    function C(X) {
        return j.createElement(X)
    }

    function i(Z, X, Y) {
        Z.attachEvent(X, Y);
        I[I.length] = [Z, X, Y]
    }

    function F(Z) {
        var Y = M.pv, X = Z.split(".");
        X[0] = parseInt(X[0], 10);
        X[1] = parseInt(X[1], 10) || 0;
        X[2] = parseInt(X[2], 10) || 0;
        return(Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
    }

    function v(ac, Y, ad, ab) {
        if (M.ie && M.mac) {
            return
        }
        var aa = j.getElementsByTagName("head")[0];
        if (!aa) {
            return
        }
        var X = (ad && typeof ad == "string") ? ad : "screen";
        if (ab) {
            n = null;
            G = null
        }
        if (!n || G != X) {
            var Z = C("style");
            Z.setAttribute("type", "text/css");
            Z.setAttribute("media", X);
            n = aa.appendChild(Z);
            if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                n = j.styleSheets[j.styleSheets.length - 1]
            }
            G = X
        }
        if (M.ie && M.win) {
            if (n && typeof n.addRule == r) {
                n.addRule(ac, Y)
            }
        } else {
            if (n && typeof j.createTextNode != D) {
                n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
            }
        }
    }

    function w(Z, X) {
        if (!m) {
            return
        }
        var Y = X ? "visible" : "hidden";
        if (J && c(Z)) {
            c(Z).style.visibility = Y
        } else {
            v("#" + Z, "visibility:" + Y)
        }
    }

    function L(Y) {
        var Z = /[\\\"<>\.;]/;
        var X = Z.exec(Y) != null;
        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
    }

    var d = function () {
        if (M.ie && M.win) {
            window.attachEvent("onunload", function () {
                var ac = I.length;
                for (var ab = 0; ab < ac; ab++) {
                    I[ab][0].detachEvent(I[ab][1], I[ab][2])
                }
                var Z = N.length;
                for (var aa = 0; aa < Z; aa++) {
                    y(N[aa])
                }
                for (var Y in M) {
                    M[Y] = null
                }
                M = null;
                for (var X in swfobject) {
                    swfobject[X] = null
                }
                swfobject = null
            })
        }
    }();
    return{registerObject: function (ab, X, aa, Z) {
        if (M.w3 && ab && X) {
            var Y = {};
            Y.id = ab;
            Y.swfVersion = X;
            Y.expressInstall = aa;
            Y.callbackFn = Z;
            o[o.length] = Y;
            w(ab, false)
        } else {
            if (Z) {
                Z({success: false, id: ab})
            }
        }
    }, getObjectById: function (X) {
        if (M.w3) {
            return z(X)
        }
    }, embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
        var X = {success: false, id: ah};
        if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
            w(ah, false);
            K(function () {
                ae += "";
                ag += "";
                var aj = {};
                if (af && typeof af === r) {
                    for (var al in af) {
                        aj[al] = af[al]
                    }
                }
                aj.data = ab;
                aj.width = ae;
                aj.height = ag;
                var am = {};
                if (ad && typeof ad === r) {
                    for (var ak in ad) {
                        am[ak] = ad[ak]
                    }
                }
                if (Z && typeof Z === r) {
                    for (var ai in Z) {
                        if (typeof am.flashvars != D) {
                            am.flashvars += "&" + ai + "=" + Z[ai]
                        } else {
                            am.flashvars = ai + "=" + Z[ai]
                        }
                    }
                }
                if (F(Y)) {
                    var an = u(aj, am, ah);
                    if (aj.id == ah) {
                        w(ah, true)
                    }
                    X.success = true;
                    X.ref = an
                } else {
                    if (aa && A()) {
                        aj.data = aa;
                        P(aj, am, ah, ac);
                        return
                    } else {
                        w(ah, true)
                    }
                }
                if (ac) {
                    ac(X)
                }
            })
        } else {
            if (ac) {
                ac(X)
            }
        }
    }, switchOffAutoHideShow: function () {
        m = false
    }, ua: M, getFlashPlayerVersion: function () {
        return{major: M.pv[0], minor: M.pv[1], release: M.pv[2]}
    }, hasFlashPlayerVersion: F, createSWF: function (Z, Y, X) {
        if (M.w3) {
            return u(Z, Y, X)
        } else {
            return undefined
        }
    }, showExpressInstall: function (Z, aa, X, Y) {
        if (M.w3 && A()) {
            P(Z, aa, X, Y)
        }
    }, removeSWF: function (X) {
        if (M.w3) {
            y(X)
        }
    }, createCSS: function (aa, Z, Y, X) {
        if (M.w3) {
            v(aa, Z, Y, X)
        }
    }, addDomLoadEvent: K, addLoadEvent: s, getQueryParamValue: function (aa) {
        var Z = j.location.search || j.location.hash;
        if (Z) {
            if (/\?/.test(Z)) {
                Z = Z.split("?")[1]
            }
            if (aa == null) {
                return L(Z)
            }
            var Y = Z.split("&");
            for (var X = 0; X < Y.length; X++) {
                if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                    return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                }
            }
        }
        return""
    }, expressInstallCallback: function () {
        if (a) {
            var X = c(R);
            if (X && l) {
                X.parentNode.replaceChild(l, X);
                if (Q) {
                    w(Q, true);
                    if (M.ie && M.win) {
                        l.style.display = "block"
                    }
                }
                if (E) {
                    E(B)
                }
            }
            a = false
        }
    }}
}();
(function () {
    if (window.WEB_SOCKET_FORCE_FLASH) {
    } else {
        if (window.WebSocket) {
            return
        } else {
            if (window.MozWebSocket) {
                window.WebSocket = MozWebSocket;
                return
            }
        }
    }
    var logger;
    if (window.WEB_SOCKET_LOGGER) {
        logger = WEB_SOCKET_LOGGER
    } else {
        if (window.console && window.console.log && window.console.error) {
            logger = window.console
        } else {
            logger = {log: function () {
            }, error: function () {
            }}
        }
    }
    if (swfobject.getFlashPlayerVersion().major < 10) {
        logger.error("Flash Player >= 10.0.0 is required.");
        return
    }
    if (location.protocol == "file:") {
        logger.error("WARNING: web-socket-js doesn't work in file:///... URL " + "unless you set Flash Security Settings properly. " + "Open the page via Web server i.e. http://...")
    }
    window.WebSocket = function (url, protocols, proxyHost, proxyPort, headers) {
        var self = this;
        self.__id = WebSocket.__nextId++;
        WebSocket.__instances[self.__id] = self;
        self.readyState = WebSocket.CONNECTING;
        self.bufferedAmount = 0;
        self.__events = {};
        if (!protocols) {
            protocols = []
        } else {
            if (typeof protocols == "string") {
                protocols = [protocols]
            }
        }
        self.__createTask = setTimeout(function () {
            WebSocket.__addTask(function () {
                self.__createTask = null;
                WebSocket.__flash.create(self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null)
            })
        }, 0)
    };
    WebSocket.prototype.send = function (data) {
        if (this.readyState == WebSocket.CONNECTING) {
            throw"INVALID_STATE_ERR: Web Socket connection has not been established"
        }
        var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
        if (result < 0) {
            return true
        } else {
            this.bufferedAmount += result;
            return false
        }
    };
    WebSocket.prototype.close = function () {
        if (this.__createTask) {
            clearTimeout(this.__createTask);
            this.__createTask = null;
            this.readyState = WebSocket.CLOSED;
            return
        }
        if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
            return
        }
        this.readyState = WebSocket.CLOSING;
        WebSocket.__flash.close(this.__id)
    };
    WebSocket.prototype.addEventListener = function (type, listener, useCapture) {
        if (!(type in this.__events)) {
            this.__events[type] = []
        }
        this.__events[type].push(listener)
    };
    WebSocket.prototype.removeEventListener = function (type, listener, useCapture) {
        if (!(type in this.__events)) {
            return
        }
        var events = this.__events[type];
        for (var i = events.length - 1; i >= 0; --i) {
            if (events[i] === listener) {
                events.splice(i, 1);
                break
            }
        }
    };
    WebSocket.prototype.dispatchEvent = function (event) {
        var events = this.__events[event.type] || [];
        for (var i = 0; i < events.length; ++i) {
            events[i](event)
        }
        var handler = this["on" + event.type];
        if (handler) {
            handler.apply(this, [event])
        }
    };
    WebSocket.prototype.__handleEvent = function (flashEvent) {
        if ("readyState" in flashEvent) {
            this.readyState = flashEvent.readyState
        }
        if ("protocol" in flashEvent) {
            this.protocol = flashEvent.protocol
        }
        var jsEvent;
        if (flashEvent.type == "open" || flashEvent.type == "error") {
            jsEvent = this.__createSimpleEvent(flashEvent.type)
        } else {
            if (flashEvent.type == "close") {
                jsEvent = this.__createSimpleEvent("close");
                jsEvent.wasClean = flashEvent.wasClean ? true : false;
                jsEvent.code = flashEvent.code;
                jsEvent.reason = flashEvent.reason
            } else {
                if (flashEvent.type == "message") {
                    var data = decodeURIComponent(flashEvent.message);
                    jsEvent = this.__createMessageEvent("message", data)
                } else {
                    throw"unknown event type: " + flashEvent.type
                }
            }
        }
        this.dispatchEvent(jsEvent)
    };
    WebSocket.prototype.__createSimpleEvent = function (type) {
        if (document.createEvent && window.Event) {
            var event = document.createEvent("Event");
            event.initEvent(type, false, false);
            return event
        } else {
            return{type: type, bubbles: false, cancelable: false}
        }
    };
    WebSocket.prototype.__createMessageEvent = function (type, data) {
        if (window.MessageEvent && typeof(MessageEvent) == "function" && !window.opera) {
            return new MessageEvent("message", {"view": window, "bubbles": false, "cancelable": false, "data": data})
        } else {
            if (document.createEvent && window.MessageEvent && !window.opera) {
                var event = document.createEvent("MessageEvent");
                event.initMessageEvent("message", false, false, data, null, null, window, null);
                return event
            } else {
                return{type: type, data: data, bubbles: false, cancelable: false}
            }
        }
    };
    WebSocket.CONNECTING = 0;
    WebSocket.OPEN = 1;
    WebSocket.CLOSING = 2;
    WebSocket.CLOSED = 3;
    WebSocket.__isFlashImplementation = true;
    WebSocket.__initialized = false;
    WebSocket.__flash = null;
    WebSocket.__instances = {};
    WebSocket.__tasks = [];
    WebSocket.__nextId = 0;
    WebSocket.loadFlashPolicyFile = function () {
        WebSocket.__addTask(function () {
            if('RongBrIdge' in window){
                WebSocket.__flash.loadManualPolicyFile("xmlsocket://"+RongBrIdge._client.constructor.Endpoint.host.replace(/\d+?$/,"8300"));
            }else{
                WebSocket.__flash.loadManualPolicyFile("xmlsocket://"+RongBinaryHelper.__host.replace(/\d+?$/,"8300"));
            }
        })
    };

    WebSocket.Serialize = function (type, arg) {
        return WebSocket.__flash.proBufEncode(type, arg);
    };
    WebSocket.deSerialize = function (type, arg) {
        return WebSocket.__flash.proBufDecode(type, arg);
    };
    WebSocket.__initialize = function () {
        if (typeof window != 'undefined') {
            window.WEB_SOCKET_SWF_LOCATION = 'http://res.websdk.rongcloud.cn/WebSocketMainInsecure-0.2.swf?v=20150430';
            window.WEB_SOCKET_DEBUG = 0;
        }
        if (WebSocket.__initialized) {
            return
        }
        WebSocket.__initialized = true;
        if (WebSocket.__swfLocation) {
            window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation
        }
        if (!window.WEB_SOCKET_SWF_LOCATION) {
            logger.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
            return
        }
        if (!window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR && !WEB_SOCKET_SWF_LOCATION.match(/(^|\/)WebSocketMainInsecure-0\.2\.swf(\?.*)?$/) && WEB_SOCKET_SWF_LOCATION.match(/^\w+:\/\/([^\/]+)/)) {
            var swfHost = RegExp.$1;
            if (location.host != swfHost) {
                logger.error("[WebSocket] You must host HTML and WebSocketMain.swf in the same host " + "('" + location.host + "' != '" + swfHost + "'). " + "See also 'How to host HTML file and SWF file in different domains' section " + "in README.md. If you use WebSocketMainInsecure.swf, you can suppress this message " + "by WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;")
            }
        }
        var container = document.createElement("div");
        container.id = "webSocketContainer";
        container.style.position = "absolute";
        if (WebSocket.__isFlashLite()) {
            container.style.left = "0px";
            container.style.top = "0px"
        } else {
            container.style.left = "-100px";
            container.style.top = "-100px"
        }
        var holder = document.createElement("div");
        holder.id = "webSocketFlash";
        container.appendChild(holder);
        document.body.appendChild(container);
        swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION, "webSocketFlash", "1", "1", "10.0.0", null, null, {hasPriority: true, swliveconnect: true, allowScriptAccess: "always"}, null, function (e) {
            if (!e.success) {
                logger.error("[WebSocket] swfobject.embedSWF failed")
            }
        })
    };
    WebSocket.__onFlashInitialized = function () {
        setTimeout(function () {
            WebSocket.__flash = document.getElementById("webSocketFlash");
            WebSocket.__flash.setCallerUrl(location.href);
            WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
            for (var i = 0; i < WebSocket.__tasks.length; ++i) {
                WebSocket.__tasks[i]()
            }
            WebSocket.__tasks = []
        }, 0)
    };
    WebSocket.__onFlashEvent = function () {
        setTimeout(function () {
            try {
                var events = WebSocket.__flash.receiveEvents();
                for (var i = 0; i < events.length; ++i) {
                    WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i])
                }
            } catch (e) {
                logger.error(e)
            }
        }, 0);
        return true
    };
    WebSocket.__log = function (message) {
        logger.log(decodeURIComponent(message))
    };
    WebSocket.__error = function (message) {
        logger.error(decodeURIComponent(message))
    };
    WebSocket.__addTask = function (task) {
        if (WebSocket.__flash) {
            task()
        } else {
            WebSocket.__tasks.push(task)
        }
    };
    WebSocket.__isFlashLite = function () {
        if (!window.navigator || !window.navigator.mimeTypes) {
            return false
        }
        var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
        if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
            return false
        }
        return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false
    };
    if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
        swfobject.addDomLoadEvent(function () {
            WebSocket.__initialize()
        })
    }
})();
(function (b) {
    function parseNum(a) {
        a = parseInt(a).toString(16);
        if (11 != a.length) return "0";
        var b = a.slice(a.length - 8);
        return a.slice(0, 3) + "" + b
    }
    var a = {NotifyMsg: function () {
        var d = {};
        this.setType = function (e) {
            d.type = e
        };
        this.setTime = function (e) {
            d.time = parseNum(e)
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("NotifyMsg", d)
        }
    }, SyncRequestMsg: function () {
        var d = {};
        this.setSyncTime = function (e) {
            d.syncTime = parseNum(e)
        };
        this.setIspolling = function (e) {
            d.ispolling = !!e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("SyncRequestMsg", d)
        }
    }, UpStreamMessage: function () {
        var d = {};
        this.setSessionId = function (e) {
            d.sessionId = e
        };
        this.setClassname = function (e) {
            d.classname = e
        };
        this.setContent = function (e) {
            e && (d.content = window.RongBinaryHelper ? window.RongBinaryHelper.writeUTF(e, !0).toString() : "");
        };
        this.setPushText = function (e) {
            d.pushText = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("UpStreamMessage", d)
        }
    }, DownStreamMessages: function () {
        var d = {};
        this.setList = function (e) {
            d.list = e
        };
        this.setSyncTime = function (e) {
            d.syncTime = parseNum(e)
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("DownStreamMessages", d)
        }
    }, DownStreamMessage: function () {
        var d = {};
        this.setFromUserId = function (e) {
            d.fromUserId = e
        };
        this.setType = function (e) {
            d.type = e
        };
        this.setGroupId = function (e) {
            d.groupId = e
        };
        this.setClassname = function (e) {
            d.classname = e
        };
        this.setContent = function (e) {
            e && (d.content = window.RongBinaryHelper ? window.RongBinaryHelper.writeUTF(e, !0).toString() : "");
        };
        this.setDataTime = function (e) {
            d.dataTime = parseNum(e)
        };
        this.setStatus = function (e) {
            d.status = parseNum(e)
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("DownStreamMessage", d)
        }
    }, CreateDiscussionInput: function () {
        var d = {};
        this.setName = function (e) {
            d.name = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("CreateDiscussionInput", d)
        }
    }, CreateDiscussionOutput: function () {
        var d = {};
        this.setId = function (e) {
            d.id = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("CreateDiscussionOutput", d)
        }
    }, ChannelInvitationInput: function () {
        var d = {};
        this.setUsers = function (e) {
            d.users = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelInvitationInput", d)
        }
    }, LeaveChannelInput: function () {
        var d = {};
        this.setNothing = function (e) {
            d.nothing = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("LeaveChannelInput", d)
        }
    }, ChannelEvictionInput: function () {
        var d = {};
        this.setUser = function (e) {
            d.user = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelEvictionInput", d)
        }
    }, RenameChannelInput: function () {
        var d = {};
        this.setName = function (e) {
            d.name = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("RenameChannelInput", d)
        }
    }, ChannelInfoInput: function () {
        var d = {};
        this.setNothing = function (e) {
            d.nothing = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelInfoInput", d)
        }
    }, ChannelInfoOutput: function () {
        var d = {};
        this.setType = function (e) {
            d.type = e
        };
        this.setChannelId = function (e) {
            d.channelId = e
        };
        this.setChannelName = function (e) {
            d.channelName = e
        };
        this.setAdminUserId = function (e) {
            d.adminUserId = e
        };
        this.setFirstTenUserIds = function (e) {
            d.firstTenUserIds = e
        };
        this.setOpenStatus = function (e) {
            d.openStatus = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelInfoOutput", d)
        }
    }, ChannelInfosInput: function () {
        var d = {};
        this.setPage = function (e) {
            d.page = e
        };
        this.setNumber = function (e) {
            d.number = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelInfosOutput", d)
        }
    }, ChannelInfosOutput: function () {
        var d = {};
        this.setChannels = function (e) {
            d.channels = e
        };
        this.setTotal = function (e) {
            d.total = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("ChannelInfosOutput", d)
        }
    }, MemberInfo: function () {
        var d = {};
        this.setUserId = function (e) {
            d.userId = e
        };
        this.setUserName = function (e) {
            d.userName = e
        };
        this.setUserPortrait = function (e) {
            d.userPortrait = e
        };
        this.setExtension = function (e) {
            d.extension = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("MemberInfo", d)
        }
    }, GroupMembersInput: function () {
        var d = {};
        this.setPage = function (e) {
            d.page = e
        };
        this.setNumber = function (e) {
            d.number = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GroupMembersInput", d)
        }
    }, GroupMembersOutput: function () {
        var d = {};
        this.setMembers = function (e) {
            d.members = e
        };
        this.setTotal = function (e) {
            d.total = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GroupMembersOutput", d)
        }
    }, GetUserInfoInput: function () {
        var d = {};
        this.setNothing = function (e) {
            d.nothing = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GetUserInfoInput", d)
        }
    }, GetUserInfoOutput: function () {
        var d = {};
        this.setUserId = function (e) {
            d.userId = e
        };
        this.setUserName = function (e) {
            d.userName = e
        };
        this.setUserPortrait = function (e) {
            d.userPortrait = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GetUserInfoOutput", d)
        }
    }, GetSessionIdInput: function () {
        var d = {};
        this.setNothing = function (e) {
            d.nothing = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GetSessionIdInput", d)
        }
    }, GetSessionIdOutput: function () {
        var d = {};
        this.setSessionId = function (e) {
            d.sessionId = e
        };
        this.toArrayBuffer = function () {
            return WebSocket.Serialize("GetSessionIdOutput", d)
        }
    },
        GetQNupTokenInput: function () {
            var a = {};
            this.setType = function (b) {
                a.type = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GetQNupTokenInput", a)
            }
        },
        GetQNupTokenOutput: function () {
            var a = {};
            this.setDeadline = function (b) {
                a.deadline = parseNum(b)
            };
            this.setToken = function (b) {
                a.token = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GetQNupTokenOutput", a)
            }
        },
        GetQNdownloadUrlInput: function () {
            var a = {};
            this.setType = function (b) {
                a.type = b
            };
            this.setKey = function (b) {
                a.key = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GetQNdownloadUrlInput", a)
            }
        },
        GetQNdownloadUrlOutput: function () {
            var a = {};
            this.setDownloadUrl = function (b) {
                a.downloadUrl = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GetQNdownloadUrlOutput", a)
            }
        },
        Add2BlackListInput: function () {
            var a = {};
            this.setUserId = function (b) {
                a.userId = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("Add2BlackListInput", a)
            }
        },
        RemoveFromBlackListInput: function () {
            var a = {};
            this.setUserId = function (b) {
                a.userId = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("RemoveFromBlackListInput", a)
            }
        },
        QueryBlackListInput: function () {
            var a = {};
            this.setNothing = function (b) {
                a.nothing = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("QueryBlackListInput", a)
            }
        },
        QueryBlackListOutput: function () {
            var a = {};
            this.setUserIds = function (b) {
                a.userIds = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("QueryBlackListOutput", a)
            }
        },
        BlackListStatusInput: function () {
            var a = {};
            this.setUserId = function (b) {
                a.userId = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("BlackListStatusInput", a)
            }
        },
        BlockPushInput: function () {
            var a = {};
            this.setBlockeeId = function (b) {
                a.blockeeId = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("BlockPushInput", a)
            }
        },
        ModifyPermissionInput: function () {
            var a = {};
            this.setOpenStatus = function (b) {
                a.openStatus = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("ModifyPermissionInput", a)
            }
        },
        GroupInput: function () {
            var a = {};
            this.setGroupInfo = function (b) {
                for(var i= 0,arr=[];i< b.length;i++){
                    arr.push({id: b[i].getContent().id,name:b[i].getContent().name})
                }
                a.groupInfo = arr;
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GroupInput", a)
            }
        },
        GroupOutput: function () {
            var a = {};
            this.setNothing = function (b) {
                a.nothing = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GroupOutput", a)
            }
        },
        GroupInfo: function () {
            var a = {};
            this.setId = function (b) {
                a.id = b
            };
            this.setName = function (b) {
                a.name = b
            };
            this.getContent=function(){
                return a;
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GroupInfo", a)
            }
        },
        GroupHashInput: function () {
            var a = {};
            this.setUserId = function (b) {
                a.userId = b
            };
            this.setGroupHashCode = function (b) {
                a.groupHashCode = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GroupHashInput", a)
            }
        },
        GroupHashOutput: function () {
            var a = {};
            this.setResult = function (b) {
                a.result = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("GroupHashOutput", a)
            }
        },
        ChrmInput: function () {
            var a = {};
            this.setNothing = function (b) {
                a.nothing = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("ChrmInput", a)
            }
        },
        ChrmOutput: function () {
            var a = {};
            this.setNothing = function (b) {
                a.nothing = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("ChrmOutput", a)
            }
        },
        ChrmPullMsg: function () {
            var a = {};
            this.setSyncTime = function (b) {
                a.syncTime = parseNum(b)
            };
            this.setCount = function (b) {
                a.count = b
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("ChrmPullMsg", a)
            }
        },RelationsInput: function() {
            var a = {};
            this.setType = function(b) {
                a.type = b;
            };
            this.toArrayBuffer = function() {
                return WebSocket.Serialize("RelationsInput", a)
            }
        },
        RelationsOutput: function() {
            var a = {};
            this.setInfo = function(b) {
                a.info = b;
            };
            this.toArrayBuffer = function() {
                return WebSocket.Serialize("RelationsOutput", a)
            }
        },
        RelationInfo:function(){
            var a={};
            this.setType=function(b){
                a.type=b;
            };
            this.setUserId=function(b){
                a.userId=b;
            };
            this.toArrayBuffer = function() {
                return WebSocket.Serialize("RelationInfo", a)
            }
        },
        HistoryMessageInput: function () {
            var a={};
            this.setTargetId=function(b){
                a.targetId=b;
            };
            this.setDataTime=function(b){
                a.dataTime=parseNum(b);
            };
            this.setSize=function(b){
                a.size=b;
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("HistoryMessageInput", a)
            }
        },
        HistoryMessagesOuput: function () {
            var a={};
            this.setList=function(b){
                a.list=b;
            };
            this.setSyncTime=function(b){
                a.syncTime=parseNum(b);
            };
            this.setHasMsg=function(b){
                a.hasMsg=b;
            };
            this.toArrayBuffer = function () {
                return WebSocket.Serialize("HistoryMessagesOuput", a)
            }
        }};
    for (var c in a)
        a[c].decode = (function (y) {
            return function (b) {
                b = WebSocket.deSerialize(y, b);
                var c = {}, d;
                for (d in b) {
                    c[d]=b[d];
                    c["get"+ d.charAt(0).toUpperCase()+ d.slice(1)]=function(){
                        return b[d];
                    }
                }
                return c;
            }
        })(c);
    b.Modules = a;
})(window);
(function (g) {
    if (g.RongIMClient) {
        if (RongIMClient.connect.token) {
            RongIMClient.getInstance().connect(RongIMClient.connect.token, RongIMClient.connect.callback);
        }
    } else {
        require(['../bin/RongIMClient'], function (r) {
            if (r.connect.token) {
                r.getInstance().connect(r.connect.token, r.connect.callback);
            }
        })
    }
})(this);