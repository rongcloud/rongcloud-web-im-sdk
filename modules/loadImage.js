/**
 * Created by yataozhang on 14/11/3.
 */
(function (win) {
    if (win.RongIMClient) {
        var token = "", isinit = false,xdomain = null;
        function getToken() {
            RongIMClient.getInstance().getUploadToken({
                onSuccess: function (data) {
                    token = data.token;
                    isinit = true;
                }, onError: function () {
                    throw new Error("Get token failure");
                }
            })
        }

        win.RongIMClient.loadPicture = new function () {
            function create(con, callback) {
                if(!window.FormData){
                    return;
                }
                if (XMLHttpRequest) {
                    xdomain = new XMLHttpRequest();
                    xdomain.onreadystatechange = function () {
                        if (xdomain.readyState == 4 && xdomain.status == 200) {
                            var resu = io.util.JSONParse(xdomain.responseText);
                            if (resu)
                                callback(resu);
                        }
                    };
                }
                else if (XDomainRequest) {
                    xdomain = new XDomainRequest();
                    xdomain.onerror = function () {
                    };
                    xdomain.onload = function () {
                        var resu = io.util.JSONParse(xdr.responseText)
                        if (resu)
                            callback(resu);
                    };
                } else {
                    throw new Error("The browser version is not supported");
                }
                xdomain.setRequestHeader("content-type","application/json");
                xdomain.open("post", 'http://localhost:8080/qwer',true);
                xdomain.send({token:token,data:con,userId:RongIMClient.getInstance().getCurrentUserInfo().getUserId()});
            }

            this.load = function (DataURL, callback) {
                if (isinit) {
                    create(DataURL, callback);
                }
                else
                    throw new Error("please init")
            };
            this.showImage = function (url, callback) {
                var img = new Image();
                img.url = url;
                callback(img);
            };
        };

        win.RongIMClient.loadPicture.init = function () {
            getToken();
        }
    }
    else {
        throw new Error("Please load RongIMClient.min.js,http://res.websdk.rong.io/RongIMClient.min.js");
    }
})
(window)