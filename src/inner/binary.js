//binary helper object 二进制帮助对象。RongBinaryHelper在flash widget的js中(swfobject-0.2.js)有用到。修改时请注意
var binaryHelper = global.RongBinaryHelper = {
    //将传入的数组每一项转为数字类型。因为在ie中每一项是个字符串，所以需要执行此方法。
    init: function (array) {
        for (var i = 0; i < array.length; i++) {
            array[i] *= 1;
            if (array[i] < 0) {
                array[i] += 256
            }
        }
        return array
    },
    writeUTF: function (str, isGetBytes) {
        var back = [],
            byteSize = 0;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (code >= 0 && code <= 127) {
                byteSize += 1;
                back.push(code);
            } else if (code >= 128 && code <= 2047) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)))
            } else if (code >= 2048 && code <= 65535) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)))
            }
        }
        for (i = 0; i < back.length; i++) {
            if (back[i] > 255) {
                back[i] &= 255
            }
        }
        if (isGetBytes) {
            return back
        }
        if (byteSize <= 255) {
            return [0, byteSize].concat(back);
        } else {
            return [byteSize >> 8, byteSize & 255].concat(back);
        }
    },
    readUTF: function (arr) {
        if (Object.prototype.toString.call(arr) == "[object String]") {
            return arr;
        }
        var UTF = "",
            _arr = this.init(arr);
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length,
                    store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2)
                }
                UTF += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1
            } else {
                UTF += String.fromCharCode(_arr[i])
            }
        }
        return UTF
    },
    //将参数转化为RongIMStream对象
    convertStream: function (x) {
        if (x instanceof RongIMStream) {
            return x
        } else {
            return new RongIMStream(x)
        }
    },
    toMQttString: function (str) {
        return this.writeUTF(str)
    }
};
//operation stream object 融云消息类stream对象。用于处理字节
var RongIMStream = function (arr) {
    var pool = binaryHelper.init(arr),
        self = this,
    //返回当前流执行的起始位置是否已经大于整个流的长度
        check = function () {
            return self.position >= pool.length
        };
    //当前流执行的起始位置
    this.position = 0;
    //当前流写入的多少字节
    this.writen = 0;

    function baseRead(m, i, a) {
        var t = a ? a : [];
        for (var start = 0; start < i; start++) {
            t[start] = pool[m.position++]
        }
        return t
    }

    this.readInt = function () {
        if (check()) {
            return -1
        }
        var end = "";
        for (var i = 0; i < 4; i++) {
            end += pool[this.position++].toString(16)
        }
        return parseInt(end, 16);
    };
    this.readByte = function () {
        if (check()) {
            return -1
        }
        var val = pool[this.position++];
        if (val > 255) {
            val &= 255;
        }
        return val;
    };
    this.read = function (bytesArray) {
        if (check()) {
            return -1
        }
        if (bytesArray) {
            baseRead(this, bytesArray.length, bytesArray)
        } else {
            return this.readByte();
        }
    };
    this.readUTF = function () {
        var big = (this.readByte() << 8) | this.readByte();
        return binaryHelper.readUTF(pool.slice(this.position, this.position += big));
    };
    this.write = function (_byte) {
        var b = _byte;
        if (Object.prototype.toString.call(b).toLowerCase() == "[object array]") {
            [].push.apply(pool, b)
        } else {
            if (+b == b) {
                if (b > 255) {
                    b &= 255;
                }
                pool.push(b);
                this.writen++
            }
        }
        return b
    };
    this.writeChar = function (v) {
        if (+v != v) {
            throw new Error("writeChar:arguments type is error")
        }
        this.write((v >> 8) & 255);
        this.write(v & 255);
        this.writen += 2
    };
    this.writeUTF = function (str) {
        var val = binaryHelper.writeUTF(str);
        [].push.apply(pool, val);
        this.writen += val.length;
    };
    this.toComplements = function () {
        var _tPool = pool;
        for (var i = 0; i < _tPool.length; i++) {
            if (_tPool[i] > 128) {
                _tPool[i] -= 256
            }
        }
        return _tPool
    };
    this.getBytesArray = function (isCom) {
        if (isCom) {
            return this.toComplements()
        }
        return pool
    }
};