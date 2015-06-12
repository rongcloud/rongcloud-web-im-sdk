/**
 * Created by yataozhang on 15/4/13.
 * 内部存储帮助库
 * 文档地址 https://github.com/rongcloud/demo-web-sdk#web-端本地存储帮助库如何使用
 */
(function (global, rong) {
    var db;

    global.indexedDB = global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB;

    if (!global.indexedDB)
        throw new Error("The browser does not support this function");
    if (!rong)
        throw new Error("Please load RongIMClient.min.js,http://res.websdk.rongcloud.cn/RongIMClient.min.js")

    var DBOpenRequest = global.indexedDB.open('rongcloud', 1);

    DBOpenRequest.onsuccess = function (event) {
        db = event.target.result;
    };

    DBOpenRequest.onupgradeneeded = function (event) {
        var db = event.currentTarget.result;

        db.onerror = function (event) {
            throw new Error(event);
        };

        var objectStore = db.createObjectStore('messageObject', { keyPath: 'messageId' });
        objectStore.createIndex('ConversationType', 'ConversationType', { unique: true });
    };

    function getDB(mode) {
        var transaction = db.transaction(['messageObject'], mode);
        var objectStore = transaction.objectStore('messageObject');
        return {
            transaction: transaction,
            objectStore: objectStore
        }
    }

    function displayData(f) {
        var obj = getDB('readonly'), arr = [];
        obj.objectStore.openCursor(null, "prev").onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                arr.push(cursor.value);
                cursor.continue();
            }
        };
        obj.transaction.oncomplete = function () {
            f(arr);
        }
    }

    function getCount(func) {
        var obj = getDB('readwrite');
        var num = obj.objectStore.count();
        obj.transaction.oncomplete = function () {
            func(num.result);
        };
    }

    function addMessageObject(msg,func) {
        function add() {
            var obj = getDB("readwrite");
            obj.objectStore.put(msg);
            obj.transaction.oncomplete = function () {
                func();
            };
        }

        getCount(function (count) {
            if (count <= 20) {
                add();
            } else {
                deleteResult(null, function (err) {
                    if (!err) {
                        add();
                    }
                });
            }
        })
    }

    function deleteResult(k, f) {
        var obj = getDB('readwrite');
        var request = {};
        obj.objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (k) {
                    if (k && cursor.value.messageId == k) {
                        request = cursor.delete();
                    }
                    cursor.continue();
                } else {
                    request = cursor.delete();
                }
                request.onsuccess = function () {
                    f(null);
                };
                request.onerror = function () {
                    f(new Error("delete fail"));
                }
            }
        };
    }
    rong.indexedDB = {
        getMessageListFromIndexedDB: function (func) {
            displayData(func);
        },
        addMessageToIndexedDB: function (message, func) {
            if(message instanceof RongIMClient.RongIMMessage){
                addMessageObject(JSON.parse(message.toJSONString()), func)
            }
        }, deleteMessageFromIndexedDB: function (messageid, func) {
            deleteResult(messageid, func)
        }, getMessageListCountFromIndexedDB: function (func) {
            getCount(func)
        }
    }
})(window, RongIMClient);