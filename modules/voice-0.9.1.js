/**
 * Created by yataozhang on 14/11/3.
 * 音频帮助库
 * 文档地址 https://github.com/rongcloud/demo-web-sdk#音频播放帮助库如何使用
 */
(function (win) {
    if (win.RongIMClient) {
        win.RongIMClient.voice = new function () {
            var isinit = false;
            this.init = function () {
                if (/IE/.test(navigator.userAgent) || isinit)//ie内核版本不支持此功能
                    return;
                for (var list = ["http://res.websdk.rongcloud.cn/libamr.js", "http://res.websdk.rongcloud.cn/pcmdata.min.js", "http://res.websdk.rongcloud.cn/amr.js"], i = 0; i < list.length; i++) {
                    var script = document.createElement("script");
                    script.src = list[i];
                    document.head.appendChild(script);
                }
                return (isinit = true);
            };
            this.play = function (DataURL, duration) {
                if (isinit&&+duration==duration) {
                    if (window.handleFileSelect)
                        window.handleFileSelect(DataURL);
                    else
                        throw new Error("Has not been initialized, please wait");
                    if(!duration)
                        return;
                    duration=Math.ceil(duration);
                    this.onprogress(0);
                    var self = this, c = 1, timer = setInterval(function () {
                        self.onprogress(c / duration);
                        c++;
                        if (c >= duration) {
                            clearInterval(timer);
                        }
                    }, 1000);
                } else {
                    throw new Error("the voice is not init,please init;WARNING:IE core is not supported This feature ");
                }
            };
            this.onprogress = function () {

            };
        };
    } else {
        throw new Error("Please load RongIMClient.min.js,http://res.websdk.rong.io/RongIMClient.min.js");
    }
})(window);