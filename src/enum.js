function inherit(superCtor) {
    var f = function () {
    };
    f.prototype = superCtor;
    return new f;
}
var Enum = function (namesToValues) {
    var enumeration = function () {
        throw "can't Instantiate Enumerations";
    };
    enumeration.setValue = function (x) {
        var val = null;
        enumeration.foreach(function (i) {
            if (i.value == x || i.name == x) {
                val = enumeration[i.name];
            }
        }, null);
        return val;
    };


    var proto = enumeration.prototype = {
        constructor: enumeration,
        toString: function () {
            return this.name;
        },
        valueOf: function () {
            return this.value;
        },
        toJSON: function () {
            return this.name;
        }
    };
    enumeration.values = [];
    for (var _name in namesToValues) {
        var e = inherit(proto);
        e.name = _name;
        e.value = namesToValues[_name];
        enumeration[_name] = e;
        enumeration.values.push(e);
    }
    enumeration.foreach = function (f, c) {
        for (var i = 0; i < this.values.length; i++) {
            f.call(c, this.values[i]);
        }
    };
    return enumeration;
};
module.exports = Enum;