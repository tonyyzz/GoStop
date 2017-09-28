var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
        tipsLab: cc.Label,
        
    },

    onLoad: function () {
        this.node.setPosition(cc.v2(360, 640));
        cc.game.addPersistRootNode(this.node);//不销毁节点
        this.node.setLocalZOrder(99);
        this.registerMsg();
        this.node.active = false;
    },
    btn_yse: function () {
        this.inviteDispose(1);
    },
    btn_no: function () {
        this.inviteDispose(0);
    },
    btn_close: function () {
        this.node.active = false;
    },
    
    inviteDispose: function (type) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept);
        p.writeInt(type);   //是否接受， 0：拒绝；1：接受
        p.writeInt(this.inviteMsg.pid);
        p.writeInt(this.inviteMsg.gameID);
        p.writeInt(this.inviteMsg.houseID);
        NetworkLobby.send(p);
    },
    onHanderInviteNotice: function (self, pack) {
        self.inviteMsg = new Object();
        self.inviteMsg.pid = pack.readInt();
        self.inviteMsg.name = pack.readString();
        self.inviteMsg.gameID = pack.readInt();
        self.inviteMsg.houseID = pack.readInt();
        self.tipsLab.string = self.inviteMsg.name + ' invite the game.'
        self.node.active = true;
    },
    onHanderAccept: function () { },
    onHanderAcceptRet: function (self, pack) {
        var isAccept = pack.readByte();
        cc.log('好友邀请处理结果：', isAccept);
        if (isAccept === 1) {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter);
            p.writeInt(self.inviteMsg.gameID);
            NetworkLobby.send(p);
            Global.gameID = self.inviteMsg.gameID;
        }
        self.node.active = false;
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite_notice, this.onHanderInviteNotice, this);//游戏邀请通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept, this.onHanderAccept, this);//好友是否接受邀请
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept_ret, this.onHanderAcceptRet, this);

    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite_notice, this.onHanderInviteNotice, this);//游戏邀请通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept, this.onHanderAccept, this);//好友是否接受邀请
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept_ret, this.onHanderAcceptRet, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
