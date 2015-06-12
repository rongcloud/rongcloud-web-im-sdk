//construct transfer message object as below 内置枚举对象
var Qos = RongIMEnum({AT_MOST_ONCE: 0, AT_LEAST_ONCE: 1, EXACTLY_ONCE: 2, DEFAULT: 3}),
Type = RongIMEnum({CONNECT: 1, CONNACK: 2, PUBLISH: 3, PUBACK: 4, QUERY: 5, QUERYACK: 6, QUERYCON: 7, SUBSCRIBE: 8, SUBACK: 9, UNSUBSCRIBE: 10, UNSUBACK: 11, PINGREQ: 12, PINGRESP: 13, DISCONNECT: 14}),
DisconnectionStatus = RongIMEnum({RECONNECT: 0, OTHER_DEVICE_LOGIN: 1, CLOSURE: 2, UNKNOWN_ERROR: 3, LOGOUT: 4, BLOCK: 5}),
ConnectionState = RongIMEnum({ACCEPTED: 0, UNACCEPTABLE_PROTOCOL_VERSION: 1, IDENTIFIER_REJECTED: 2, SERVER_UNAVAILABLE: 3, TOKEN_INCORRECT: 4, NOT_AUTHORIZED: 5, REDIRECT: 6, PACKAGE_ERROR: 7, APP_BLOCK_OR_DELETE: 8, BLOCK: 9, TOKEN_EXPIRE: 10, DEVICE_ERROR: 11});

/**
 * 消息类，对java逻辑的重新实现
 * */
 function Message(argu) {
    var _header, _headerCode, lengthSize = 0;
    if (argu instanceof Header) {
        _header = argu
    } else {
        _header = new Header(argu, false, Qos.AT_MOST_ONCE, false)
    }
    this.read = function (In, length) {
        this.readMessage(In, length)
    };
    this.write = function (Out) {
        var out = binaryHelper.convertStream(Out);
        _headerCode = this.getHeaderFlag();
        out.write(_headerCode);
        this.writeMessage(out);
        return out
    };
    this.getHeaderFlag = function () {
        return _header.encode();
    };
    this.getLengthSize = function () {
        return lengthSize
    };
    this.toBytes = function () {
        return this.write([]).getBytesArray()
    };
    this.setRetained = function (retain) {
        _header.retain = retain
    };
    this.isRetained = function () {
        return _header.retain
    };
    this.setQos = function (qos) {
        _header.qos = qos instanceof Qos ? qos : Qos.setValue(qos);
    };
    this.getQos = function () {
        return _header.qos
    };
    this.setDup = function (dup) {
        _header.dup = dup
    };
    this.isDup = function () {
        return _header.dup
    };
    this.getType = function () {
        return _header.type
    };
    this.messageLength = function () {
        return 0
    };
    this.writeMessage = function (out) {
    };
    this.readMessage = function (In) {
    };
    this.init = function (args) {
        var valName,nana;
        for (nana in args) {
            if (!args.hasOwnProperty(nana))
                continue;
            valName=nana.replace(/^\w/,function(x){
                var tt=x.charCodeAt(0);
                return 'set'+(tt>=0x61?String.fromCharCode(tt & ~32):x)
            });
            if (valName in this) {
                this[valName](args[nana])
            }
        }
    };
}

Message._name = "Message";

function Header(_type, _retain, _qos, _dup) {
    this.type = null;
    this.retain = false;
    this.qos = Qos.AT_LEAST_ONCE;
    this.dup = false;
    if (_type && +_type == _type && arguments.length == 1) {
        this.retain = (_type & 1) > 0;
        this.qos = Qos.setValue((_type & 6) >> 1);
        this.dup = (_type & 8) > 0;
        this.type = Type.setValue((_type >> 4) & 15);
    } else {
        this.type = Type.setValue(_type);
        this.retain = _retain;
        this.qos = Qos.setValue(_qos);
        this.dup = _dup;
    }
    this.getType = function () {
        return this.type
    };
    this.encode = function () {
        var _byte = (this.type << 4);
        _byte |= this.retain ? 1 : 0;
        _byte |= this.qos << 1;
        _byte |= this.dup ? 8 : 0;
        return _byte
    };
    this.toString = function () {
        return "Header [type=" + this.type + ",retain=" + this.retain + ",qos=" + this.qos + ",dup=" + this.dup + "]"
    }
}

