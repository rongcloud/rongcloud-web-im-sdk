//create enum object 枚举对象，详情可参考API文档
var _enum = {
    'MessageTag': {
        'ISPERSISTED': 'ISPERSISTED',
        'ISCOUNTED': 'ISCOUNTED',
        'NONE': 'NONE',
        'ISDISPLAYED': "ISDISPLAYED"
    },
    'ConversationNotificationStatus': ['DO_NOT_DISTURB', 'NOTIFY'],
    'ConversationType': ['CHATROOM', 'CUSTOMER_SERVICE', 'DISCUSSION', 'GROUP', 'PRIVATE', 'SYSTEM'],
    'SentStatus': ['DESTROYED', 'FAILED', 'READ', 'RECEIVED', 'SENDING', 'SENT'],
    'DiscussionInviteStatus': ['CLOSED', 'OPENED'],
    'MediaType': ['AUDIO', 'FILE', 'IMAGE', 'VIDEO'],
    'MessageDirection': ['RECEIVE', 'SEND'],
    'MessageType': ['DiscussionNotificationMessage', 'TextMessage', 'ImageMessage', 'VoiceMessage', 'RichContentMessage', 'HandshakeMessage', 'UnknownMessage', 'SuspendMessage', 'LocationMessage', 'InformationNotificationMessage', 'ContactNotificationMessage', 'ProfileNotificationMessage', 'CommandNotificationMessage'],
    'SendErrorStatus': {
        'REJECTED_BY_BLACKLIST': 405,
        'NOT_IN_DISCUSSION': 21406,
        'NOT_IN_GROUP': 22406,
        'NOT_IN_CHATROOM': 23406
    },
    'BlacklistStatus': ['EXIT_BLACK_LIST', 'NOT_EXIT_BLACK_LIST'],
    'ConnectionStatus': ['CONNECTED', 'CONNECTING', 'RECONNECT', 'OTHER_DEVICE_LOGIN', 'CLOSURE', 'UNKNOWN_ERROR', 'LOGOUT', 'BLOCK']
};
//生产枚举对象
io.util.each(_enum, function (_name, option) {
    var val = {};
    if (io.util.isArray(option)) {
        io.util.forEach(option, function (x, i) {
            val[x] = i;
        })
    } else {
        val = option;
    }
    RongIMClient[_name] = RongIMEnum(val);
});
RongIMClient.ConnectErrorStatus = ConnectionState;
//回调基类
RongIMClient.callback = function (d, a) {
    this.onError = a;
    this.onSuccess = d
};
//回调错误枚举值
RongIMClient.callback.ErrorCode = RongIMEnum({
    TIMEOUT: -1,
    UNKNOWN_ERROR: -2
});