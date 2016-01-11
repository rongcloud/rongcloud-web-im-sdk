var TinyStream = require('../binary');
var Message = require('./Message');
var eneity = require('./MessageEntity');

function output(_out) {
    var out = TinyStream.parse(_out);
    this.writeMessage = function (msg) {
        if (msg instanceof Message.Message) {
            msg.write(out)
        }
    }
}
//converted input stream to message object ,that was server send to client，把服务器返回的二进制流生成具体的消息对象
function input(In, isPolling) {
    var flags, header, msg = null;
    if (!isPolling) {
        var _in = TinyStream.parse(In);
        flags = _in.readByte();
    } else {
        flags = In["headerCode"];
    }
    header = new Message.Header(flags);
    this.readMessage = function () {
        switch (+header.getType()) {
            case 2:
                msg = new eneity.ConnAckMessage(header);
                break;
            case 3:
                msg = new eneity.PublishMessage(header);
                break;
            case 4:
                msg = new eneity.PubAckMessage(header);
                break;
            case 5:
                msg = new eneity.QueryMessage(header);
                break;
            case 6:
                msg = new eneity.QueryAckMessage(header);
                break;
            case 7:
                msg = new eneity.QueryConMessage(header);
                break;
            case 9:
            case 11:
            case 13:
                msg = new eneity.PingRespMessage(header);
                break;
            case 1:
                msg = new eneity.ConnectMessage(header);
                break;
            case 8:
            case 10:
            case 12:
                msg = new eneity.PingReqMessage(header);
                break;
            case 14:
                msg = new eneity.DisconnectMessage(header);
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
module.exports = {
    MessageOutputStream: output,
    MessageInputStream: input
};