function ConnectMessage() {
    var CONNECT_HEADER_SIZE = 12,
    protocolId = "RCloud",
    protocolVersion = 3,
    clientId, keepAlive, appId, token, cleanSession, willTopic, will, willQos, retainWill, hasAppId, hasToken, hasWill;
    switch (arguments.length) {
        case 0:
        Message.call(this, Type.CONNECT);
        break;
        case 1:
        Message.call(this, arguments[0]);
        break;
        case 3:
        Message.call(this, Type.CONNECT);
        if (!arguments[0] || arguments[0].length > 64) {
            throw new Error("ConnectMessage:Client Id cannot be null and must be at most 64 characters long: " + arguments[0])
        }
        clientId = arguments[0];
        cleanSession = arguments[1];
        keepAlive = arguments[2];
        break
    }
    this.messageLength = function () {
        var payloadSize = binaryHelper.toMQttString(clientId).length;
        payloadSize += binaryHelper.toMQttString(willTopic).length;
        payloadSize += binaryHelper.toMQttString(will).length;
        payloadSize += binaryHelper.toMQttString(appId).length;
        payloadSize += binaryHelper.toMQttString(token).length;
        return payloadSize + CONNECT_HEADER_SIZE
    };
    this.readMessage = function (In) {
        var stream = binaryHelper.convertStream(In);
        protocolId = stream.readUTF();
        protocolVersion = stream.readByte();
        var cFlags = stream.readByte();
        hasAppId = (cFlags & 128) > 0;
        hasToken = (cFlags & 64) > 0;
        retainWill = (cFlags & 32) > 0;
        willQos = cFlags >> 3 & 3;
        hasWill = (cFlags & 4) > 0;
        cleanSession = (cFlags & 32) > 0;
        keepAlive = stream.read() * 256 + stream.read();
        clientId = stream.readUTF();
        if (hasWill) {
            willTopic = stream.readUTF();
            will = stream.readUTF()
        }
        if (hasAppId) {
            try {
                appId = stream.readUTF()
            } catch (ex) {
            }
        }
        if (hasToken) {
            try {
                token = stream.readUTF()
            } catch (ex) {
            }
        }
        return stream
    };
    this.writeMessage = function (out) {
        var stream = binaryHelper.convertStream(out);
        stream.writeUTF(protocolId);
        stream.write(protocolVersion);
        var flags = cleanSession ? 2 : 0;
        flags |= hasWill ? 4 : 0;
        flags |= willQos ? willQos >> 3 : 0;
        flags |= retainWill ? 32 : 0;
        flags |= hasToken ? 64 : 0;
        flags |= hasAppId ? 128 : 0;
        stream.write(flags);
        stream.writeChar(keepAlive);
        stream.writeUTF(clientId);
        if (hasWill) {
            stream.writeUTF(willTopic);
            stream.writeUTF(will)
        }
        if (hasAppId) {
            stream.writeUTF(appId)
        }
        if (hasToken) {
            stream.writeUTF(token)
        }
        return stream
    };

}

ConnectMessage._name = "ConnectMessage";
io.util._extends(ConnectMessage, Message);

