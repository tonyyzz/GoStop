var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require('Global');
var PlayerInfo = require('PlayerInfo');
var AudioManager = require('AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {
        playersNode: [cc.Node],
        playerMenu: cc.Node,
        viewBtn: cc.Button,
        praiseBtn: cc.Button,
        addBtn: cc.Button,
        giftBtn: cc.Button,
        inviteBtn: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.playersSub = null;
        this.playerMenu.active = false;
        this.playerInfoUI = cc.find('Canvas/PlayerInfoUI').getComponent('PlayerInfoUI');
        this.playerInfoUI.init();
        this.inviteFriendsUI = cc.find('Canvas/InviteFriendsUI').getComponent('InviteFriendsUI');
        this.inviteFriendsUI.initInvite();
        this.myInfo = cc.find('Self/Icon',this.node.parent);    //查看自己信息点击节点
        this.registerMsg();
        this.players = new Array();
        for (var i = 0; i < this.playersNode.length; i++) {
            var obj = new Object();
            obj.player = this.playersNode[i];
            obj.headSpr = this.playersNode[i].getChildByName('Head').getComponent(cc.Sprite);
            obj.nameLab = this.playersNode[i].getChildByName('Name').getComponent(cc.Label);
            obj.bigWinAnim = this.playersNode[i].getChildByName('PlayerBigWinAnim');
            obj.bigWinAnim.active = false;
            obj.pid = null;
            obj.headSpr.node.active = false;
            obj.nameLab.node.active = false;
            this.players.push(obj);
        }
        this.playersNode[0].on(cc.Node.EventType.TOUCH_END, function (event) {
            this.showPlayerMenu(0);
        }, this);
        this.playersNode[1].on(cc.Node.EventType.TOUCH_END, function (event) {
            this.showPlayerMenu(1);
        }, this);
        this.playersNode[2].on(cc.Node.EventType.TOUCH_END, function (event) {
            this.showPlayerMenu(2);
        }, this);
        this.playersNode[3].on(cc.Node.EventType.TOUCH_END, function (event) {
            this.showPlayerMenu(3);
        }, this);
        this.viewBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.closePlayerMenu();
            this.playerInfoUI.openPlayerInfoUI(this.playerInfoMsg);
        }, this);
        this.praiseBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.closePlayerMenu();
            this.givePraise(this.players[this.playersSub].pid);
        }, this);
        this.addBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.closePlayerMenu();
            this.playerInfoUI.openfriendDisposeUI(this.players[this.playersSub].pid);
        }, this);
        this.giftBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.closePlayerMenu();
            this.playerInfoUI.openGiftStore(this.players[this.playersSub].pid);
        }, this);
        this.inviteBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.inviteFriendsUI.openInviteFriendsUI();
        }, this);
        this.myInfo.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.closePlayerMenu();
            this.getAccountInfo(PlayerInfo.id);
            AudioManager.playAudio('click');
        }, this);
    },
    showPlayerMenu: function (sub) {
        if (!this.players[sub].pid) {
            this.closePlayerMenu();
            return;
        }
        if (this.playersSub === sub && this.playerMenu.active) {
            this.closePlayerMenu();
            AudioManager.playAudio('click');
            return;
        }
        if (this.playersSub === sub) {
            this.playerMenu.active = true;
            return;
        }
        this.playersSub = sub;
        this.getAccountInfo(this.players[this.playersSub].pid);
        AudioManager.playAudio('click');
    },
    closePlayerMenu: function () {
        if (this.playerMenu.active)
            this.playerMenu.active = false;
    },
    showMenu: function (isShow, player) {
        this.playerInfoMsg = player;
        this.playerMenu.active = true;
        this.playerMenu.setPosition(cc.v2(this.playersNode[this.playersSub].x, this.playerMenu.y))
        this.addBtn.node.active = isShow;
    },
    // 一次只能传单个玩家数据
    playerJoin: function (player) {
        for (var i = 0; i < this.players.length; i++) {
            if (!this.players[i].pid) {   //当该位置不存在玩家时，加入新玩家
                this.players[i].pid = player.pid;
                this.players[i].headSpr.node.active = true;
                this.players[i].nameLab.node.active = true;
                if (player.headType === 0)
                    this.players[i].spriteFrame = Global.headAtlas.getSpriteFrame(player.head);
                this.players[i].nameLab.string = player.name;
                break;
            }
        }
    },
    playerExit: function (pid) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid === pid) {
                this.players[i].pid = null;
                this.players[i].headSpr.node.active = false;
                this.players[i].nameLab.node.active = false;
                this.players[i].bigWinAnim.active = false;
            }
        }
    },
    // 玩家中大奖播放头像特效
    playBigWinEffect: function (pid) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid === pid)
                this.players[i].bigWinAnim.active = true;
        }
        this.scheduleOnce(function () {
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].pid === pid)
                    this.players[i].bigWinAnim.active = false;
            }
        }, 3)
    },
    // 获取玩家信息
    getAccountInfo: function (pid) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info);
        p.writeInt(pid);
        NetworkLobby.send(p);
    },
    onHanderAccountInfo: function () { },
    onHanderAccountInfoRet: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.name = pack.readString();
        obj.level = pack.readInt();
        obj.praise = pack.readInt();
        obj.exp = pack.readInt();
        obj.headType = pack.readInt();
        obj.head = pack.readString();
        obj.gold = pack.readInt();
        obj.totalWin = pack.readInt();
        obj.biggestWin = pack.readInt();
        obj.spinsWon = pack.readInt();
        obj.totalSpins = pack.readInt();
        obj.playerType = pack.readInt();    //查看的玩家类型，-1：自己；0：陌生人；1：好友
        obj.giftArr = new Array();
        var length = pack.readInt();
        for (var i = 0; i < length; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.giver = pack.readString();    //赠送人
            o.headType = pack.readInt();
            o.head = pack.readString();
            o.giftType = pack.readInt();
            obj.giftArr.push(o);
        }
        if (obj.playerType === -1) {
            self.playerInfoUI.openPlayerInfoUI(obj);
        } else if (obj.playerType === 0)
            self.showMenu(true, obj);
        else if (obj.playerType === 1)
            self.showMenu(false, obj);
        obj = null;
    },
    givePraise: function (pid) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_zan);
        p.writeInt(pid);
        NetworkLobby.send(p);
    },
    onHanderPraise: function () { },
    onHanderPraiseRet: function (self, pack) {
        cc.log('点赞成功：', pack.readInt());
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info, this.onHanderAccountInfo, this);//查看用户基础信息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info_ret, this.onHanderAccountInfoRet, this);//查看用户基础信息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_zan, this.onHanderPraise, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_zan_ret, this.onHanderPraiseRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info, this.onHanderAccountInfo, this);//查看用户基础信息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info_ret, this.onHanderAccountInfoRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_zan, this.onHanderPraise, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_zan_ret, this.onHanderPraiseRet, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
