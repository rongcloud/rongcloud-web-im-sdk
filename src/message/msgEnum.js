var myEnum = require('../enum');
var Qos = myEnum({AT_MOST_ONCE: 0, AT_LEAST_ONCE: 1, EXACTLY_ONCE: 2, DEFAULT: 3}),
    Type = myEnum({
        CONNECT: 1,
        CONNACK: 2,
        PUBLISH: 3,
        PUBACK: 4,
        QUERY: 5,
        QUERYACK: 6,
        QUERYCON: 7,
        SUBSCRIBE: 8,
        SUBACK: 9,
        UNSUBSCRIBE: 10,
        UNSUBACK: 11,
        PINGREQ: 12,
        PINGRESP: 13,
        DISCONNECT: 14
    }),
    DisconnectionStatus = myEnum({
        RECONNECT: 0,
        OTHER_DEVICE_LOGIN: 1,
        CLOSURE: 2,
        UNKNOWN_ERROR: 3,
        LOGOUT: 4,
        BLOCK: 5
    }),
    ConnectionState = myEnum({
        ACCEPTED: 0,
        UNACCEPTABLE_PROTOCOL_VERSION: 1,
        IDENTIFIER_REJECTED: 2,
        SERVER_UNAVAILABLE: 3,
        TOKEN_INCORRECT: 4,
        NOT_AUTHORIZED: 5,
        REDIRECT: 6,
        PACKAGE_ERROR: 7,
        APP_BLOCK_OR_DELETE: 8,
        BLOCK: 9,
        TOKEN_EXPIRE: 10,
        DEVICE_ERROR: 11
    });
module.exports = {
    Qos: Qos,
    Type: Type,
    DisconnectionStatus: DisconnectionStatus,
    ConnectionState: ConnectionState
};