function ConnAckMessage() {
    var status, userId, MESSAGE_LENGTH = 2;
    switch (arguments.length) {
        case 0:
        Message.call(this, Type.CONNACK);
        break;
        case 1:
        if (arguments[0] instanceof Header) {
            Message.call(this, arguments[0])
        } else {
            if (arguments[0] instanceof ConnectionState) {
                Message.call(this, Type.CONNACK);
                if (arguments[0] == null) {
                    throw new Error("ConnAckMessage:The status of ConnAskMessage can't be null")
                }
                status = arguments[0]
            }
        }
    }
    this.messageLength = function () {
        var length = MESSAGE_LENGTH;
        if (userId) {
            length += binaryHelper.toMQttString(userId).length
        }
        return length
    };
    this.readMessage = function (In, msglength) {
        var stream = binaryHelper.convertStream(In);
        stream.read();
        var result = +stream.read();
        if (result >= 0 && result <= 9) {
            this.setStatus(result);
        } else {
            throw new Error("Unsupported CONNACK code:" + result)
        }
        if (msglength > MESSAGE_LENGTH) {
            this.setUserId(stream.readUTF())
        }
    };
    this.writeMessage = function (out) {
        var stream = binaryHelper.convertStream(out);
        stream.write(128);
        switch (+status) {
            case 0:
            case 1:
            case 2:
            case 5:
            case 6:
            stream.write(+status);
            break;
            case 3:
            case 4:
            stream.write(3);
            break;
            default:
            throw new Error("Unsupported CONNACK code:" + status);
        }
        if (userId) {
            stream.writeUTF(userId)
        }
        return stream
    };
    this.getStatus = function () {
        return status
    };
    this.setStatus = function (x) {
        status = x instanceof ConnectionState ? x : ConnectionState.setValue(x);
    };
    this.setUserId = function (_userId) {
        userId = _userId
    };
    this.getUserId = function () {
        return userId
    };
}

ConnAckMessage._name = "ConnAckMessage";
io.util._extends(ConnAckMessage, Message);

function DisconnectMessage(one) {
    var status;
    this.MESSAGE_LENGTH = 2;
    if (one instanceof Header) {
        Message.call(this, one)
    } else {
        Message.call(this, Type.DISCONNECT);
        if (one instanceof DisconnectionStatus) {
            status = one
        }
    }
    this.messageLength = function () {
        return this.MESSAGE_LENGTH
    };
    this.readMessage = function (In) {
        var _in = binaryHelper.convertStream(In);
        _in.read();
        var result = +_in.read();
        if (result >= 0 && result <= 5) {
            this.setStatus(result);
        } else {
            throw new Error("Unsupported CONNACK code:" + result)
        }
    };
    this.writeMessage = function (Out) {
        var out = binaryHelper.convertStream(Out);
        out.write(0);
        if (+status >= 1 && +status <= 3) {
            out.write((+status) - 1);
        } else {
            throw new Error("Unsupported CONNACK code:" + status)
        }
    };
    this.setStatus = function (x) {
        status = x instanceof DisconnectionStatus ? x : DisconnectionStatus.setValue(x);
    };
    this.getStatus = function () {
        return status
    };
}

DisconnectMessage._name = "DisconnectMessage";
io.util._extends(DisconnectMessage, Message);

function PingReqMessage(header) {
    if (header && header instanceof Header) {
        Message.call(this, header)
    } else {
        Message.call(this, Type.PINGREQ)
    }
}

PingReqMessage._name = "PingReqMessage";
io.util._extends(PingReqMessage, Message);

function PingRespMessage(header) {
    if (header && header instanceof Header) {
        Message.call(this, header)
    } else {
        Message.call(this, Type.PINGRESP)
    }
}

PingRespMessage._name = "PingRespMessage";
io.util._extends(PingRespMessage, Message);

function RetryableMessage(argu) {
    var messageId;
    Message.call(this, argu);
    this.messageLength = function () {
        return 2
    };
    this.writeMessage = function (Out) {
        var out = binaryHelper.convertStream(Out),
        Id = this.getMessageId(),
        lsb = Id & 255,
        msb = (Id & 65280) >> 8;
        out.write(msb);
        out.write(lsb);
        return out
    };
    this.readMessage = function (In) {
        var _in = binaryHelper.convertStream(In),
        msgId = _in.read() * 256 + _in.read();
        this.setMessageId(parseInt(msgId, 10));
    };
    this.setMessageId = function (_messageId) {
        messageId = _messageId
    };
    this.getMessageId = function () {
        return messageId
    }
}

