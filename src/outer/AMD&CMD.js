//兼容AMD CMD
if ("function" === typeof require && "object" === typeof module && module && module.id && "object" === typeof exports && exports) {
    module.exports = RongIMClient
} else if ("function" === typeof define && define.amd) {
    define('RongIMClient', [], function () {
        return RongIMClient;
    });
    define(function () {
        return RongIMClient;
    });
} else {
    global.RongIMClient = RongIMClient;
}