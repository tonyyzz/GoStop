var MessageManager = require("MessageManager");
var Tips = require("Tips");
var net = require("mySocket");

var NetworkGame = cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    statics: {
        instance: null,
        // 声明静态方法
        connectServer: function (ip, port) {
            if (NetworkGame.instance != null)
                NetworkGame.instance.connect("game", ip, port);
        },
        send: function (msg) {
            if (NetworkGame.instance != null)
                NetworkGame.instance.sendMsg(msg);
        },
        closeNet: function () {
            if (NetworkGame.instance != null)
                NetworkGame.instance.closenet();
        },
        ///获取消息队列
        getMsgList: function () {
            if (NetworkGame.instance != null) {
                return NetworkGame.instance.client.msgList;
            }
            else
                return new Array();
        },
        ///抛出错误消息
        handErrormsg:function(msg) {
            if (NetworkGame.instance != null) {
                return NetworkGame.instance.handleMessage(msg);
            }
            
        },
        //关闭SOCKET
        close: function () {
            NetworkGame.instance.client.close();
        },
        getWs: function () {
            return net.ws;
        },
    },
    
    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        NetworkGame.instance = this;
        this.client = new net();
        
    },
    //发送消息
    sendMsg: function (msg) {
        // this.handleMessage(msg) //测试，直接返回消息
        this.client.send(msg);
    },
    ///连接服务器
    connect: function (type, ip, port) {
        this.client.connect(type, ip, port);
    },
    //关闭网络
    closenet: function () {
        this.client.close();
    },
    //消息处理
    handleMessage: function (msg) {
        // if (msg.s != undefined && msg.s > 0) {///错误
        //     if (Mod_ErrorCode.CheckPassError(msg.s) == false) {
        //         var error = Mod_ErrorCode.GetModData(msg.s);
        //         if (error == null || error == undefined) {
        //             Tips.showTips("未配置的错误代码：" + msg.s);
        //         } else {
        //             cc.log(error);
        //             Tips.showTips(error);
        //         }
        //         return;
        //     }
        // }
        if (msg.t == undefined) {
            //cc.log("handleMessage error!msg.id==undefined");
            Tips.showTips("错误的消息包");
            return;
        }

        var callbackList = MessageManager.getMsgCallback(msg.t);
        if (callbackList != undefined && callbackList.length > 0) {
            for (var i = 0; i < callbackList.length; i++) {
                var callbackObj = callbackList[i];
                callbackObj.callback(callbackObj.target, msg);
            }
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
