var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');

cc.Class({
    extends: cc.Component,

    properties: {
        inputEB: cc.EditBox,
        scrollView: cc.ScrollView,
        svContent: cc.Node,
        chatItem: cc.Prefab,
        slat: cc.Node,


    },

    // use this for initialization
    onLoad: function () {
        this.slotsManager = cc.find("SlotsManager").getComponent("SlotsManager");
        this.chatArr = new Array();
        this.registerMsg();
    },
    setChat: function (chatMsg, addFrined) {
        var chat = cc.instantiate(this.chatItem);
        this.svContent.addChild(chat);
        var name = chat.getChildByName('Name').getComponent(cc.Label);
        var content = chat.getChildByName('Content').getComponent(cc.Label);
        if (chatMsg) {
            name.string = chatMsg.name + ':';
            content.string = chatMsg.chat;
        } else {
            // Xiao Ming wants to be a friend of xiao hua
            name.string = 'Notice:';
            content.string = addFrined.inviter + ' wants to be a friend of ' + addFrined.invitee + '.';
        }

        if (this.chatArr.length >= 30) {
            this.svContent.removeChild(this.chatArr[0]);
            this.chatArr.shift();
        }
        this.chatArr.push(chat);
        this.scrollView.scrollToBottom(0.1);
    },
    // 输入开始回调
    onInputBegan: function () {
        this.inputEB.string = '';
        this.slat.active = false;
        this.scrollView.node.active = false;

    },
    onInputEnd: function () {

    },
    // 输入回车回调
    onInputEnter: function () {
        // this.slotsManager.sendChatMsg(this.inputEB.string);
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_chat);
        p.writeString(this.inputEB.string);
        NetworkGame.send(p);
        this.slat.active = true;
        this.scrollView.node.active = true;
        this.inputEB.string = '';
    },
    onHanderChat: function () { },
    onHanderChatNotice: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.chat = pack.readString();
        self.setChat(obj, null)
    },
    onHanderFriendNotice: function (self, pack) {
        var obj = new Object();
        obj.inviter = pack.readString();
        obj.invitee = pack.readString();
        self.setChat(null, obj);
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_chat, this.onHanderChat, this);   //聊天
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_chat_notice, this.onHanderChatNotice, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agreeFriend_notice, this.onHanderFriendNotice, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_chat, this.onHanderChat, this);   //聊天
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_chat_notice, this.onHanderChatNotice, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agreeFriend_notice, this.onHanderFriendNotice, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
