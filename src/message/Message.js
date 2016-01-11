/**
 * 消息类，对java逻辑的重新实现
 * */
var e = require('./msgEnum');
var TinyStream = require('../binary');
var Qos = e.Qos;
var Type = e.Type;
function Message(argu) {
    var _header, _headerCode, lengthSize = 0;
    if (argu instanceof Header) {
        _header = argu
    } else {
        _header = new Header(argu, false, Qos.AT_MOST_ONCE, false)
    }
    this.write = function (Out) {
        var out = TinyStream.parse(Out);
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
}
Message._name = "Message";
Message.prototype = {
    read: function (In, length) {
        this.readMessage(In, length)
    },
    toBytes: function () {
        return this.write([]).getBytesArray()
    }, messageLength: function () {
        return 0
    }, writeMessage: function (out) {
    }, readMessage: function (In) {
    }, init: function (args) {
        var valName, nana;
        for (nana in args) {
            if (!args.hasOwnProperty(nana))
                continue;
            valName = nana.replace(/^\w/, function (x) {
                var tt = x.charCodeAt(0);
                return 'set' + (tt >= 0x61 ? String.fromCharCode(tt & ~32) : x)
            });
            if (valName in this) {
                this[valName](args[nana])
            }
        }
    }
};
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
}
Header.prototype = {
    getType: function () {
        return this.type
    }, encode: function () {
        var _byte = (this.type << 4);
        _byte |= this.retain ? 1 : 0;
        _byte |= this.qos << 1;
        _byte |= this.dup ? 8 : 0;
        return _byte
    }, toString: function () {
        return "Header [type=" + this.type + ",retain=" + this.retain + ",qos=" + this.qos + ",dup=" + this.dup + "]"
    }
};
module.exports = {
    Message: Message,
    Header: Header
};