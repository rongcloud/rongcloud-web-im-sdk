/***
 *此js文件为常帅强所写，具体详情可咨询常帅强
 */
;
(function (win, doc, undefined) {
    if(!(win.RongIMClient&&win.RongIMClient.Expression)){
        var _doc = document.createElement("script"), _doc1 = _doc.cloneNode(), _head = document.getElementsByTagName("head")[0];
        if (!_head) {
            _head = document.documentElement.appendChild(document.createElement("head"));
        }
        _doc.type = "text/javascript";
        _doc.src = "http://res.websdk.rongcloud.cn/RongIMClient-0.9.10.min.js";
        _doc.onload = function () {
            _doc1.src = "http://res.websdk.rongcloud.cn/RongIMClient.emoji-0.9.2.min.js";
            _head.appendChild(_doc1);
        };
        _head.appendChild(_doc);
    }
    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    };
    var conf = {
        'name': 'RongCloudWebSDK',
        'closeChat': true,
        'RongClient': false,
        'defaultUserImgUri': 'http://rongcloud-web.qiniudn.com/kefu_default.jpg',
        'defaultExpressionUri': 'http://rongcloud-web.qiniudn.com/expression.png',
        'btnkefu': '#btn-kefu',
        'urlReg': /(https?:\/\/[^ \r\n<]+)\ ?/gi
    };
    conf.pc = {
        'MinWidth': 960
    };
    conf.style = {
        'headerColor': 'rgba(120, 208, 244, 0.6)',
        'boxColor': 'rgba(120, 208, 244, 0.6)',
        'bodyColor': '#CDEEFC',
        'kefuMsgColor': '#fff',
        'cusMsgColor': '#30b5ee',
        'sendBtnColor': '#2992d9',
        'expressionImg': 'http://rongcloud-web.qiniudn.com/expression.png',
        'cursorcolor': '#78d0f4',
        'kefubtnColor': ['#F2F2F2', '#0EB4D8', '#8EDBF6', '#fff', '#00B0D6']
    };
    conf.scroll = {
        'cursorcolor': conf.style.cursorcolor,
        'cursoropacitymax': 1,
        'touchbehavior': false,
        'cursorwidth': "5px",
        'cursorborder': "0",
        'cursorborderradius': "5px"
    };
    conf.resolvedSearch = function () {
        var s = document.location.search.slice(1), parts = {}, i = 0;
        if (s) {
            for (s = s.split('&'); i < s.length; i++) {
                var a = s[i].split('=');
                parts[a[0]] = a[1];
            }
            arguments.callee = function () {
                return parts;
            };
        }
        return parts;
    };
    /**
     * 选择器
     * @type {Object}
     */
    conf.selector = {
        'chatWin': '.rc_chat',
        'status': '.rc_status', //消息状态
        'drawExpressionWrap': '.rc_RongIMexpressionWrap',   //表情容器
        'dialog_box': '.rc_dialog_box',   //对话框
        'expressionObj': '.rc_RongIMexpressionWrap>span',    //表情选择器
        'textarea': '.rc_textarea',     //输入框
        'min': '.rc_min',
        'close': '.rc_close',
        'msgBody': '.rc_msgBody',
        'status_error': '.rc_status_error',
        'msgPrv': 'msg_',
        'msgArea': '.rc_textarea',
        'btnSend': '.rc_sendBtn',
        'errorDiv': '.rc_notice',
        'dialog_box_header': '.rc_dialog_box_header',
        'msg_box': '.rc_msg_box'
    };
    conf.html = [
        '<div class="rc_chat" style="display: none;">',
        '    <div class="rc_right">',
        '        <div class="rc_dialog_box_header rc_header">',
        '            <div class="rc_wbim_tit2_lf">',
        '                <!--<a class="rc_wbim_img" style="height: 50px;"><span><img src="http://rongcloud-web.qiniudn.com/kefu_default.jpg" /></span></a>-->',
        '                <span class="rc_chat_name" style="padding-left: 20px;"></span>',
        '            </div><span style="margin:auto 0">在线客服</span>',
        '            <div class="rc_wbim_tit2_rt">',
        '                <a class="rc_min">—</a>',
        '                <a class="rc_close">X</a>',
        '            </div>',
        '        </div>',
        '        <div class="rc_dialog_box">',
        '           <div class="rc_notice" style="height: 20px; line-height: 20px;z-index: 1000; width: 100%; position: absolute; color: rgb(0, 0, 0); text-align: center; margin: 0 auto; background-color: rgb(252, 248, 227);filter:alpha(opacity=50);-moz-opacity:0.5;-khtml-opacity: 0.5;opacity: 0.5;display: none;">',
        '           </div>',
        '        </div>',
        '        <div class="rc_RongIMexpressionWrap" style="position: absolute; z-index: 2000; bottom: 140px;border-top-left-radius: 5px;border-top-right-radius: 5px;"></div>',
        '        <div class="rc_msg_box">',
        '            <div class="rc_features">',
        '                <span class="rc_expression">',
        '                    <a href="javascript:void(0)" id="rc_RongIMexpression" title="表情"></a>',
        '                </span>',
        '            </div>',
        '            <div class="rc_input_box">',
        '                <div class="rc_text_box">',
        '                    <textarea class="rc_textarea" style="cursor: text;" contenteditable="true"></textarea>',
        '                </div>',
        '                <div class="rc_button_box">',
        '                    <div id="rc_expresscontent"></div>',
        '                    <span><font>Ctrl + Enter</font></span>',
        '                    <span><button class="rc_sendBtn">发送</button></span>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');

    var lib = {};
    lib.each = function (a, f) {
        if (!a || !f)return;
        for (var i = 0; i < a.length; i++) {
            f(a[i], i)
        }
    };
    lib.eacho = function (o, f) {
        if (!o || !f)return;
        for (var i in o) {
            if (!o.hasOwnProperty(i)) continue;
            f(o[i], i);
        }
    };
    lib.loadJs = function (url, callback) {
        callback = callback || function () {
        };
        /* ie8 bug */
        if (doc.readyState != "complete") {
            return setTimeout(function () {
                lib.loadJs(url, callback);
            }, 300);
        }
        var script = doc.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    callback();
                }
            };
        } else {
            script.onload = function () {
                callback();
            };
        }
        script.src = url;
        doc.body.appendChild(script);
    };
    lib.clone = function (obj) {
        var that = this;
        if (typeof(obj) != 'object') return obj;
        if (obj == null) return obj;
        var newObj = {};
        for (var i in obj) {
            newObj[i] = that.clone(obj[i]);
        }
        return newObj;
    };
    lib.delay = function (d) {
        for (var t = Date.now(); Date.now() - t <= d;);
    };
    lib.htmlspecialchars = function (str) {
        if (!str) return '';
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#039;');
        return str;
    };

    var self = {};
    self.conf = conf;
    self.setOptions = function (opt) {
        self.conf = self.conf || {};
        lib.eacho(opt, function (v, k) {
            if (typeof(v) != 'object') {
                self.conf[k] = v;
            } else {
                lib.eacho(v, function (value, key) {
                    if (self.conf[k]) {
                        self.conf[k][key] = value;
                    }
                });
            }
        });
    };
    self.loadCss = function () {
        var dom = {};
        dom.head = doc.getElementsByTagName('head')[0];
        var style = doc.createElement('style');
        conf.css = [
            '.rc_chat {position: fixed;_position: absolute;bottom: 20px;_bottom: auto;_top: expression(eval(document.documentElement.scrollTop+document.documentElement.clientHeight-this.offsetHeight-(parseInt(this.currentStyle.marginTop,10)||0)-(parseInt(this.currentStyle.marginBottom,10)||50)));z-index: 999900;right: 0px;right: 70px;}',
            '.rc_chat { width: 330px; font-size: 12px; cursor: default; margin: 0 auto; font-family: arial, \'Hiragino Sans GB\', \'Microsoft Yahei\', SimSun, Tahoma, Arial, Helvetica, STHeiti; font-size: 14px; color: #fff; text-align: left; vertical-align: middle;}',
            '.rc_chat a { color: #fff; text-decoration: none; }',
            '.rc_chat ul { -webkit-padding-start: 0px; padding-left: 0px; margin: 0 auto; }',
            '.rc_chat p { height: 24px; line-height: 24px; margin: 0; }',
            '.rc_chat ul li { list-style-type: none; }',
            '.rc_chat .rc_dialog_box .rc_other_user .rc_msg { margin-left: 0; }',
            '.rc_chat .rc_dialog_box .rc_self .rc_msg { margin-right: 0; }',
            '.rc_chat .rc_dialog_box .rc_time_line { margin-top: 5px; }',
                '.rc_chat .rc_dialog_box_header { height: 33px; line-height: 33px; font-size: 14px; background-color: ' + conf.style.headerColor + '; border-top-left-radius: 3px;border-top-right-radius: 3px;}',
            '.rc_chat .rc_dialog_box .rc_user { margin-top: 6px; margin-bottom: 6px}',
            '.rc_chat .rc_dialog_box .rc_other_user .rc_msg .rc_msgBody, .rc_chat .rc_dialog_box .rc_self .rc_msg .rc_msgBody { padding: 6px 17px 6px 8px; line-height: 20px; word-break: break-all;}',
            '.rc_chat .rc_dialog_box .rc_status {margin-top: -21px !important;}',
            '.rc_chat .rc_msg_box .rc_features { padding-bottom: 3px; padding-top: 3px; }',
            '.rc_chat .rc_msg_box .rc_features .rc_record { margin-top: 5px; }',
            '.rc_chat .rc_msg_box .rc_input_box { padding-left: 11px; adding-right: 4px; }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box { width: 100%; margin-top: 7px; margin-bottom: 5px; text-align: right; }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box span { display: inline; }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box font { font-size: 11px; }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box button { width: 54px; height: 25px; font-size: 14px;cursor: pointer;}',
            '.rc_chat .rc_msg_box .rc_input_box .rc_text_box { width: 306px; }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_text_box .rc_textarea { width: 293px; height: 54px; padding: 6px; line-height: 16px; outline: none;}',
            '.rc_chat .rc_header .rc_wbim_tit2_lf { float: left; margin-left: 4px; display: inline; }',
            '.rc_chat .rc_header .rc_wbim_tit2_lf  a.rc_wbim_img { background: #fff; display: inline-block; padding: 1px; border: solid 1px #ababab; border-bottom: none; margin: -32px 10px 0 0; vertical-align: middle; _height: 50px; overflow: hidden; }',
            '.rc_chat .rc_header .rc_wbim_tit2_lf  a.rc_wbim_img span { display: inline-block; width: 50px; height: 50px; }',
            '.rc_chat .rc_header .rc_wbim_tit2_lf  a.rc_wbim_img span img { width: 50px; height: 50px; vertical-align: top; }',
            '.rc_chat .rc_header .rc_chat_name { margin-right: 5px; }',
            '.rc_chat .rc_header .rc_wbim_tit2_rt { float: right; display: inline; height: 16px; margin: 7px 8px 0 0; line-height: 16px; }',
            '.rc_chat .rc_header .rc_wbim_tit2_rt a { margin-left: 6px; width: 16px; height: 16px; display: inline-block; cursor: pointer; }',
            '.rc_chat .rc_header .rc_wbim_tit2_rt a:hover { color: #2eb0d6; }',
            '.rc_wrap .rc_right_box { width: 640px; margin-top: 47px; float: left; position: relative; margin-left: 35px; background: none; }',
                '.rc_right {background-color: ' + conf.style.bodyColor + '; border-radius: 3px; max-height: 510px; min-height: 510px;position: relative; margin-top: 23px;}',
            '.rc_dialog_box { position: relative; overflow-y: auto; overflow-x: hidden; max-height: 338px; height: 338px;cursor: auto !important;}',
            '.rc_dialog_box_header { height: 40px; text-align: center; line-height: 40px; font-size: 18px; }',
            '.rc_dialog_box .rc_time_line { color: #23B4F1; text-align: center; margin-top: 20px; margin-bottom: -2px; }',
            '.rc_dialog_box .rc_user { margin-top: 18px; }',
            '.rc_dialog_box .rc_user .rc_msg { padding-bottom: 1px; /** 显示box-shadow */ }',
            '.rc_dialog_box .rc_user .rc_msg .rc_msgBody { line-height: 22px; border: 1px solid #a1d6fa; border-radius: 5px; min-height: 20px; box-shadow: 0px 1px 0px #cdcdcd; text-align: left; }',
            '.rc_dialog_box .rc_user .rc_msg .rc_msgBody .rc_RongIMexpression img{height: 20px;}',
            '.rc_dialog_box .rc_user .rc_msg .rc_msgArrow { margin-top: 10px; }',
            '.rc_dialog_box .rc_user .rc_msg .rc_msgArrow img { width: 6px; }',
            '.rc_dialog_box .rc_user .rc_status { display: none; margin: 0 10px; }',
            '.rc_dialog_box .rc_user .rc_status_error { display: block; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAYAAAHs2/ePAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3RjEzMzQ2NDlENTlFNDExOUNGOUVEQjE2QUNFQ0ZCOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGMjY1MEFFOTVEQTUxMUU0QUE1MzgxNjQ4MzI1MkZFMiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGMjY1MEFFODVEQTUxMUU0QUE1MzgxNjQ4MzI1MkZFMiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIzRkJGNzJFNUQ1QkU0MTFCNTcxQjNGNkFEN0Q2OTJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdGMTMzNDY0OUQ1OUU0MTE5Q0Y5RURCMTZBQ0VDRkI4Ii8+IDwvcmRmOkRlc2NyaXB0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") no-repeat; background-position: 0 -41px; width: 21px; height: 21px; cursor: pointer;}',
            '.rc_dialog_box .rc_user_img img { width: 44px; height: 44px; border: 1px solid #fff; box-shadow: 0px 1px 0px #d7d7d7; }',
            '.rc_dialog_box .rc_slice {clear: both;}',
            '.rc_dialog_box .rc_other_user { padding-left: 10px; position: relative; overflow: hidden; float: left; }',
            '.rc_dialog_box .rc_other_user div { float: left; }',
            '.rc_dialog_box .rc_other_user .rc_msg { margin-left: 10px; }',
            '.rc_dialog_box .rc_other_user .rc_msg .rc_msgArrow{width: 0px;height: 0px;border-top: 6px solid transparent;',
                'border-bottom: 6px solid transparent;border-right: 6px solid ' + conf.style.kefuMsgColor + ';}',
            '.rc_dialog_box .rc_self .rc_msg .rc_msgArrow{width: 0px;height: 0px;border-top: 6px solid transparent;',
                'border-bottom: 6px solid transparent;border-left: 8px solid ' + conf.style.cusMsgColor + ';}',
                '.rc_dialog_box .rc_other_user .rc_msg .rc_msgBody { float: none; background-color: ' + conf.style.kefuMsgColor + '; color: #000; max-width: 300px; margin-left: 5px; padding: 12px 19px 12px 10px; }',
            '.rc_dialog_box .rc_user .rc_msg .rc_msgBody { margin-right: 40px; }',
            '.rc_dialog_box .rc_self .rc_msg .rc_msgBody { margin-left: 40px; margin-right: 5px!important; }',
            '.rc_dialog_box .rc_other_user div { float: none; }',
            '.rc_dialog_box .rc_other_user .rc_user_img { float: left; }',
            '.rc_dialog_box .rc_other_user .rc_msg { margin-left: 50px; padding-right: 30px; }',
            '.rc_dialog_box .rc_other_user .rc_msg div { float: left; }',
            '.rc_dialog_box .rc_other_user .rc_msg .rc_status { float: right; margin-left: 5px; }',
            '.rc_dialog_box .rc_self { width: auto; }',
            '.rc_dialog_box .rc_self .rc_user_img { float: right; }',
            '.rc_dialog_box .rc_self .rc_msg { margin-right: 50px; padding-left: 30px; text-align: right }',
            '.rc_dialog_box .rc_self .rc_msg div { float: right; }',
            '.rc_dialog_box .rc_self .rc_msg .rc_status { float: left; margin-right: 5px; }',
            '.rc_dialog_box .rc_self { text-align: right; padding-right: 10px; position: relative; overflow: hidden; float: right; }',
            '.rc_dialog_box .rc_self div { float: none; }',
                '.rc_dialog_box .rc_self .rc_msg .rc_msgBody { background-color: ' + conf.style.cusMsgColor + '; margin-right: 4px; max-width: 300px; float: none; padding: 12px 10px 12px 19px; }',
            '.rc_dialog_box .rc_self .rc_msg .rc_msgArrow { margin-right: -1px; }',
                '.rc_msg_box { background-color: ' + conf.style.boxColor + '; height: 140px; border-radius: 3px; }',
            '.rc_msg_box .rc_features { padding-left: 15px; padding-bottom: 6px; position: relative; overflow: hidden; padding-top: 13px; }',
            '.rc_msg_box .rc_features span { float: left; display: block; }',
                '.rc_msg_box .rc_features span>a { background: url("' + conf.style.expressionImg + '") no-repeat; display: block; background-size: 28px 28px; }',
            '.rc_msg_box .rc_features .rc_expression a { width: 28px; height: 28px; }',
            '.rc_msg_box .rc_features .rc_img { margin-left: 14px; }',
            '.rc_msg_box .rc_features .rc_img a { background-position: -117px 0; width: 28px; height: 27px; }',
            '.rc_msg_box .rc_features .rc_record { float: right; height: 17px; margin-top: 10px; margin-right: 115px; }',
            '.rc_msg_box .rc_features .rc_record a { background: none; height: 17px; vertical-align: top; color: #4b90ae; }',
            '.rc_msg_box .rc_features .rc_record font { background: url("./static/images/icons.rc_min.rc_png") no-repeat; background-position: -149px -5px; width: 14px; height: 17px; display: inline-block; margin-right: 6px; }',
            '.rc_msg_box .rc_input_box { padding-left: 14px; padding-right: 8px; margin-bottom: 13px; position: relative; overflow: hidden; }',
            '.rc_msg_box .rc_input_box .rc_text_box { width: 510px; float: left; }',
            '.rc_msg_box .rc_input_box .rc_text_box .rc_textarea { background-color: #fff; color: #000; overflow: hidden; resize: none; border: 1px solid #E7E6E6; border-radius: 5px; padding: 8px; height: 50px; width: 494px; line-height: 20px; }',
            '.rc_textarea span { height: 20px; }',
            '.rc_textarea span img { height: 20px; }',
            '.rc_msg_box .rc_input_box .rc_button_box { margin-left: 20px; float: right; text-align: center; width: 80px; }',
            '.rc_msg_box .rc_input_box .rc_button_box span { display: block; margin-top: 6px; text-align: center; }',
                '.rc_msg_box .rc_input_box .rc_button_box button { width: 80px; background-color: ' + conf.style.sendBtnColor + '; border-radius: 5px; border: none; height: 34px; color: #fff; font-size: 18px; }',
                '.rc_msg_box .rc_input_box .rc_button_box font { color: ' + conf.style.sendBtnColor + '; font-size: 13px; }',
            '@media screen and (max-width:960px) {}',
            '.rc_RongIMexpressionWrap { display: none; height: 160px; background-color: #fff; overflow-y: scroll; cursor: auto !important;}',
            '.rc_RongIMexpressionWrap span { width: 40px; height: 40px; margin-left: 15px; margin-top: 10px; display: inline-block; cursor: pointer;}',
            '.nicescroll-rails {position: fixed !important;top: auto!important; left: auto !important; bottom: 159px!important; right: 70px!important; z-index: 999900 !important;}',
            '.light_notice_backlayer{top: 0px; left: 0px; right: 0px; bottom: 0px; position: fixed;',
            'opacity: 0.15; z-index: 999990; background-color: rgb(0, 0, 0);}',
            '.frontlayer{position: fixed; z-index: 999999; -webkit-user-select: none;}',
            '@media screen and (max-width:960px) {',
            '.rc_chat { position: absolute; _position: absolute; bottom: 0px; _bottom: 0px; z-index: 999900; right: 0px }',
            '#btn-kefu { bottom: 50px !important; position: fixed }',
            '.rc_chat { width: 100%; font-size: 12px; cursor: default; margin: 0 auto; font-family: arial, \'Hiragino Sans GB\', \'Microsoft Yahei\', SimSun, Tahoma, Arial, Helvetica, STHeiti; font-size: 14px; color: #fff; text-align: left; vertical-align: middle; height: 100% }',
                '.rc_right { background-color: ' + conf.style.bodyColor + '; border-radius: 3px; height: 100%; position: relative; margin-top: 0px }',
            '.rc_dialog_box { position: relative; overflow-y: auto; overflow-x: hidden; cursor: auto !important }',
            '.rc_msg_box { height: 37px }',
            '.rc_input_box { margin-top: -30px; margin-left: 40px }',
            '.rc_msg_box .rc_input_box { margin-bottom: 0px }',
            '.rc_chat .rc_msg_box .rc_input_box { padding-right: 90px }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_text_box { width: 100% }',
            '.rc_msg_box .rc_input_box .rc_text_box .rc_textarea { height: 50px; max-height: 50px; line-height: 20px; width: 100%; padding: 6px; color: #000 }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_text_box .rc_textarea { height: 20px; max-height: 20px; line-height: 20px; width: 100%; padding: 3px; color: #000 }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box { width: 80px; float: right; margin-top: -30px; margin-right: -75px }',
            '.rc_button_box font { display: none }',
            '.rc_chat .rc_msg_box .rc_input_box .rc_button_box button { width: 60px; height: 25px; font-size: 14px; cursor: pointer }',
            '.rc_RongIMexpressionWrap { bottom: 40px !important }',
            '.nicescroll-rails { position: fixed !important; top: auto !important; left: auto !important; bottom: 37px !important; right: 0px !important; z-index: 999900 !important }',
            '.light_notice_backlayer { top: 0px; left: 0px; right: 0px; bottom: 0px; position: fixed; opacity: 0.15; z-index: 999990; background-color: rgb(0, 0, 0) }',
            '.frontlayer { position: fixed; z-index: 999999; -webkit-user-select: none }',
            '}'
        ].join('');
        style.innerHTML = conf.css;
        dom.head.appendChild(style);
    };
    self.loadJs = function () {
        if (typeof jQuery == 'undefined') {
            lib.loadJs('http://libs.baidu.com/jquery/1.10.2/jquery.min.js', self.loadJs);
        } else {
            lib.loadJs('http://webim.demo.rong.io/WebIMDemo/static/js/jquery.nicescroll.js', self.init);
        }
    };
    self.makeHtml = function () {
        var dom = {};
        dom.body = doc.getElementsByTagName('body')[0];
        var div = doc.createElement('div');
        div.innerHTML = conf.html;
        dom.body.appendChild(div);
    };

    self.setHeight = function () {
        if (!self.isPCBrowser()) {
            var winHeight = $(window).height();
            var otherHeight = 70;
            var data = conf.resolvedSearch();
            if (data && data.type == 'dyd') {
                var ua = navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == "micromessenger" || ua.match(/QQ/i) == "qq") {
                    otherHeight = 37;
                }
            }
            var intBoxHeight = winHeight - otherHeight;
            $(".rc_right").css({
                'min-height': winHeight + 'px',
                'max-height': winHeight + 'px'
            });
            $(conf.selector.dialog_box).css({
                'min-height': intBoxHeight + 'px',
                'max-height': intBoxHeight + 'px'
            });
        } else {
            $(".rc_right").css({
                'min-height': '510px',
                'max-height': '510px'
            });
            $(conf.selector.dialog_box).css({
                'min-height': '338px',
                'max-height': '338px'
            });
        }
    };

    self.locateMsgStatu = function (index, obj) {
        var prevHeight = $(obj).prev("div").outerHeight();
        var marTop = $(obj).outerHeight();
        $(obj).css("margin-top", -marTop);
    };

    self.back = function () {

    };
    self.showError = function (msg) {
        $(conf.selector.errorDiv).html(msg).show();
    };
    self.hideError = function () {
        $(conf.selector.errorDiv).html('');
        $(conf.selector.errorDiv).hide();
    };
    self.bind = function () {
        $("#rc_RongIMexpression").bind('click', function () {
            var RongIMexpressionObj = $(conf.selector.drawExpressionWrap);
            var intExpressHeight = RongIMexpressionObj.innerHeight();
            RongIMexpressionObj.slideToggle();
            $(document.body).bind('click', function (event) {
                var e = event || window.event;
                var elem = e.srcElement || e.target;
                if (elem.id != "rc_RongIMexpression" && !(elem.parentElement.className.match(/rc_RongIMexpression/g))) {
                    $(document.body).unbind('click');
                    RongIMexpressionObj.slideToggle();
                }
            });
        });
        $(conf.selector.dialog_box).bind('DOMNodeInserted', self.autoScroll).delegate('img', 'click', function () {
            var url = $(this).attr('bigUrl');
            self.showImg({'img': url, 'oncomplete': self.showBigImg});
        });
        $(conf.selector.min).bind('click', function () {
            $(conf.btnkefu).css({
                "background-color": conf.style.kefubtnColor[2],
                "color": conf.style.kefubtnColor[4]
            });
            $(conf.selector.chatWin).slideToggle();
            self.autoScroll();
            if (!self.isPCBrowser()) {
                $(conf.btnkefu).show();
            }
        });
        $(conf.selector.close).bind('click', function () {
            $(conf.btnkefu).css({
                "background-color": conf.style.kefubtnColor[0],
                "color": conf.style.kefubtnColor[1]
            });
            $(conf.selector.chatWin).slideToggle();
            conf.RongClient.suspendThisChat(self.closeChat);
            $(conf.selector.dialog_box).html('');
            self.autoScroll();
            if (!self.isPCBrowser()) {
                $(conf.btnkefu).show();
            }
        });
        $(conf.btnkefu).bind('click', function () {
            if (!conf.RongClient) {
                var data = conf.resolvedSearch();
                if (data && data.appKey && data.token && data.targetId && data.backURL) {
                    $(".rc_wbim_tit2_rt").css("visibility", "hidden");
                    $(".rc_chat_name").css("cursor", "pointer").html("<返回").click(function () {
                        window.location.href = decodeURIComponent(data.backURL);
                    });
                    if (data.type == 'dyd') {
                        var ua = navigator.userAgent.toLowerCase();
                        if (data.isApp && data.isApp == '1') {
                            if (ua.indexOf('android') > -1 || ua.indexOf('linux') > -1) {
                                $(".rc_chat_name").html('');
                            }
                        }
                        if (ua.match(/MicroMessenger/i) == "micromessenger" || ua.match(/QQ/i) == "qq") {
                            $(conf.selector.dialog_box_header).css('display', 'none');
                        }
                    }
                    conf.isURL = true;
                    RongCloudWebSDK.initRongIMClient(decodeURIComponent(data.appKey), decodeURIComponent(data.token), decodeURIComponent(data.targetId));
                } else if (conf.token && conf.appKey && conf.targetId) {
                    RongCloudWebSDK.initRongIMClient(conf.appKey, conf.token, conf.targetId);
                } else if (conf.url) {
                    $.ajax({
                        url: conf.url,
                        type: 'get',
                        dataType: 'json',
                        async: false,
                        cache: false,
                        crossDomain: !!conf.Xdomain,
                        success: function (data) {
                            if (data.errorno == 0 || data.code == 200) {
                                var msg = data.msg;
                                self.initRongIMClient(msg.appKey || msg.appkey, msg.token, msg.targetId, {});
                            } else {
                                self.showError('获取 Token 失败~！');
                            }
                        },
                        error: function (data) {
                            self.showError('服务器错误~！');
                        }
                    });
                }
            }
            var that = $(this);
            if (!conf.RongClient) {
                return;
            }
            if (conf.closeChat) {
                if (self.io)
                    conf.RongClient.coustomerServiceHandshake(self.handShake);
                else
                    self.initRongIMClient.onload = function () {
                        conf.RongClient.coustomerServiceHandshake(self.handShake);
                    };
            }
            if (!$(conf.selector.chatWin).is(":visible")) {
                $("#rc_msgNotice").remove();
                $(conf.selector.chatWin).slideToggle();
                if (!self.isPCBrowser()) {
                    $(this).hide();
                }
                that.css({
                    "background-color": conf.style.kefubtnColor[2],
                    "color": conf.style.kefubtnColor[3]
                });
            } else {
                $(conf.selector.chatWin).slideToggle();
                that.css({
                    "background-color": conf.style.kefubtnColor[2],
                    "color": conf.style.kefubtnColor[4]
                });
            }
            self.autoScroll();
        });
        $(conf.selector.btnSend).bind('click', self.sendMsg);
        $(conf.selector.msgArea).bind('keypress', function (event) {
            if (event.ctrlKey && (event.keyCode == 10 || event.keyCode == 13)) {
                $(conf.selector.btnSend).trigger('click');
            }
        });
        $(conf.selector.chatWin).delegate(conf.selector.status_error, 'click',
            function () {
                $(this).removeClass("rc_status_error");
                var msg = $(this).prev("div").html();
                var id = $(this).prev("div").attr("id");
                conf.RongClient.sendMessage(msg, self.sendMsgCallback, id);
            }
        );
    };
    self.drawExpressionWrap = function () {
        var RongIMexpressionObj = $(conf.selector.drawExpressionWrap);
        if (win.RongIMClient) {
            var arrImgList = RongIMClient.Expression.getAllExpression(60, 0);
            if (arrImgList && arrImgList.length > 0) {
                for (var objArr in arrImgList) {
                    var imgObj = arrImgList[objArr].img;
                    imgObj.setAttribute("alt", arrImgList[objArr].chineseName);
                    var newSpan = $('<span class="rc_RongIMexpression rc_RongIMexpression_' + arrImgList[objArr].englishName + '"></span>');
                    newSpan.append(imgObj);
                    RongIMexpressionObj.append(newSpan);
                }
            }
            $(conf.selector.expressionObj).bind('click', function (event) {
                var txt = $(this).find('.RC_Expression').attr('alt');
                var val = $(conf.selector.textarea).val();
                $(conf.selector.textarea).val(val + '[' + txt + ']');
            });
        }
    };
    self.showImg = function (cfg) {
        var _body = $("body");
        _body.css('overflow', 'hidden');
        var img = new Image();
        img.src = cfg.img;
        var callback = cfg.oncomplete;
        _body.append('<div class="light_notice_backlayer" style = "line-height: 100%; font-size: 28px; color: #fff;"><span style="margin-top: 30%;display: block;text-align: center;"></span></div>');
        _body.delegate('.light_notice_backlayer', 'click', function () {
            $('.light_notice_backlayer').remove();
            $("body").css('overflow', 'auto');
            $(".frontlayer").remove();
        });
        _body.delegate('.frontlayer', 'click', function () {
            $('.light_notice_backlayer').remove();
            $("body").css('overflow', 'auto');
            $(".frontlayer").remove();
        });
        img.onload = function () {
            callback.call({"width": img.width, "height": img.height, "obj": img}, null);
        }
    };
    self.showBigImg = function () {
        var html = '<div class="light_notice_backlayer" style = "line-height: 100%; font-size: 28px; color: #fff;"></div>', frontLayer = '<div class="frontlayer" style="text-align: center;vertical-align: middle;width: 100%;height: 100%;"></div>'
            , winWidth = $(window).width(), winHeight = $(window).height(), style = '', left = 0, top = 0, width, height;
        if (self.isPCBrowser()) {
            width = this.width;
            height = this.height;
            if (width > winWidth) {
                width = winWidth;
            } else {
                left = (winWidth - width) / 2;
            }
            if (this.height < winHeight) {
                top = (winHeight - this.height) / 2;
            } else {
                height = winHeight;
            }
            if (width < winWidth && height == winHeight) {
                this.obj.style.height = height + 'px';
            } else if (width == winWidth && height < winHeight) {
                this.obj.style.width = width;
            } else {
                this.obj.style.height = height;
            }
            var Layer = $(frontLayer);
            Layer.css('top', top + 'px');
        } else {
            html = '<div class="light_notice_backlayer" style="line-height: 100%; font-size: 28px; color: #fff;"></div>';
            frontLayer = '<div class="frontlayer" style="text-align: center;vertical-align: middle;width: 100%;height: 100%;"></div>';
            winWidth = $(window).width();
            winHeight = $(window).height();
            style = '';
            left = 0;
            top = 0;
            width = this.width;
            height = this.height;
            if (this.height < winHeight) {
                top = (winHeight - this.height) / 2;
            } else {
                height = winHeight;
            }
            if (width > winWidth) {
                width = winWidth;
            } else {
                left = (winWidth - width) / 2;
            }
            if (width < winWidth && height == winHeight) {
                this.obj.style.height = height + 'px';
            } else if (width == winWidth && height < winHeight) {
                this.obj.style.width = width + 'px';
                var per = width / this.width;
                var perHeight = this.height * per;
                if (perHeight < height) {
                    height = perHeight;
                }
            } else {
                var per = width / this.width;
                var perHeight = this.height * per;
                if (perHeight < height) {
                    height = perHeight;
                }
                this.obj.style.height = height + 'px';
            }
            if (height < winHeight) {
                top = (winHeight - height) / 2;
            }
            this.obj.style.width = width + 'px';
            $("body").append($(html));
            var Layer = $(frontLayer);
            Layer.css('top', top + 'px');
        }
        Layer.append(this.obj);
        $("body").append(Layer);
    };
    self.handShake = {};
    self.handShake.onSuccess = function () {
        conf.closeChat = false;
        console.log('coustomerServiceHandshake success');
    };
    self.handShake.onError = function () {
        console.log('coustomerServiceHandshake error');
    };
    self.closeChat = {};
    self.closeChat.onSuccess = function () {
        conf.closeChat = true;
        console.log('success to close chat');
    };
    self.closeChat.onError = function () {
        console.log('error tp close chat');
    };
    self.sendMsg = function () {
        var msg = $(conf.selector.msgArea).val();
        $(conf.selector.msgArea).val('');
        msg = $.trim(msg);
        if (!msg) {
            return;
        }
        msg = lib.htmlspecialchars(msg);
        var regStr = /\[([\u2480-\u9fff]+?|KTV|ZZZ|1|-1)\]/g;
        var _con = msg.replace(regStr, function (str) {
            var obj = RongIMClient.Expression.getEmojiObjByEnglishNameOrChineseName(str.replace(/(\[|\])/g, ''));
            if (obj.tag)
                return obj.tag;
            else
                return str;
        });
        msg = msg.replace(regStr, function (str) {
            var imgObj = RongIMClient.Expression.getEmojiObjByEnglishNameOrChineseName(str.replace(/(\[|\])/g, ''));
            if (!imgObj) {
                return str;
            }
            imgObj.img.setAttribute("alt", '[' + imgObj.chineseName + ']');
            var htmlStr = '<div></div>';
            return [
                    '<span class="rc_RongIMexpression rc_RongIMexpression_' + imgObj.englishName + '">',
                $(htmlStr).append(imgObj.img).html(),
                '</span>'
            ].join('');
        });
        msg = msg.replaceAll("\n", "<br>");
        var htmlObj = $(
            [
                '<div class="rc_self rc_user">',
                '                <div class="rc_msg">',
                '                    <div class="rc_msgArrow"></div>',
                '                    <div class="rc_msgBody">',
                '                    </div>',
                '                    <div class="rc_status"></div>',
                '                </div>',
                '            </div>',
                '            <div class="rc_slice"></div>'
            ].join('')
        );
        var msgObj = conf.RongClient.sendMessage(_con, self.sendMsgCallback);
        msg = msg.replace(conf.urlReg, function (str) {
            str = '<a href="' + str + '" target="_blank">' + str + '</a>';
            return str;
        });
        var msgId = msgObj.getMessageId();
        htmlObj.find(conf.selector.msgBody).attr('id', conf.selector.msgPrv + msgId);
        htmlObj.find(conf.selector.msgBody).html(msg);
        $(conf.selector.dialog_box).append(htmlObj);
    };
    self.receiveMsg = function (msg) {
        function initEmotion(str) {
            var a = document.createElement("span");
            return RongIMClient.Expression.retrievalEmoji(str, function (img) {
                a.appendChild(img.img);
                var str = '<span class="rc_RongIMexpression rc_RongIMexpression_' + img.englishName + '">' + a.innerHTML + '</span>';
                a.innerHTML = "";
                return str;
            });
        }

        function symbolreplace(str) {
            if (!str) return '';
            str = str.replace(/&/g, '&amp;');
            str = str.replace(/</g, '&lt;');
            str = str.replace(/>/g, '&gt;');
            str = str.replace(/"/g, '&quot;');
            str = str.replace(/'/g, '&#039;');
            str = str.replaceAll("\n", "<br>");
            str = str.replace(conf.urlReg, function (Str) {
                Str = '<a href="' + Str + '" target="_blank" style="color: #000;">' + Str + '</a>';
                return Str;
            });
            return str;
        }

        var htmlObj = $(
            [
                '<div class="rc_other_user rc_user">',
                '                <div class="rc_msg">',
                '                    <div class="rc_msgArrow"></div>',
                '                    <div class="rc_msgBody">',
                '                    </div>',
                '                    <div class="rc_status"></div>',
                '                </div>',
                '            </div>',
                '            <div class="rc_slice"></div>'
            ].join('')
        );
        var msgId = msg.getMessageId();
        htmlObj.find(conf.selector.msgBody).attr('id', conf.selector.msgPrv + msgId);
        if (msg.getMessageType() == RongIMClient.MessageType.TextMessage) {
            htmlObj.find(conf.selector.msgBody).html(initEmotion(symbolreplace(msg.getContent())));
        } else if (msg.getMessageType() == RongIMClient.MessageType.ImageMessage) {
            htmlObj.find(conf.selector.msgBody).html("<img style='width:100%' src='data:image/jpg;base64," + msg.getContent() + "' bigUrl='" + msg.getImageUri() + "'/>");
        }
        $(conf.selector.dialog_box).append(htmlObj);
        if (!$(conf.selector.chatWin).is(":visible") && !$("#rc_msgNotice").is(":visible")) {
            $(conf.btnkefu).append('<span id="rc_msgNotice" style="width: 10px;height: 10px;background: red;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;margin-bottom: 5px;margin-left: 3px;display: inline-block;"></span>');
        }
    };
    self.autoScroll = function () {
        var scrollHeight = $(conf.selector.dialog_box)[0].scrollHeight;
        $(conf.selector.dialog_box).scrollTop(scrollHeight);
    };
    self.instantce = function (opt) {
        self.setOptions(opt);
        self.loadJs();

    };
    self.loadBtnStyle = function (css) {
        conf.btncss = css;
    };
    self.isPCBrowser = function () {
        conf.winWidth = $(window).width();
        return conf.winWidth > conf.pc.MinWidth;
    };
    self.createOrientationChangeProxy = function (fn) {
        return function () {
            $(".rc_textarea").blur();
            clearTimeout(fn.orientationChangeTimer);
            var args = Array.prototype.slice.call(arguments, 0);
            fn.orientationChangeTimer = setTimeout(function () {
                var ori = window.orientation;
                if (ori != fn.lastOrientation) {
                    fn.apply(null, args);
                }
                fn.lastOrientation = ori;
            }, 800);
        };
    };
    self.changeView = function () {
        setTimeout(function () {
                var height = 0;
                $(".rc_textarea").focus();
                window.scrollTo(0, 0);
                self.setHeight()
            },
            500);
    };
    self.init = function () {
        self.loadCss();
        self.makeHtml();
        self.bind();
        if (!self.isPCBrowser()) {
            self.setHeight();
        }
        if ('onorientationchange' in window) {
            window.addEventListener("orientationchange", self.createOrientationChangeProxy(function () {
                if (window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90) {
                    self.changeView();
                }
            }), false);
        } else {
            $(window).bind("resize", self.setHeight);
        }

        self.drawExpressionWrap();
        var newConf = conf.scroll;
        newConf = lib.clone(newConf);
        var newConf1 = conf.scroll;
        newConf1 = lib.clone(newConf1);
        $(conf.selector.dialog_box).niceScroll(newConf);
        $(conf.selector.drawExpressionWrap).niceScroll(newConf1);
        if (/&backURL=/.test(location.search)) {
            $(conf.btnkefu).trigger('click');
        }
        if (conf.btncss) {
            $("#btn-kefu")[0].setAttribute("style", conf.btncss);
        } else {
            var str = "width: 15px; padding: 10px; height: 92px; position: absolute; bottom: 20px; z-index: 999999; right: 0px; border: 1px solid rgb(196, 196, 196); border-radius: 5px; cursor: pointer; color: rgb(14, 180, 216); background-color: #f6f6f6;";
            $("#btn-kefu")[0].setAttribute("style", conf.isURL ? "display:none;" + str : "display:block;" + str);
        }
    };
    self.sendMsgCallback = {};
    self.sendMsgCallback.onSuccess = function () {
        console.log("done")
    };
    self.sendMsgCallback.onError = function (errObj, msgId) {
        $("#" + conf.selector.msgPrv + msgId).next("div").addClass('rc_status_error');
    };
    self.callbackConnection = function (obj) {
        if (!(obj == 0 || obj == 1 || obj == 5 || obj == 4)) {
            self.showError(obj);
        } else {
            self.hideError();
            conf.isReOnline = false;
        }
    };
    self.io = null;
    self.initRongIMClient = function (appkey, token, targetId, callback) {
        if (!appkey || !token || !targetId) {
            console.log('wrong paramters');
            return;
        }
        var func = function () {
            if (conf.RongClient)
                conf.RongClient.suspendThisChat({onSuccess: function () {
                }, onError: function () {
                }});
        };
        if (window.attachEvent) {
            window.attachEvent("onbeforeunload", func);
        } else {
            window.addEventListener("beforeunload", func, false);
        }
        RongIMClient.init(appkey);
        var isSuccess = false, errorurl = function () {
            var data = conf.resolvedSearch();
            if (!isSuccess && data && data.errorURL) {
                location.href = decodeURIComponent(data.errorURL);
            }
        };
        setTimeout(errorurl, 10000);
        RongIMClient.connect(token, new RongIMClient.callback(function (x) {
            self.io = RongIMClient.getInstance().getIO().getInstance();
            console.log("connected，userid＝" + x);
            setTimeout(function(){
                RongIMClient.getInstance().getUserInfo(targetId, {
                    'onSuccess': function (userInfoObj) {
                        isSuccess = true;
                        var userImgUrl = userInfoObj.getPortraitUri() || conf.defaultUserImgUri;
                        var userName = userInfoObj.getUserName() || '客服';
                        $(".rc_wbim_img").html('<span><img src="' + userImgUrl + '" /></span>');
                        if (!conf.isURL)
                            $(".rc_chat_name").text(userName);
                        if (self.initRongIMClient.onload) {
                            self.initRongIMClient.onload();
                            self.initRongIMClient.onload = null;
                        }
                    },
                    'onError': function () {
                        console.log("get userinfo fail")
                    }
                });
            },1000);
        }, function (val) {
            conf.onConnectError && conf.onConnectError(val);
            errorurl();
        }));
        function strreplace(str) {
            if (!str) return '';
            str = str.replace(/&amp;/g, '&');
            str = str.replace(/&lt;/g, '<');
            str = str.replace(/&gt;/g, '>');
            str = str.replace(/&quot;/g, '"');
            str = str.replace(/&#039;/g, "'");
            str = str.replace(/&nbsp;/g, " ");
            return str;
        }
        conf.RongClient = {
            sendMessage: function (content, callback, id) {
                var con = new RongIMClient.TextMessage.obtain(strreplace(content)), _callback = {onSuccess: callback.onSuccess, onError: function (x) {
                    callback.onError(x, con.getMessageId());
                }};
                if (self.io && self.io.connected == false) {
                    con.setMessageId(RongIMClient.ConversationType.CUSTOMER_SERVICE.value + "_" + Date.now());
                    RongIMClient.getInstance().reconnect({onSuccess: function () {
                        conf.RongClient.coustomerServiceHandshake(self.handShake);
                        RongIMClient.getInstance().sendMessage(RongIMClient.ConversationType.CUSTOMER_SERVICE, targetId, con, null, _callback);
                    }, onError: function (x) {
                        if (id) {
                            id = id.replaceAll('msg_', '');
                            callback.onError(x, id);
                        }
                        self.showError('连接失败');
                        console.log("重连失败");
                    }});
                } else {
                    RongIMClient.getInstance().sendMessage(RongIMClient.ConversationType.CUSTOMER_SERVICE, targetId, con, null, _callback);
                }
                return con;
            },
            onReveicedMessageListener: function (_function) {
                RongIMClient.getInstance().setOnReceiveMessageListener({
                    onReceived: _function
                })
            },
            suspendThisChat: function (callback) {
                RongIMClient.getInstance().getCurrentUserInfo({
                    onSuccess:function(obj){
                        var msg = new RongIMClient.SuspendMessage();
                        msg.setContent(obj.getUserId());
                        RongIMClient.getInstance().sendMessage(RongIMClient.ConversationType.CUSTOMER_SERVICE, targetId, msg, null, callback);
                    },onError:function(){
                        callback.onError(RongIMClient.callback.ErrorCode.UNKNOWN_ERROR);
                    }
                });
            },
            coustomerServiceHandshake: function (callback) {
                var msg = new RongIMClient.HandshakeMessage();
                RongIMClient.getInstance().sendMessage(RongIMClient.ConversationType.CUSTOMER_SERVICE, targetId, msg, null, callback);
            },
            onConnectionStatesListener: function (_function) {
                RongIMClient.setConnectionStatusListener({
                    onChanged:_function
                });
            }
        };
        if (callback) {
            $(conf.selector.btnkefu).trigger('click');
        }
        conf.RongClient.onReveicedMessageListener(self.receiveMsg);
        conf.RongClient.onConnectionStatesListener(self.callbackConnection);
    };
    win[conf.name] = self;
})(window, document, window.jQuery);

(function () {
    var ie = !!(window.attachEvent && !window.opera);
    var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
    var fn = [];
    var run = function () {
        for (var i = 0; i < fn.length; i++) fn[i]();
    };
    var d = document;
    d.ready = function (f) {
        if (!ie && !wk && d.addEventListener)
            return d.addEventListener('DOMContentLoaded', f, false);
        if (fn.push(f) > 1) return;
        if (ie)
            (function () {
                try {
                    d.documentElement.doScroll('left');
                    run();
                }
                catch (err) {
                    setTimeout(arguments.callee, 0);
                }
            })();
        else if (wk)
            var t = setInterval(function () {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t);
                run();
            }, 0);
    };
})();

document.ready(function () {
    if (window.RongCloudWebSDK) {
        var _div = document.createElement("div"), _span = document.createElement("span"), _txt = document.createTextNode("在线客服");
        _div.setAttribute("style", "display: none;");
        _div.id = "btn-kefu";
        _span.setAttribute("style", "width: 10px;height: 10px;background: red;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;margin-bottom: 5px;margin-left: 3px;display: inline-block;");
        _span.id = "rc_msgNotice";
        _div.appendChild(_txt);
        _div.appendChild(_span);
        document.body.appendChild(_div);
    }
});
