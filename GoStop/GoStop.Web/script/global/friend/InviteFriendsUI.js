var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        friendItem: cc.Prefab,
        scrollViewContent: cc.Node,
    },

    initInvite: function () {
        this.node.active = true;
        this.registerMsg();
        this.firendNodeList = new Array();

        // this.openInviteFriendsUI();
        // this.createFriendNode();
        this.node.active = false;
    },
    openInviteFriendsUI: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list);
        NetworkLobby.send(p);
    },
    createFriendNode: function (friends) {
        // 生成玩家
        for (var i = 0; i < friends.length; i++) {
            var fNode = cc.instantiate(this.friendItem);
            var fScript = fNode.getComponent('InviteFriendItem');
            this.scrollViewContent.addChild(fNode);
            fScript.setInfo(friends[i]);
            this.firendNodeList.push(fScript);
        }
        this.node.active = true;
    },
    btn_close: function () {
        // 先删除旧有元素
        this.scrollViewContent.removeAllChildren();
        this.firendNodeList = new Array();
        this.node.active = false;
    },
    // 邀请在线的好友列表
    onHanderOnlineFirends: function () { },
    onHanderOnlineFirendsRet: function (self, pack) {
        var friends = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.headType = pack.readInt();
            o.head = pack.readString();
            o.isOnline = pack.readByte();
            if (o.isOnline === 1)
                friends.push(o);
        }
        self.createFriendNode(friends);
    },
    // 发送游戏邀请
    btn_sendInvite: function () {
        var pidList = '';
        if (this.firendNodeList.length === 1)
            var pidList = this.firendNodeList[0].pid.toString();
        else {
            for (var i = 0; i < this.firendNodeList.length; i++) {
                if (i === this.firendNodeList.length - 1)
                    pidList += this.firendNodeList[i].pid;
                else
                    pidList += this.firendNodeList[i].pid + "#";
            }
        }
        cc.log('邀请好友：', pidList);
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite);
        p.writeString(pidList);  //好友ID
        p.writeInt(Global.gameID);   //主题ID
        p.writeInt(Global.houseID);   //房间ID
        NetworkLobby.send(p);

    },
    // 通知玩家的邀请消息
    onHanderInviteFirends: function () { },
    onHanderInviteFirendsRet: function (self, pack) {
        // cc.log("是否邀请成功：", pack.readByte());
        self.btn_close();
    },
    onHanderInviteFirendsAccept: function () { },
    onHanderInviteFirendsAcceptRet: function (self, pack) {
        cc.log('邀请返回结果：', pack.readByte());
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list, this.onHanderOnlineFirends, this);//好友列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list_ret, this.onHanderOnlineFirendsRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite, this.onHanderInviteFirends, this);   //玩家邀请在线好友
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite_ret, this.onHanderInviteFirendsRet, this);   //通知玩家的邀请消息
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list, this.onHanderOnlineFirends, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list_ret, this.onHanderOnlineFirendsRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite, this.onHanderInviteFirends, this);   //玩家邀请在线好友
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_invite_ret, this.onHanderInviteFirendsRet, this);   //通知玩家的邀请消息
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