RetryableMessage._name = "RetryableMessage";
io.util._extends(RetryableMessage, Message);

function PubAckMessage(args) {
    var status, msgLen = 2,
    date = 0;
    if (args instanceof Header) {
        RetryableMessage.call(this, args)
    } else {
        RetryableMessage.call(this, Type.PUBACK);
        this.setMessageId(args)
    }
    this.messageLength = function () {
        return msgLen
    };
    this.writeMessage = function (Out) {
        var out = binaryHelper.convertStream(Out);
        PubAckMessage.prototype.writeMessage.call(this, out)
    };
    this.readMessage = function (In) {
        var _in = binaryHelper.convertStream(In);
        PubAckMessage.prototype.readMessage.call(this, _in);
        date = _in.readInt();
        status = _in.read() * 256 + _in.read()
    };
    this.setStatus = function (x) {
        status = x;
    };
    this.getStatus = function () {
        return status
    };
    this.getDate = function () {
        return date
    };
}

PubAckMessage._name = "PubAckMessage";
io.util._extends(PubAckMessage, RetryableMessage);

function PublishMessage(one, two, three) {
    var topic, data, targetId, date;
    if (arguments.length == 1 && one instanceof Header) {
        RetryableMessage.call(this, one)
    } else {
        if (arguments.length == 3) {
            RetryableMessage.call(this, Type.PUBLISH);
            topic = one;
            targetId = three;
            data = typeof two == "string" ? binaryHelper.toMQttString(two) : two;
        }
    }
    this.messageLength = function () {
        var length = 10;
        length += binaryHelper.toMQttString(topic).length;
        length += binaryHelper.toMQttString(targetId).length;
        length += data.length;
        return length
    };
    this.writeMessage = function (Out) {
        var out = binaryHelper.convertStream(Out);
        out.writeUTF(topic);
        out.writeUTF(targetId);
        PublishMessage.prototype.writeMessage.apply(this, arguments);
        out.write(data)
    };
    this.readMessage = function (In, msgLength) {
        var pos = 6,
        _in = binaryHelper.convertStream(In);
        date = _in.readInt();
        topic = _in.readUTF();
        pos += binaryHelper.toMQttString(topic).length;
        PublishMessage.prototype.readMessage.apply(this, arguments);
        data = new Array(msgLength - pos);
        _in.read(data)
    };
    this.setTopic = function (x) {
        topic = x;
    };
    this.setData = function (x) {
        data = x;
    };
    this.setTargetId = function (x) {
        targetId = x;
    };
    this.setDate = function (x) {
        date = x;
    };
    this.setData = function (x) {
        data = x;
    };
    this.getTopic = function () {
        return topic
    };
    this.getData = function () {
        return data
    };
    this.getTargetId = function () {
        return targetId
    };
    this.getDate = function () {
        return date
    }
}

PublishMessage._name = "PublishMessage";
io.util._extends(PublishMessage, RetryableMessage);

