/**
 * Created by zhangyatao on 16/1/7.
 */
module.exports = {
    mapping: {
        "1": 4,
        "2": 2,
        "3": 3,
        "4": 0,
        "5": 1,
        "6": 5
    },
    //objectname映射
    typeMapping: {
        "RC:TxtMsg": "TextMessage",
        "RC:ImgMsg": "ImageMessage",
        "RC:VcMsg": "VoiceMessage",
        "RC:ImgTextMsg": "RichContentMessage",
        "RC:LBSMsg": "LocationMessage"
    },
    //通知类型映射
    sysNtf: {
        "RC:InfoNtf": "InformationNotificationMessage",
        "RC:ContactNtf": "ContactNotificationMessage",
        "RC:ProfileNtf": "ProfileNotificationMessage",
        "RC:CmdNtf": "CommandNotificationMessage",
        "RC:DizNtf": "DiscussionNotificationMessage"
    },
    //消息监听器
    _ReceiveMessageListener: null,
    //连接状态监听器
    _ConnectionStatusListener: null,
    registerMessageTypeMapping: {},
    userInfoMapping: {},
    topic: ["invtDiz", "crDiz", "qnUrl", "userInf", "dizInf", "userInf", "joinGrp", "quitDiz", "exitGrp", "evctDiz", ["chatMsg", "pcMsgP", "pdMsgP", "pgMsgP", "ppMsgP"], "pdOpen", "rename", "uGcmpr", "qnTkn", 'destroyChrm', 'createChrm', 'exitChrm', 'queryChrm', 'joinChrm', "pGrps", "addBlack", "rmBlack", "getBlack", "blackStat", "addRelation", 'qryRelation', 'delRelation'],
    globalConf: {
        WEB_SOCKET_FORCE_FLASH: null,
        WEB_XHR_POLLING: null,
        FORCE_LOCAL_STORAGE: null
    },
    Endpoint:{},
    userId:'',
    reconnectSet:{

    },
    chatroomId:''
};