//channel object constructor 最顶层的通道对象，内部封装了io对象
function Channel(address, cb, self) {
    //连接服务器
    this.socket = io.connect(address.host + "/websocket?appId=" + self.appId + "&token=" + encodeURIComponent(self.token) + "&sdkVer=" + self.sdkVer + "&apiVer=" + self.apiVer, cb);

    //注册状态改变观察者
    if (typeof _ConnectionStatusListener == "object" && "onChanged" in _ConnectionStatusListener) {
        this.socket.on("StatusChanged", function (code) {
            //如果参数为DisconnectionStatus，就停止心跳，其他的不停止心跳。每3min连接一次服务器
            if (code instanceof DisconnectionStatus) {
                _ConnectionStatusListener.onChanged(RongIMClient.ConnectionStatus.setValue(code + 2));
                self.clearHeartbeat();
                return;
            }
            _ConnectionStatusListener.onChanged(RongIMClient.ConnectionStatus.setValue(code))
        })
    } else {
        throw new Error("setConnectStatusListener:Parameter format is incorrect")
    }
    //发送，如果通道可写就发送，不可写就重连服务器
    this.writeAndFlush = function (val) {
        if (this.isWritable()) {
            this.socket.send(val);
        } else {
            this.reconnect({
                onSuccess: function () {
                    io.getInstance().send(val);
                },
                onError: function () {
                    throw new Error("reconnect fail")
                }
            })
        }
    };
    //重连并清空messageid
    this.reconnect = function (callback) {
        io.messageIdHandler.clearMessageId();
        this.socket = this.socket.reconnect();
        if (callback) {
            self.reconnectObj = callback;
        }
    };
    this.disconnect = function (x) {
        this.socket.disconnect(x);
    };
    //通道是否可写
    this.isWritable = function () {
        return io.getInstance().connected || io.getInstance().connecting
    };
    //注册message观察者
    this.socket.on("message", self.handler.handleMessage);
    //注册断开连接观察者
    this.socket.on("disconnect", function () {
        self.channel.socket.fire("StatusChanged", 4);
    })
}

//protobuf映射
function callbackMapping(entity, tag) {
    switch (tag) {
        case "GetUserInfoOutput":
            var userInfo = new RongIMClient.UserInfo();
            userInfo.setUserId(entity.userId);
            userInfo.setUserName(entity.userName);
            userInfo.setPortraitUri(entity.userPortrait);
            return userInfo;
        case "GetQNupTokenOutput":
            return {
                deadline: io.util.int64ToTimestamp(entity.deadline),
                token: entity.token
            };
        case "GetQNdownloadUrlOutput":
            return {
                downloadUrl: entity.downloadUrl
            };
        case "CreateDiscussionOutput":
            return entity.id;
        case "ChannelInfoOutput":
            var disInfo = new RongIMClient.Discussion();
            disInfo.setCreatorId(entity.adminUserId);
            disInfo.setId(entity.channelId);
            disInfo.setMemberIdList(entity.firstTenUserIds);
            disInfo.setName(entity.channelName);
            disInfo.setOpen(RongIMClient.DiscussionInviteStatus.setValue(entity.openStatus));
            return disInfo;
        case "GroupHashOutput":
            return entity.result;
        case "QueryBlackListOutput":
            return entity.userIds;
        default:
            return entity;
    }
}
//初始化通道对象
function __init(f) {
    this.channel = new Channel(Client.Endpoint, f, this);
}