function QueryMessage(one, two, three) {
    var topic, data, targetId;
    if (one instanceof Header) {
        RetryableMessage.call(this, one)
    } else {
        if (arguments.length == 3) {
            RetryableMessage.call(this, Type.QUERY);
            data = typeof two == "string" ? binaryHelper.toMQttString(two) : two;
            topic = one;
            targetId = three;
        }
    }
    this.messageLength = function () {
        var length = 0;
        length += binaryHelper.toMQttString(topic).length;
        length += binaryHelper.toMQttString(targetId).length;
        length += 2;
        length += data.length;
        return length
    };
    this.writeMessage = function (Out) {
        var out = binaryHelper.convertStream(Out);
        out.writeUTF(topic);
        out.writeUTF(targetId);
        this.constructor.prototype.writeMessage.call(this, out);
        out.write(data)
    };
    this.readMessage = function (In, msgLength) {
        var pos = 0,
        _in = binaryHelper.convertStream(In);
        topic = _in.readUTF();
        targetId = _in.readUTF();
        pos += binaryHelper.toMQttString(topic).length;
        pos += binaryHelper.toMQttString(targetId).length;
        this.constructor.prototype.readMessage.apply(this, arguments);
        pos += 2;
        data = new Array(msgLength - pos);
        _in.read(data)
    };
    this.setTopic = function (x) {
        topic = x;
    };
    this.setData = function (x) {
        data = x;
    };
    this.setTargetId = function (x) {
        targetId = x;
    };
    this.getTopic = function () {
        return topic
    };
    this.getData = function () {
        return data
    };
    this.getTargetId = function () {
        return targetId
    };
}

QueryMessage._name = "QueryMessage";
io.util._extends(QueryMessage, RetryableMessage);

function QueryConMessage(messageId) {
    if (messageId instanceof Header) {
        RetryableMessage.call(this, messageId)
    } else {
        RetryableMessage.call(this, Type.QUERYCON);
        this.setMessageId(messageId)
    }
}

QueryConMessage._name = "QueryConMessage";
io.util._extends(QueryConMessage, RetryableMessage);

function QueryAckMessage(header) {
    var data, status, date;
    RetryableMessage.call(this, header);
    this.readMessage = function (In, msgLength) {
        var _in = binaryHelper.convertStream(In);
        QueryAckMessage.prototype.readMessage.call(this, _in);
        date = _in.readInt();
        status = _in.read() * 256 + _in.read();
        if (msgLength > 0) {
            data = new Array(msgLength - 8);
            _in.read(data)
        }
    };
    this.getStatus = function () {
        return status
    };
    this.getDate = function () {
        return date
    };
    this.setDate = function (x) {
        date = x;
    };
    this.setStatus = function (x) {
        status = x;
    };
    this.setData = function (x) {
        data = x;
    };
    this.getData = function () {
        return data
    };
}

QueryAckMessage._name = "QueryAckMessage";
io.util._extends(QueryAckMessage, RetryableMessage);

//create message output stream for send to server  把消息对象写入到一个流中
function MessageOutputStream(_out) {
    var out = binaryHelper.convertStream(_out);
    this.writeMessage = function (msg) {
        if (msg instanceof Message) {
            msg.write(out)
        }
    }
}

//converted input stream to message object ,that was server send to client，把服务器返回的二进制流生成具体的消息对象
function MessageInputStream(In, isPolling) {
    var flags, header, msg = null;
    if (!isPolling) {
        var _in = binaryHelper.convertStream(In);
        flags = _in.readByte();
    } else {
        flags = In["headerCode"];
    }
    header = new Header(flags);
    this.readMessage = function () {
        switch (+header.getType()) {
            case 2:
            msg = new ConnAckMessage(header);
            break;
            case 3:
            msg = new PublishMessage(header);
            break;
            case 4:
            msg = new PubAckMessage(header);
            break;
            case 5:
            msg = new QueryMessage(header);
            break;
            case 6:
            msg = new QueryAckMessage(header);
            break;
            case 7:
            msg = new QueryConMessage(header);
            break;
            case 9:
            case 11:
            case 13:
            msg = new PingRespMessage(header);
            break;
            case 1:
            msg = new ConnectMessage(header);
            break;
            case 8:
            case 10:
            case 12:
            msg = new PingReqMessage(header);
            break;
            case 14:
            msg = new DisconnectMessage(header);
            break;
            default:
            throw new Error("No support for deserializing " + header.getType() + " messages")
        }
        if (isPolling) {
            msg.init(In);
        } else {
            msg.read(_in, In.length - 1);
        }
        return msg
    }
}
