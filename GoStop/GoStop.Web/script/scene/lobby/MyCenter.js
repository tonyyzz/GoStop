var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var PlayerInfo = require('PlayerInfo');
var Global = require('Global');
var Mod_Level = require("Mod_Level");

cc.Class({
    extends: cc.Component,

    properties: {
        lab_Name: cc.Label,
        lab_Gold: cc.Label,
        lab_Level: cc.Label,
        lab_Praise: cc.Label,       //被点赞数
        lab_TotalWin: cc.Label,     //总共赢的筹码数
        lab_BiggestWin: cc.Label,   //单次最高中奖数值
        lab_SpinsWon: cc.Label,     //总共中奖次数
        lab_TotalSpins: cc.Label,   //总共spin次数
        expBar: cc.ProgressBar,

        headIcon: cc.Sprite,    //个人中心头像
        editHeadIcon: cc.Sprite,    //编辑个人信息界面头像

        giftItemParent: cc.Node,
        myGetGiftItem: cc.Prefab,   //收到的礼物

        editProfileUI: cc.Node,     //修改个人信息界面
        localHeadListUI: cc.Node,   //选择本地头像界面
        userNameEB: cc.EditBox,     //修改名称输入框
    },

    // use this for initialization
    onLoad: function () {
        // this.node.active = false;
        this.registerMsg();
        this.headType = 0;
        this.localHeadList = this.localHeadListUI.getChildByName('Layout').getComponentsInChildren('LocalHeadIcon');
        this.localHeadList.forEach(function (e) {
            e.init(this);
        }, this);
    },

    /**
     * 打开个人中心 
     * LobbyManager调用
     * */
    openMyCenter: function () {
        this.lab_Name.string = PlayerInfo.nickname;
        this.lab_Gold.string = PlayerInfo.gold;
        this.lab_Level.string = PlayerInfo.level;
        this.lab_Praise.string = PlayerInfo.praise;
        this.lab_TotalWin.string = PlayerInfo.totalWin;
        this.lab_BiggestWin.string = PlayerInfo.biggestWin;
        this.lab_SpinsWon.string = PlayerInfo.spinsWon;
        this.lab_TotalSpins.string = PlayerInfo.totalSpins;

        this.headIcon.spriteFrame = Global.headAtlas.getSpriteFrame(PlayerInfo.head);
        var expMax = Mod_Level.GetModData(PlayerInfo.level);
        if (PlayerInfo.exp > 0)
            this.expBar.progress = PlayerInfo.exp / Number(expMax[0].exp);
        else
            this.expBar.progress = 0;

        this.giftItemParent.removeAllChildren();
        for (var i = 0; i < PlayerInfo.giftArr.length; i++) {
            var gift = cc.instantiate(this.myGetGiftItem);
            this.giftItemParent.addChild(gift);
            var giftIcon = gift.getChildByName('GiftIcon').getComponent(cc.Sprite);
            giftIcon.spriteFrame = Global.giftAtlas.getSpriteFrame(PlayerInfo.giftArr[i].giftType);
            var playerIcon = gift.getChildByName('PlayerIcon').getComponent(cc.Sprite);
            if (PlayerInfo.giftArr[i].headType === 0)
                playerIcon.spriteFrame = Global.headAtlas.getSpriteFrame(PlayerInfo.giftArr[i].head);
            cc.find('PlayerIcon/Name', gift).getComponent(cc.Label).string = PlayerInfo.giftArr[i].giver;
        }
        this.node.active = true;
    },
    alterHeadIcon: function (name) {
        this.editHeadIcon.spriteFrame = Global.headAtlas.getSpriteFrame(name);
        this.localHeadListUI.active = false;
        this.headName = name;
    },
    // 提交修改信息
    btn_submitAlterInfo: function () {
        this.sendAlterInfo();
    },

    btn_openEditProfileUI: function () {
        this.editProfileUI.active = true;
        this.headName = null;
        this.userNameEB.string = "";
        if (PlayerInfo.headType === 0)
            this.editHeadIcon.spriteFrame = Global.headAtlas.getSpriteFrame(PlayerInfo.head);
    },
    btn_closeEditProfileUI: function () {
        this.editProfileUI.active = false;
    },
    btn_openLocalHeadListUI: function () {
        this.localHeadListUI.active = true;
    },
    btn_closeLocalHeadListUI: function () {
        this.localHeadListUI.active = false;
    },
    btn_Close: function () {
        this.node.active = false;
    },
    // 请求服务器修改头像或者名称消息
    sendAlterInfo: function () {
        if (this.headName) {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateHeadimg);
            p.writeInt(this.headType);      //头像类型
            p.writeString(this.headName);    //头像名称
            NetworkLobby.send(p);
        }
        if (this.userNameEB.string !== "") {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateName);
            p.writeString(this.userNameEB.string);
            NetworkLobby.send(p);
        }
    },
    onHanderAlterHead: function () { },
    onHanderAlterHeadRet: function (self, pack) {
        var isSucceed = pack.readByte();
        if (isSucceed === 1) {
            self.editProfileUI.active = false;
            PlayerInfo.head = self.headName;
            self.headIcon.spriteFrame = Global.headAtlas.getSpriteFrame(PlayerInfo.head);
        }
    },
    onHanderAlterName: function () { },
    onHanderAlterNameRet: function (self, pack) {
        var isSucceed = pack.readByte();
        if (isSucceed === 1) {
            self.editProfileUI.active = false;
            PlayerInfo.nickname = self.userNameEB.string;
            self.lab_Name.string = PlayerInfo.nickname;
        }
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateHeadimg, this.onHanderAlterHead, this);//修改头像
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateHeadimg_ret, this.onHanderAlterHeadRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateName, this.onHanderAlterName, this);//修改昵称
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateName_ret, this.onHanderAlterNameRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateHeadimg, this.onHanderAlterHead, this);//修改头像
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateHeadimg_ret, this.onHanderAlterHeadRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateName, this.onHanderAlterName, this);//修改昵称
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_updateName_ret, this.onHanderAlterNameRet, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
