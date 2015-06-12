//声明Client.connect静态方法，返回Client实例
Client.connect = function (appId, token, callback) {
    //如果appid和本地存储的不一样，清空所有本地存储数据
    var oldAppId = io.util.cookieHelper.getItem("appId");
    if (oldAppId && oldAppId != appId) {
        io.util.cookieHelper.clear();
        io.util.cookieHelper.setItem("appId", appId);
    }
    var client = new Client(token, appId);
    //请求navi导航
    Client.getServerEndpoint(token, appId, function () {
        client.connect(callback);
    }, callback.onError, true);
    return client;
};
//jsonp操作，请求navi导航
/***
 * @param {string} _token token
 * @param {string} _appId appid
 * @param {function} _onsuccess 成功回调函数
 * @param {function} _onerror 失败回调函数
 * @param {boolean} unignore 进行jsonp请求前是否做信息比对
 */
Client.getServerEndpoint = function (_token, _appId, _onsuccess, _onerror, unignore) {
    if (unignore) {
        //根据token生成MD5截取8-16下标的数据与本地存储的导航信息进行比对
        //如果信息和上次的通道类型都一样，不执行navi请求，用本地存储的导航信息连接服务器
        var naviStr = MD5(_token).slice(8, 16),
            _old = io.util.cookieHelper.getItem("navi\\w+?"),
            _new = io.util.cookieHelper.getItem("navi" + naviStr);
        if (_old == _new && _new !== null && io.util.cookieHelper.getItem("rongSDK") == io._TransportType) {
            var obj = unescape(_old).split(",");
            setTimeout(function () {
                RongBinaryHelper.__host = Client.Endpoint.host = obj[0];
                Client.Endpoint.userId = obj[1];
                _onsuccess();
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
        },
        xss = document.createElement("script");
    //进行jsonp请求
    xss.src = Url["navUrl-Release"] + (io._TransportType == "xhr-polling" ? "cometnavi.js" : "navi.js") + "?appId=" + _appId + "&token=" + encodeURIComponent(_token) + "&" + "callBack=getServerEndpoint&t=" + (new Date).getTime();
    document.body.appendChild(xss);
    xss.onerror = function () {
        _onerror(RongIMClient.ConnectErrorStatus.setValue(4));
    };
    if ("onload" in xss) {
        xss.onload = _onsuccess;
    } else {
        xss.onreadystatechange = function () {
            xss.readyState == "loaded" && _onsuccess();
        }
    }
};
//端点对象，存储链接地址和端口、登陆人员id
Client.Endpoint = {};
//jsonp回调函数
global.getServerEndpoint = function (x) {
    //把导航返回的server字段赋值给RongBinaryHelper.__host，因为flash widget需要使用
    RongBinaryHelper.__host = Client.Endpoint.host = x["server"];
    Client.Endpoint.userId = x.userId;
    //替换本地存储的导航信息
    var temp = document.cookie.match(new RegExp("(^| )navi\\w+?=([^;]*)(;|$)"));
    temp !== null && io.util.cookieHelper.removeItem(temp[0].split("=")[0].replace(/^\s/, ""));
    io.util.cookieHelper.setItem("navi" + MD5(bridge._client.token).slice(8, 16), x["server"] + "," + (x.userId || ""));
};