# rongcloud-web-im-sdk
Web (JavaScript) IM SDK of RongCloud. 

## 融云 Web SDK 如何使用

[文档参考](http://docs.rongcloud.cn/api/js/index.html " SDK 文档")


使用融云 `Web SDK` 发消息之前必须利用申请的`appkey`进行初始化，只有在初始化之后才能使用RongIMClient.getInstance()方法得到实例.<br/>
*如只想知晓如何使用 Web SDK 请参考 `SDK_Demo.html`*

## 指定版本号引用
`http://res.websdk.rongcloud.cn/RongIMClient-0.9.10.min.js` 历史版本号目前可从0.9.1到0.9.10。
>+   [0.9.1](http://res.websdk.rongcloud.cn/RongIMClient-0.9.1.min.js)
>+   [0.9.2](http://res.websdk.rongcloud.cn/RongIMClient-0.9.2.min.js)
>+   [0.9.3](http://res.websdk.rongcloud.cn/RongIMClient-0.9.3.min.js)
>+   [0.9.4](http://res.websdk.rongcloud.cn/RongIMClient-0.9.4.min.js)
>+   [0.9.5](http://res.websdk.rongcloud.cn/RongIMClient-0.9.5.min.js)
>+   [0.9.6](http://res.websdk.rongcloud.cn/RongIMClient-0.9.6.min.js)
>+   [0.9.7](http://res.websdk.rongcloud.cn/RongIMClient-0.9.7.min.js)
>+   [0.9.8](http://res.websdk.rongcloud.cn/RongIMClient-0.9.8.min.js)
>+   [0.9.9](http://res.websdk.rongcloud.cn/RongIMClient-0.9.9.min.js)
>+   [0.9.10](http://res.websdk.rongcloud.cn/RongIMClient-0.9.10.min.js)

#### 此事例中的代码皆为0.9.10版本，使用时请注意兼容性问题。

### 初始化 Web SDK ，此项必须设置
```js
RongIMClient.init("appkey");
```
### 设置链接状态监听器，此项必须设置
```js
RongIMClient.setConnectionStatusListener({  
     onChanged: function (status) {  
          switch (status) {
                //链接成功
                case RongIMClient.ConnectionStatus.CONNECTED:
                    console.log('链接成功');
                    break;
                //正在链接
                case RongIMClient.ConnectionStatus.CONNECTING:
                    console.log('正在链接');
                    break;
                //重新链接
                case RongIMClient.ConnectionStatus.RECONNECT:
                    console.log('重新链接');
                    break;
                //其他设备登陆
                case RongIMClient.ConnectionStatus.OTHER_DEVICE_LOGIN:
                //连接关闭
                case RongIMClient.ConnectionStatus.CLOSURE:
                //未知错误
                case RongIMClient.ConnectionStatus.UNKNOWN_ERROR:
                //登出
                case RongIMClient.ConnectionStatus.LOGOUT:
                //用户已被封禁
                case RongIMClient.ConnectionStatus.BLOCK:
                    break;
            }
     }  
}); 
```
### 链接融云服务器，此项必须设置

此方法为异步方法，请确定链接成功之后再执行其他操作。成功返回登录人员id失败则返回失败枚举对象
```js
RongIMClient.connect("token", {
     onSuccess: function (userid) {
         window.console.log("connected，userid＝" + userid)
     },
     onError: function (c) {
          var info = '';
          switch (c) {
               case RongIMClient.callback.ErrorCode.TIMEOUT:
                    info = '超时';
                    break;
               case RongIMClient.callback.ErrorCode.UNKNOWN_ERROR:
                    info = '未知错误';
                    break;
               case RongIMClient.ConnectErrorStatus.UNACCEPTABLE_PROTOCOL_VERSION:
                    info = '不可接受的协议版本';
                    break;
               case RongIMClient.ConnectErrorStatus.IDENTIFIER_REJECTED:
                    info = 'appkey不正确';
                    break;
               case RongIMClient.ConnectErrorStatus.SERVER_UNAVAILABLE:
                    info = '服务器不可用';
                    break;
               case RongIMClient.ConnectErrorStatus.TOKEN_INCORRECT:
                    info = 'token无效';
                    break;
               case RongIMClient.ConnectErrorStatus.NOT_AUTHORIZED:
                    info = '未认证';
                    break;
               case RongIMClient.ConnectErrorStatus.REDIRECT:
                    info = '重新获取导航';
                    break;
               case RongIMClient.ConnectErrorStatus.PACKAGE_ERROR:
                    info = '包名错误';
                    break;
               case RongIMClient.ConnectErrorStatus.APP_BLOCK_OR_DELETE:
                    info = '应用已被封禁或已被删除';
                    break;
               case RongIMClient.ConnectErrorStatus.BLOCK:
                    info = '用户被封禁';
                    break;
               case RongIMClient.ConnectErrorStatus.TOKEN_EXPIRE:
                    info = 'token已过期';
                    break;
               case RongIMClient.ConnectErrorStatus.DEVICE_ERROR:
                    info = '设备号错误';
                    break;
          }
          console.alert("失败:" + info);
     }
});
```
### 设置消息监听器，此项必须设置

所有接收的消息都通过此监听器进行处理，可以通过message.getMessageType()和RongIMClient.MessageType枚举对象来判断消息类型
```js
RongIMClient.getInstance().setOnReceiveMessageListener({
     onReceived: function (message) {
         //message为RongIMMessage子类实例
         console.log(message.getContent());
     }
});
```
### 得到RongIMClient实例对象,只有执行init()之后才能使用getInstance()方法
```js
var ins = RongIMClient.getInstance();
```
### 设置私人会话类型
```js
var contype = RongIMClient.ConversationType.PRIVATE;
```
### 例如注册某个元素点击事件(举例)
```js
element.onclick = function () {
//调用实例的发送消息方法
     ins.sendMessage(contype, "targetId", RongIMClient.TextMessage.obtain("发送消息内容"), null, {
           onSuccess: function () {
                //发送成功逻辑处理
           },
           onError: function (x) {
                var info = '';
                switch (x) {
                    case RongIMClient.callback.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMClient.callback.ErrorCode.UNKNOWN_ERROR:
                        info = '未知错误';
                        break;
                    case RongIMClient.SendErrorStatus.REJECTED_BY_BLACKLIST:
                        info = '在黑名单中，无法向对方发送消息';
                        break;
                    case RongIMClient.SendErrorStatus.NOT_IN_DISCUSSION:
                        info = '不在讨论组中';
                        break;
                    case RongIMClient.SendErrorStatus.NOT_IN_GROUP:
                        info = '不在群组中';
                        break;
                    case RongIMClient.SendErrorStatus.NOT_IN_CHATROOM:
                        info = '不在聊天室中';
                        break;
                    default :
                        info = x;
                        break;
                }
                console.alert('发送失败:' + info);
           }
       });
};
```
### 同步会话列表(此方法正处于调试阶段，后期可能会有改动)
在浏览器中使用融云`web SDK`与在移动端中使用融云`ios、安卓SDK`不同的是浏览器一刷新页面，之前已经存好的会话列表都将会清空。为了减少这种情况引起的麻烦，可以使用`RongIMClient.getInstance().syncConversationList()`方法，来同步的会话列表。这样的话，就不会因为刷新页面导致会话列表情况所引起的种种麻烦了。
```js
 RongIMClient.getInstance().syncConversationList({
                        onSuccess:function(){
                            //同步会话列表
                            setTimeout(function(){
                              var ConversationList = RongIMClient.getInstance().getConversationList();
                              // do something
                            },1000);
                        },onError:function(){
                        }
                    });
```

### 获取历史纪录(此方法正处于调试阶段，后期可能会有改动)
融云 `web SDK`最新提供`RongIMClient.getInstance().getHistoryMessages()`方法，来帮助开发者获取历史纪录。不再需要为如何在web端存储历史纪录而发愁。*使用此方法前提是APP必须`开启历史消息漫游(此接口为收费项目)`，如APP没有开启历史消息漫游则执行onError方法。*
```js
// 此方法最多一次行拉取20条消息。拉取顺序按时间倒序拉取。
RongIMClient.getInstance().getHistoryMessages(RongIMClient.ConversationType.PRIVATE,'targeid',10,{
     onSuccess:function(symbol,HistoryMessages){
     // symbol为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
     // HistoryMessages 为拉取到的历史消息列表
     },onError:function(){
     // APP未开启消息漫游或处理异常
     // throw new ERROR ......
     }
})
```
### 注册自定义消息
```js
//注册一个自定义消息
RongIMClient.registerMessageType({messageType:'EmptyMessage',objectName:'s:empty',fieldName:['Name','Age','Address','Occupation']});

var myMsg=new RongIMClient.EmptyMessage({Name:'Jeams',Age:32,Address:'beijing',Occupation:'Spy'});

myMsg.getObjectName(); // => 's:empty' 根据此字段判断消息类型

myMsg.getMessageType(); // => 'EmptyMessage' 消息名称

myMsg.getMessageType() == RongIMClient.MessageType.EmptyMessage; // => true 注册完消息类型之后 RongIMClient.MessageType 会自动添加一个自定义消息类型

myMsg instanceOf RongIMClient.RongIMMessage; // => true 继承自融云消息基类

myMsg.getDetail(); // => {Name:'Jeams',Age:32,Address:'beijing',Occupation:'Spy'} 得到消息体
```
### 检测是否有未收到的消息
融云目前的消息状态只有`送达`和`未送达`，没有`已读`和`未读`的状态。此接口用来查询是否有服务器`未送达`的消息。
```js
//此接口可独立使用，不依赖init()和connect()方法。
RongIMClient.hasUnreadMessages('APPKEY','TOKEN',{
    onSuccess:function(symbol){
        if(symbol){
            // 有未收到的消息
        }else{
            // 没有未收到的消息
        }
    },onError:function(err){
        // 错误处理...
    }
});
```
### 兼容CMD、AMD等CommonJS规范
融云`web SDK`从`0.9.9`版本起将开始支持seaJs和requireJs等模块加载器。
```js
//以下代码仅以requireJs做示范
require.config({
    paths: {
        rongSDK: 'http://res.websdk.rongcloud.cn/RongIMClient-0.9.10.min'
    }
});
require(['rongSDK'], function(RongIMClient) {
    //do something ...
});

```
此外，也可以当作子模块引入。
*当引用seaJs或requireJs的时候`web SDK`内部会定义一个 `RongIMClient`模块。所以，当想把SDK当作子模块引入时，直接引用`RongIMClient`就可以了。*
```js
define("modules_one", ['RongIMClient'], function (rong) {
    // do something ...
});
require(['modules_one'],function(modules){
   //do something ... 
});
```
使用`seaJs`进行模块加载
```js
seajs.config({
    alias: {
        rong: 'http://res.websdk.rongcloud.cn/RongIMClient-0.9.9.min'
    }
});
seajs.use(['rong'], function () {
     //do something ...
});
```

### Web SDK 浏览器兼容性
```js

 //PC side
 //-----------------------------------------------------------------------------------------
 //|Desktop Feature| Chrome | Firefox (Gecko) | Internet Explorer | Opera | Safari (WebKit)|
 //----------------------------------------------------------------------------------------
 //|Basic support  |   3    |     3.5         |          6        |   12  |        4       |
 //-----------------------------------------------------------------------------------------
 
 //mobile side
 //-----------------------------------------------------------------------------------------------------------------
 //|Mobile Feature| Android | Chrome for Android | Firefox Mobile (Gecko) | IE Phone | Opera Mobile | Safari Mobile|
 //-----------------------------------------------------------------------------------------------------------------
 //|Basic support |     ?   |     0.16  (Yes)    |          ?             |     ?    |     ?        |      ?       |  
 //-----------------------------------------------------------------------------------------------------------------
 
```

### 使用指定链接通道链接服务器 
Web SDK 通道采用层层降级的方式进行兼容处理。连接通道首先默认使用websocket，如环境不支持websocket则自动降级至 Flash socket，不支持 Flash 则自定降级至 xhr-polling，以此来达到全兼容的目的。
<br/>
如果想强制使用长链接连接服务器则必须设置`window.WEB_XHR_POLLING = true;`
#### 通道选项设置[使用此项必须为0.9.6版本,使用前请确定SDK版本号为0.9.6及以上版本]
```js
     //强制使用长链接进行通讯 设置此项，并保证此项优先级最高并且最先被执行，否则设置无效
     window.WEB_XHR_POLLING = true;
  ```
  ```js
     //强制使用flash进行通讯 设置此项，并保证此项优先级最高并且最先被执行，否则设置无效
     window.WEB_SOCKET_FORCE_FLASH = true;
```
##通道选项优先级比较
`window.WEB_SOCKET_FORCE_FLASH > window.WEB_XHR_POLLING`

### 使用指定存储
强制使用localstorage存储SDK标识数据，主要用来兼容Hybrid应用。
*(ps:在Hybrid应用中无法使用Cookie功能，导致SDK程序异常。可使用此选项，将标志数据存储到localstorage中。)*
```js
     //兼容Hybrid应用，可设置此项
     window.FORCE_LOCAL_STORAGE = true;
```

#### 注意:
 1 : `Web SDK` 是全异步的，所以发送消息之前确保链接成功。<br/>
 2 : 本demo仅做演示使用，页面不做兼容性考虑。<br/>
 3 : 本`Web SDK`为强兼容性，demo的弱兼容性与SDK无关。<br/>
 4 : 使用本示例的页面在商业上使用而引发的处理不当与本人以及本人所属组织无关。<br/>
 5 : 本示例仅做演示，仅仅只做演示。未考虑低版本及部分版本浏览器兼容性。<br/>
 6 : 浏览器兼容性项中未列出的浏览器版本项皆为不支持的浏览器版本
### 须知
本Demo需配合`demo server`一起使用。[Demo Server](https://github.com/rongcloud/demo-server-php)
<hr>
## 表情帮助库如何使用？
`http://res.websdk.rongcloud.cn/RongIMClient.emoji-0.9.2.min.js` 融云官方表情帮助库引用地址。本表情库使用的是标准的 `emoji` 表情。本表情库一共有128个表情,默认为为22px＊22px。表情库是基于 `Web SDK` 的，使用之前请务必提前载入 `Web SDK`.表情库中的方法均为`静态方法`.由于部分浏览器显示本表情的 `tag` 为一个小方块。无法得到内容。此处可用escape()方法得到表情 `tag` 
```js
     console.log('\ud83d\ude00');
     //例如chrome中显示 \ud83d\ude00 为一个小方块，可用escape()方法
     var str = escape('\ud83d\ude00');
     console.log(str);
     //返回％ud83d％ude00，将％替换为\既是表情的 tag 属性
     
     //表情对象的格式为
     var emojiObject={
          englishName:'表情英文名称',
          chineseName:'表情中文名称',
          img:'一个nodeName为B的HTMLElement元素，背景为表情图片',
          tag:'表情的标签，为一组unicode码'
     }
```

#### RongIMClient.Expression.getAllExpression
得到指定数量的表情
```js 
 var emojiObjectList = RongIMClient.Expression.getAllExpression(64,0);
  //从下标为0的位置检索64个表情对象,startIndex与count只和最大为128，因为表情对象最多为128个。
  for(var i=0,item;item=emojiObjectList[i++];){
     console.log(item.englishName,item.chineseName,item.img,item.tag);
     //依次打印表情元素
  }
```

#### RongIMClient.Expression.getEmojiByContent
根据表情的 `content` ( `content` 为一个UTF16码，可根据表情对象 `tag` 属性计算得到此UTF16码)来得到表情对象
```js
     var emojiObject = RongIMClient.Expression.getEmojiByContent('\u1F600');
     //如果传入的不是合法UTF16码或者表情名单中不存在此UTF16码则返回 undeined 
     console.log(emojiObject);
```

#### RongIMClient.Expression.calcUTF
根据表情的 `content` 计算得到表情的 `tag` 属性
```js
     var tag = RongIMClient.Expression.calcUTF('\u1F600');
     console.log(tag);
     //返回\ud83d\ude00 即将 \u1F600 计算为 \ud83d\ude00
```

#### RongIMClient.Expression.getEmojiObjByEnglishNameOrChineseName
根据表情的中文名称或者英文名称得到表情对象
```js
     var emojiObject = RongIMClient.Expression.getEmojiObjByEnglishNameOrChineseName("足球");
     console.log(emojiObject);
```

#### RongIMClient.Expression.retrievalEmoji
检索传入的字符串中是否含有表情 `tag`，如有则根据传入的callback函数执行制定操作,callback函数中 `务必带返回值` 
```js
     var str = RongIMClient.Expression.retrievalEmoji('这是一个表情\ud83d\ude00',function(emojiObject){
          console.log(emojiObject);
          return emojiObject.chineseName;
     });
     console.log(str);
     //打印为 这是一个表情狞笑
     
```
### 浏览器兼容性
```js
 // IE 6+ 、chrome 3+ 、firefox 3.5+ 、safari 4+ 、 opera 12+
```
<hr>
## 音频播放帮助库如何使用？
`http://res.websdk.rongcloud.cn/RongIMClient.voice-0.9.1.min.js` 融云官方音频播放帮助库引用地址.音频播放帮助库是基于 `Web SDK` 的，使用之前请务必提前载入 `Web SDK`.音频播放帮助库中的方法均为`静态方法`.与`IE`以及`opera`内核类型浏览器不兼容。

#### RongIMClient.voice.init
初始化音频播放帮助库,使用本库之前务必进行初始化操作，返回为 `boolean` 类型用来说明次音频库是否已经初始化完成
```js
     var isInit = RongIMClient.voice.init();
     console.log(isInit);
     //可以根据isInit来判断是否已经初始化完成
```

#### RongIMClient.voice.play
播放传入的格式为AMR的音频BASE64码
```js
     RongIMClient.voice.play('格式为AMR的音频BASE64码','音频持续时间(秒)');
     //如果不知道音频的持续时间，可通过音频base64长度除以1024得到大概秒数
```
#### RongIMClient.voice.onprogress
音频播放过程中执行的进度方法,需自行注册.
```js
     RongIMClient.voice.onprogress ＝ function(){
          console.log("正在执行");
     };
     //执行单位时间为一秒执行一次
```
### 浏览器兼容性
```js
 //pc :     Firefox (Gecko) 3.6 (1.9.2)+     Chrome 7+   Safari 6.0.2+
 //mobile :  Firefox (Gecko) 32+     Android 3+  Safari 6.1+
```
<hr>
## Web 端本地存储帮助库如何使用？
`http://res.websdk.rongcloud.cn/RongIMClient.indexedDB.min.js` 融云官方 Web 端本地存储帮助库引用地址. Web 端本地存储帮助库是基于 `indexed DB` 的，使用之前请务必确保提前载入 `Web SDK` 和当前浏览器支持 `indexed DB` . Web 端本地存储帮助库中的方法均为`静态方法`.

#### RongIMClient.indexedDB.getMessageListFromIndexedDB
得到本地之前存储的消息对象列表.
```js
     RongIMClient.indexedDB.getMessageListFromIndexedDB(function(msgList){
          console.log(msgList);
     });
```

#### RongIMClient.indexedDB.addMessageToIndexedDB
将消息对象添加到本地存储.
```js
     var msg=RongIMClient.TextMessage.obtain("this is a demo");
     msg.setMessageId(Math.random());
     var messageId=msg.getMessageId();
     RongIMClient.indexedDB.addMessageToIndexedDB(msg,function(){
          console.log('add success');
     });
```
#### RongIMClient.indexedDB.deleteMessageFromIndexedDB
根据消息标识id把指定消息对象从本地存储删除.
```js
     RongIMClient.indexedDB.deleteMessageFromIndexedDB(messageId,function(){
          console.log('delete success');
     });
```
#### RongIMClient.indexedDB.getMessageListCountFromIndexedDB
得到本地存储的消息对象列表长度.
```js
     RongIMClient.indexedDB.getMessageListCountFromIndexedDB(function(count){
          console.log('length : ' + count);
     });
```
### 浏览器兼容性
```js
 //pc :     Firefox (Gecko) 4 (2)+     Chrome 12+  Internet Explorer 10+
 //mobile :  Firefox (Gecko) 6+
```
