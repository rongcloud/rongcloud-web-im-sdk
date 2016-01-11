var msg = require('./Message');
var TinyStream = require('../binary');
var e = require('./msgEnum');
var util = require('../tool');
var Message = msg.Message;
var Header = msg.Header;
var Type = e.Type;
var ConnectionState = e.ConnectionState;
var DisconnectionStatus = e.DisconnectionStatus;
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
        var payloadSize = TinyStream.toMQTString(clientId).length;
        payloadSize += TinyStream.toMQTString(willTopic).length;
        payloadSize += TinyStream.toMQTString(will).length;
        payloadSize += TinyStream.toMQTString(appId).length;
        payloadSize += TinyStream.toMQTString(token).length;
        return payloadSize + CONNECT_HEADER_SIZE
    };
    this.readMessage = function (In) {
        var stream = TinyStream.parse(In);
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
        var stream = TinyStream.parse(out);
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
util.inherit(ConnectMessage, Message, true);
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
            length += TinyStream.toMQTString(userId).length
        }
        return length
    };
    this.readMessage = function (In, msglength) {
        var stream = TinyStream.parse(In);
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
        var stream = TinyStream.parse(out);
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
util.inherit(ConnAckMessage, Message, true);
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
        var _in = TinyStream.parse(In);
        _in.read();
        var result = +_in.read();
        if (result >= 0 && result <= 5) {
            this.setStatus(result);
        } else {
            throw new Error("Unsupported CONNACK code:" + result)
        }
    };
    this.writeMessage = function (Out) {
        var out = TinyStream.parse(Out);
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
util.inherit(DisconnectMessage, Message, true);
function PingReqMessage(header) {
    if (header && header instanceof Header) {
        Message.call(this, header)
    } else {
        Message.call(this, Type.PINGREQ)
    }
}
PingReqMessage._name = "PingReqMessage";
util.inherit(PingReqMessage, Message, true);
function PingRespMessage(header) {
    if (header && header instanceof Header) {
        Message.call(this, header)
    } else {
        Message.call(this, Type.PINGRESP)
    }
}
PingRespMessage._name = "PingRespMessage";
util.inherit(PingRespMessage, Message, true);
function RetryableMessage(argu) {
    var messageId;
    Message.call(this, argu);
    this.messageLength = function () {
        return 2
    };
    this.writeMessage = function (Out) {
        var out = TinyStream.parse(Out),
            Id = this.getMessageId(),
            lsb = Id & 255,
            msb = (Id & 65280) >> 8;
        out.write(msb);
        out.write(lsb);
        return out
    };
    this.readMessage = function (In) {
        var _in = TinyStream.parse(In),
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
util.inherit(RetryableMessage, Message, true);
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
        var out = TinyStream.parse(Out);
        PubAckMessage.prototype.writeMessage.call(this, out)
    };
    this.readMessage = function (In) {
        var _in = TinyStream.parse(In);
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
util.inherit(PubAckMessage, RetryableMessage, true);
function PublishMessage(one, two, three) {
    var topic, data, targetId, date;
    if (arguments.length == 1 && one instanceof Header) {
        RetryableMessage.call(this, one)
    } else {
        if (arguments.length == 3) {
            RetryableMessage.call(this, Type.PUBLISH);
            topic = one;
            targetId = three;
            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
        }
    }
    this.messageLength = function () {
        var length = 10;
        length += TinyStream.toMQTString(topic).length;
        length += TinyStream.toMQTString(targetId).length;
        length += data.length;
        return length
    };
    this.writeMessage = function (Out) {
        var out = TinyStream.parse(Out);
        out.writeUTF(topic);
        out.writeUTF(targetId);
        PublishMessage.prototype.writeMessage.apply(this, arguments);
        out.write(data)
    };
    this.readMessage = function (In, msgLength) {
        var pos = 6,
            _in = TinyStream.parse(In);
        date = _in.readInt();
        topic = _in.readUTF();
        pos += TinyStream.toMQTString(topic).length;
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
util.inherit(PublishMessage, RetryableMessage, true);
function QueryMessage(one, two, three) {
    var topic, data, targetId;
    if (one instanceof Header) {
        RetryableMessage.call(this, one)
    } else {
        if (arguments.length == 3) {
            RetryableMessage.call(this, Type.QUERY);
            data = typeof two == "string" ? TinyStream.toMQTString(two) : two;
            topic = one;
            targetId = three;
        }
    }
    this.messageLength = function () {
        var length = 0;
        length += TinyStream.toMQTString(topic).length;
        length += TinyStream.toMQTString(targetId).length;
        length += 2;
        length += data.length;
        return length
    };
    this.writeMessage = function (Out) {
        var out = TinyStream.parse(Out);
        out.writeUTF(topic);
        out.writeUTF(targetId);
        this.constructor.prototype.writeMessage.call(this, out);
        out.write(data)
    };
    this.readMessage = function (In, msgLength) {
        var pos = 0,
            _in = TinyStream.parse(In);
        topic = _in.readUTF();
        targetId = _in.readUTF();
        pos += TinyStream.toMQTString(topic).length;
        pos += TinyStream.toMQTString(targetId).length;
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
util.inherit(QueryMessage, RetryableMessage, true);
function QueryConMessage(messageId) {
    if (messageId instanceof Header) {
        RetryableMessage.call(this, messageId)
    } else {
        RetryableMessage.call(this, Type.QUERYCON);
        this.setMessageId(messageId)
    }
}
QueryConMessage._name = "QueryConMessage";
util.inherit(QueryConMessage, RetryableMessage, true);
function QueryAckMessage(header) {
    var data, status, date;
    RetryableMessage.call(this, header);
    this.readMessage = function (In, msgLength) {
        var _in = TinyStream.parse(In);
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
util.inherit(QueryAckMessage, RetryableMessage, true);
module.exports = {
    ConnectMessage: ConnectMessage,
    ConnAckMessage: ConnAckMessage,
    DisconnectMessage: DisconnectMessage,
    PingReqMessage: PingReqMessage,
    PingRespMessage: PingRespMessage,
    RetryableMessage: RetryableMessage,
    PubAckMessage: PubAckMessage,
    PublishMessage: PublishMessage,
    QueryMessage: QueryMessage,
    QueryConMessage: QueryConMessage,
    QueryAckMessage: QueryAckMessage
};