//连接端类，逻辑处理全在此类中
function Client(_to, _ap) {
    var timeoutMillis = 100000, self = this;
    this.timeout_ = 0;
    this.appId = _ap;
    this.token = _to;
    this.sdkVer = "1.0.0";
    this.apiVer = "1.0.0";
    this.channel = null;
    this.handler = null;
    this.userId = "";
    this.reconnectObj = {};
    this.heartbeat = 0;
    this.chatroomId = '';
    //用于心跳启动定时器
    this.resumeTimer = function () {
        if (!this.timeout_) {
            this.timeout_ = setTimeout(function () {
                if (!self.timeout_) {
                    return;
                }
                try {
                    self.channel.disconnect()
                } catch (e) {
                }
                clearTimeout(self.timeout_);
                self.timeout_ = 0;
                self.channel.reconnect();
                self.channel.socket.fire("StatusChanged", 5);
            }, timeoutMillis)
        }
    };
    //销毁心跳定时器
    this.pauseTimer = function () {
        if (this.timeout_) {
            clearTimeout(this.timeout_);
            this.timeout_ = 0;
        }
    };

    //连接服务器
    this.connect = function (_callback) {
        //判断navi是否已经返回地址
        if (Client.Endpoint.host) {
            if (io._TransportType == "websocket") {
                if (!global.WebSocket) {
                    _callback.onError(RongIMClient.ConnectErrorStatus.setValue(1));
                    return;
                }
                //判断是否是flashsocket  是的话就加载代理文件
                'loadFlashPolicyFile' in WebSocket && WebSocket.loadFlashPolicyFile();
            }
            //实例消息处理类
            this.handler = new MessageHandler(this);
            //设置连接回调
            this.handler.setConnectCallback(_callback);
            //实例通道类型
            this.channel = new Channel(Client.Endpoint, function(){
                io._TransportType == "websocket" && self.keepLive()
            }, this);
            //触发状态改变观察者
            this.channel.socket.fire("StatusChanged", 1)
        } else {
            //没有返回地址就手动抛出错误
            _callback.onError(RongIMClient.ConnectErrorStatus.setValue(5));
        }
    };
    //心跳启动方法
    this.keepLive = function () {
        if (this.heartbeat > 0) {
            clearInterval(this.heartbeat);
        }
        this.heartbeat = setInterval(function () {
            self.resumeTimer();
            self.channel.writeAndFlush(new PingReqMessage());
            console.log("keep live pingReqMessage sending appId " + self.appId);
        }, 180000);
    };
    //心跳停止方法
    this.clearHeartbeat = function () {
        clearInterval(this.heartbeat);
        this.heartbeat=0;
        this.pauseTimer();
    };
    //发送publishMessage消息
    this.publishMessage = function (_topic, _data, _targetId, _callback, _msg) {
        var msgId = io.messageIdHandler.messageIdPlus(this.channel.reconnect);
        if (!msgId) {
            return;
        }
        var msg = new PublishMessage(_topic, _data, _targetId);
        msg.setMessageId(msgId);
        if (_callback) {
            msg.setQos(Qos.AT_LEAST_ONCE);
            this.handler.putCallback(new PublishCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), _msg)
        } else {
            msg.setQos(Qos.AT_MOST_ONCE);
        }
        this.channel.writeAndFlush(msg);
    };
    //发送queryMessage消息
    this.queryMessage = function (_topic, _data, _targetId, _qos, _callback, pbtype) {
        //如果topic是userinfo，就去userinfo缓存对象里拿，没有的话再去请求服务器拉取userinfo
        if (_topic == "userInf") {
            if (userInfoMapping[_targetId]) {
                _callback.onSuccess(userInfoMapping[_targetId]);
                return;
            }
        }
        var msgId = io.messageIdHandler.messageIdPlus(this.channel.reconnect);
        if (!msgId) {
            return;
        }
        var msg = new QueryMessage(_topic, _data, _targetId);
        msg.setMessageId(msgId);
        msg.setQos(_qos);
        this.handler.putCallback(new QueryCallback(_callback.onSuccess, _callback.onError), msg.getMessageId(), pbtype);
        this.channel.writeAndFlush(msg)
    };
    //同步消息队列
    var SyncTimeQueue = [];
    //队列的执行状态
    SyncTimeQueue.state = "complete";
    function invoke() {
        var time, modules, str, target,
        //从队列开头取出一个赋值给temp变量
            temp = SyncTimeQueue.shift();
        if (temp == undefined) {
            return;
        }
        //改变状态为pending
        SyncTimeQueue.state = "pending";
        if (temp.type != 2) {
            //普通消息
            time = io.util.cookieHelper.getItem(self.userId) || 0;
            modules = new Modules.SyncRequestMsg();
            modules.setIspolling(false);
            str = 'pullMsg';
            target = self.userId;
        } else {
            //聊天室消息
            time = io.util.cookieHelper.getItem(self.userId + "CST") || 0;
            modules = new Modules.ChrmPullMsg();
            modules.setCount(0);
            str = 'chrmPull';
            if (self.chatroomId === '') {
                //受到聊天室消息，但是本地没有加入聊天室就手动抛出一个错误
                throw new Error("syncTime:Received messages of chatroom but was not init");
            }
            target = self.chatroomId;
        }
        //判断服务器给的时间是否消息本地存储的时间，小于的话不执行拉取操作，进行一下步队列操作
        if (temp.pulltime <= time) {
            SyncTimeQueue.state = "complete";
            invoke();
            return;
        }
        modules.setSyncTime(time);
        //发送queryMessage请求
        self.queryMessage(str, io.util.arrayFrom(modules.toArrayBuffer()), target, Qos.AT_LEAST_ONCE, {
            onSuccess: function (collection) {
                var sync = io.util.int64ToTimestamp(collection.syncTime),
                    symbol = self.userId;
                if (str == "chrmPull") {
                    symbol += 'CST';
                }
                //把返回时间戳存入本地，普通消息key为userid，聊天室消息key为userid＋'CST'；value都为服务器返回的时间戳
                io.util.cookieHelper.setItem(symbol, sync);
                //把拉取到的消息逐条传给消息监听器
                var list = collection.list;
                for (var i = 0; i < list.length; i++) {
                    bridge._client.handler.onReceived(list[i])
                }
                SyncTimeQueue.state = "complete";
                invoke();
            },
            onError: function () {
                SyncTimeQueue.state = "complete";
                invoke();
            }
        }, "DownStreamMessages");
    }
    //同步消息
    this.syncTime = function (_type, pullTime) {
        SyncTimeQueue.push({ type: _type, pulltime: pullTime});
        //如果队列中只有一个成员并且状态已经完成就执行invoke方法
        if (SyncTimeQueue.length == 1 && SyncTimeQueue.state == "complete") {
            invoke()
        }
    }
}