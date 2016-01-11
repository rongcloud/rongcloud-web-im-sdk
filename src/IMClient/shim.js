/**
 * Created by zhangyatao on 16/1/11.
 */
//存储会话列表的类
var _func = function () {
    //添加会话，当前列表没有该会话则将该会话加到队列最后，有的话将该会话放到队列最开始
    this.add = function (x) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].getTargetId() === x.getTargetId() && i != 0 && this[i].getConversationType() == x.getConversationType()) {
                this.unshift(this.splice(i, 1)[0]);
                return;
            }
        }
        this.unshift(x);
    };
    //根据会话类型和tagetid从列表中得到会话
    this.get = function (conver, tarid) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].getTargetId() == tarid && this[i].getConversationType() == conver) {
                return this[i]
            }
        }
        return null;
    }
};
_func.prototype = [];
//本地会话类型和服务器端会话类型映射关系
var C2S = {
    "4": 1,
    "2": 2,
    "3": 3,
    "1": 5
};
var sessionStore = global.sessionStorage || new function () {
        var c = {};
        this.length = 0;
        this.clear = function () {
            c = {};
            this.length = 0
        };
        this.setItem = function (e, f) {
            !c[e] && this.length++;
            c[e] = f;
            return e in c
        };
        this.getItem = function (e) {
            return c[e]
        };
        this.removeItem = function (f) {
            if (f in c) {
                delete c[f];
                this.length--;
                return true;
            }
            return false;
        }
    };
var LimitableMap = function (limit) {
    this.limit = limit || 10;
    this.map = {};
    this.keys = [];
};
LimitableMap.prototype.set = function (key, value) {
    var map = this.map;
    var keys = this.keys;
    if (!map.hasOwnProperty(key)) {
        if (keys.length === this.limit) {
            var firstKey = keys.shift();
            delete map[firstKey];
        }
        keys.push(key)
    }
    map[key] = value;
};
LimitableMap.prototype.get = function (key) {
    return this.map[key] || 0;
};
module.exports = {
    list: _func,
    C2S: C2S,
    sessionStore: sessionStore,
    LimitableMap: LimitableMap
};