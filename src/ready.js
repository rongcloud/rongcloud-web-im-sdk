var global = window;
var tool = require('./tool');
var mappding = require('./mapping');
var config = {
    canFlashWidget: (function () {
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
    })(),
    supportedWebSocket: function () {
        return "WebSocket" in global && "ArrayBuffer" in global && WebSocket.prototype.CLOSED === 3 && !mappding.globalConf.WEB_SOCKET_FORCE_FLASH && !mappding.globalConf.WEB_XHR_POLLING;
    },
    supportedFlash: function () {
        return !/opera/i.test(navigator.userAgent) && !mappding.globalConf.WEB_XHR_POLLING && this.canFlashWidget
    }
};
// 程序入口
tool.ready(function () {
    var src = '';
    //此属性为通道标识。根据这个标识生产通道对象，默认为websocket
    tool.setTransportType('websocket');
    //当前浏览器是否支持webSocket，并且window.WEB_SOCKET_FORCE_FLASH 和 !window.WEB_XHR_POLLING都是false
    if (config.supportedWebSocket()) {
        //加载protobuf
        src = "http://res.websdk.rongcloud.cn/protobuf-0.2.min.js";
        //是否支持flash widget
    } else if (config.supportedFlash()) {
        //加载flash widget帮助库
        src = "http://res.websdk.rongcloud.cn/swfobject-0.2.min.js";
    } else {
        //如果上述条件都不支持则执行comet逻辑
        tool.setTransportType('xhr-polling');
        //加载comet帮助库
        src = "http://res.websdk.rongcloud.cn/xhrpolling-0.2.min.js";
    }
    tool.loadScript(src);
});