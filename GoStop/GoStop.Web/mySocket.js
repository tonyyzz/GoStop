///网络类
var CryptoJS = require("crypto-js");//加密解密库
var EnumType = require("EnumType");
var Global = require("Global");
var Tips = require("Tips");
var MessageManager = require("MessageManager");
//var ByteBuffer = require('byte');
var Package = require('Package');
//var Mod_ErrorCode = require("Mod_ErrorCode");

var u8array = {

    stringify: function (wordArray) {
        var words = wordArray.words;
        var sigBytes = wordArray.sigBytes;
        var u8 = new Uint8Array(sigBytes);
        for (var i = 0; i < sigBytes; i++) {
            u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return u8;
    },

    parse: function (u8arr) {
        var len = u8arr.length;
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
        }

        return CryptoJS.lib.WordArray.create(words, len);
    }
};

var mySocket = cc.Class({
    name: 'mySocket',
    properties: {
        msgList: [],
        isGetPing: false,
    },
    ctor() {
        this.msgList = new Array();
        this.type = "";
        // cc.log("mySocket msglist:" + this.msgList);
        //var	ProtoBuf11 = protoBuf.ProtoBuf;
        //console.log("=======1111  "+protoBuf);
        //var obj = new Object();
        //obj.name ="wangm";
        //obj.sex=1;
        //var str = JSON.stringify(obj);//JSON.parse

    },

    connect(type, ip, port) {
        this.type = type;

        var keySalt = CryptoJS.enc.Utf8.parse("5p)O[NB]6,YF}+ef");
        var ivSalt = CryptoJS.enc.Utf8.parse("L+#f4,Ir)b$=pkfl");

        var seek = Global.randomSeed(20);
        let aes = CryptoJS.enc.Utf8.parse(seek);
        this.key = CryptoJS.MD5(keySalt);
        this.iv = CryptoJS.MD5(ivSalt);
        keySalt = null;
        ivSalt = null;

        // cc.log("key:"+this.key.toString(u8array));
        // cc.log("iv:"+this.iv.toString(u8array));  

        //this.key = "";
        //this.iv = "";
        var cur = this;
        this.ws = new WebSocket("ws://" + ip + ":" + port + "");
        this.ws.binaryType = "arraybuffer";
        cc.log(type, "connect......");
        this.ws.onopen = function (event) {
            //cc.log('连接服务器成功');
            var pack = new Package();
            if (type === 'lobby')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby);
            else if (type === 'game')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game);
            else
                cc.log('错误的网络连接类型：', type);
            cur.handleMessage(pack);

            pack = null;
            //cur.handleMessage(obj);
            // cur.msgList.push(obj);
            // console.log("Send Text WS was opened.");
        };
        this.ws.onmessage = function (event) {
            var pack = new Package();
            pack.InitFromNet(event.data);
            cur.handleMessage(pack);

            pack = null;
            //var buffer_tmp=ByteBuffer.wrap(event.data,0,event.data.byteLength);
            //cc.log(buffer_tmp); 
            //    解密
            /*var packet = cur.decrypt(new Uint8Array(event.data));
            var obj = JSON.parse(packet);
            if (!cc.sys.isMobile) {
                if (obj.t !== 59) 
                    cc.log(type, " onmessage:", packet);     //发web版本的时候关闭log接收数据消息
            }
            

            //收到网络消息重置断线判定累积
            if(type == 'lobby'){
                Global.notGetLobbyPongIndex = 0;
            }else if(type == 'game'){
                Global.notGetGamePongIndex = 0;
            }*/
            // cur.msgList.push(obj);
        };

        this.ws.onerror = function (event) {
            cc.log(type, '服务器连接错误');
            var pack = new Package();
            if (type === 'lobby')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby_error);
            else if (type === 'game')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_error);

            if (cur.ws != null) { pack.writeString(cur.ws.url); }
            cur.handleMessage(pack);

            cur.ws = null;
            console.log("Send Text fired an error" + event.data);
        };

        this.ws.onclose = function (event) {
            cc.log(type, '服务器关闭');
            var pack = new Package();
            if (type === 'lobby')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby_close);
            else if (type === 'game')
                pack.Init(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_close);
            // if (cur.ws != null) { pack.writeString(cur.ws.url.toString()); }
            cur.handleMessage(pack);

            cur.ws = null;
            // cur.msgList.push(obj)
            console.log(type, "WebSocket instance closed.");
        };
    },
    send(pack) {
        if (!cc.sys.isMobile && Global.isLogNet)
            cc.log('发送消息：', pack);
        //加密
        //cc.log("this.ws.readyState = " + this.ws.readyState);
        if (this.ws == null) {
            // Tips.showTips("网络连接失败");
            // cc.log("网络连接失败");
            return;
        }


        if (this.ws.readyState != 1) {
            // Tips.showTips("网络异常断开");
            // cc.log("网络异常断开");
            return;

        }

        ///
        var bytes = pack.getbytes();
        var len = pack.getbytesLen();
        //var buffer_tmp=ByteBuffer.wrap(bytes,0,len);
        //var buffer_tmp = bytes.slice(0,len);
        var buffer_tmp = new Uint8Array(bytes, 0, len);
        ///AES加密  
        /*var ue = u8array.parse(buffer_tmp._bytes);
        var enc = this.encrypt(ue);
        */

        ///自定义加密
        var enc = buffer_tmp;
        for (var i = 0; i < len; i++)
            enc[i] ^= 0xa7;
        var result = new DataView(new ArrayBuffer(4 + enc.byteLength));
        result.setInt32(0, len, true);

        for (var i = 0; i < enc.byteLength; i++) {
            result.setUint8(i + 4, enc[i], true);
        }
        this.ws.send(result.buffer);
        result = null;
        buffer_tmp = null;

    },
    close() {
        if (this.ws != null)
            this.ws.close();
    },
    encrypt: function (buff) {
        var e = CryptoJS.AES.encrypt(buff, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return e.ciphertext.toString(u8array);
    },

    decrypt: function (arrayBuffer) {
        var d = CryptoJS.AES.decrypt({ ciphertext: u8array.parse(arrayBuffer) }, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return d.toString(CryptoJS.enc.Utf8);
    },
    ///接收到返回的消息，消息处理
    handleMessage: function (pack) {
        if (pack.mainID == undefined) {
            //cc.log("handleMessage error!msg.id==undefined");
            Tips.showTips("错误的消息包");
            return;
        }
        if (!cc.sys.isMobile && Global.isLogNet)
            if (pack.secondID !== 320)
                cc.log('收到消息：', pack);
        // if (msg.s != undefined && msg.s > 0 ) {///错误

        //     if (Mod_ErrorCode.CheckPassError(msg.t) == false) {
        //         var error = Mod_ErrorCode.GetModData(msg.s);
        //         if (error == null || error == undefined) {
        //             Tips.showTips("未配置的错误代码：" + msg.s);
        //         } else {
        //             // cc.log(error);
        //             Tips.showTips(error);
        //         }
        //         return;
        //     }

        // }
        // if (this.type == "game") {
        //     if (msg.t < 1000)
        //         tid = msg.t + 10000;
        // }
        var callbackList = MessageManager.getMsgCallback(pack.mainID, pack.secondID);
        if (callbackList != undefined && callbackList.length > 0) {
            for (var i = 0; i < callbackList.length; i++) {
                var callbackObj = callbackList[i];
                callbackObj.callback(callbackObj.target, pack);
                callbackObj = null;
            }
        }
        callbackList = null;
    },
    stringToBytes(str) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);  // get char   
            st = [];                 // set up "stack"  
            do {
                st.push(ch & 0xFF);  // push byte to stack  
                ch = ch >> 8;          // shift value down by 1 byte  
            }
            while (ch);
            // add stack contents to result  
            // done because chars have "wrong" endianness  
            re = re.concat(st.reverse());
        }
        // return an array of bytes  
        return re;
    },
});
module.exports = mySocket;
