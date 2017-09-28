var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var NetworkGame = require("NetworkGame");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require('Global');
var PlayerInfo = require('PlayerInfo');

cc.Class({
    extends: cc.Component,

    properties: {
        titleLevelUp: cc.Node,
        titleDalily: cc.Node,

        loginAwardClearing: cc.Node,    //结算界面
        dailyLab: cc.Label,
        loginLab: cc.Label,
        friendLab: cc.Label,
        totalLab: cc.Label,
    },

    /**
     * 转盘指定位置角度公式：角度 = (10 - this.bonusList下标 - 1) * (360/12) + 15
     */
    initDialAwardUI: function () {
        this.node.active = true;
        this.registerMsg();
        this.dialNode = cc.find('Dial/Dial', this.node);
        this.closeNode =  this.node.getChildByName('CloseButton');
        this.bonusList = this.dialNode.getComponentsInChildren(cc.Label); //奖金列表
        this.levelCallback = null

        this.runTime = 7;   //转动时间
        this.isRunning = false; //是否在转动中
        this.node.active = false;
    },
    openLevelAwardUI: function (callback) {
        this.closeNode.active = false;
        this.titleLevelUp.active = true;
        this.titleDalily.active = false;
        this.awardType = 'level';
        //请求升级奖励列表
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_lotteryList);
        NetworkGame.send(p);
        this.levelCallback = callback;
    },
    openLoginAwardUI: function (playerGold) {
        this.closeNode.active = true;
        this.titleLevelUp.active = false;
        this.titleDalily.active = true;
        this.playerGold = playerGold;
        this.awardType = 'login';
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_awardList);
        NetworkLobby.send(p);
    },
    btn_runDial: function () {
        if (this.isRunning) return;

        var p = new Package();
        if (this.awardType === 'level') {
            p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_upgrade_lottery);
            NetworkGame.send(p);
        } else if (this.awardType === 'login') {
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_award);
            NetworkLobby.send(p);
        }

    },
    btn_closeLoginAward: function () {
        this.loginAwardClearing.active = false;
        this.node.active = false;
    },
    btn_close: function () {
        if (this.isRunning) return;

        this.node.active = false;
    },
    runDial: function (gold) {
        var sub = 0;
        for (var i = 0; i < this.bonusList.length; i++) {
            if (gold === Number(this.bonusList[i].string)) {
                this.angle = (10 - i - 1) * 30 + 15;
                sub = i;
            }
        }
        var rotate = cc.rotateTo(this.runTime, this.angle + 360 * 8);
        this.dialNode.runAction(rotate).easing(cc.easeQuinticActionInOut());
        this.scheduleOnce(function () {
            var s1 = cc.scaleTo(0.3, 1.1);
            var s2 = cc.scaleTo(0.3, 0.9);
            var rep = cc.repeatForever(cc.sequence(s1, s2));
            this.bonusList[sub].node.runAction(rep);
            this.scheduleOnce(function () {
                this.bonusList[sub].node.stopAction(rep);
                if (this.awardType === 'level') {
                    this.node.active = false;
                    this.levelCallback.levelAwardOver();
                } else if (this.awardType === 'login') {
                    this.loginAwardClearing.active = true;
                    PlayerInfo.gold += this.loginAwardGold;
                    this.playerGold.string = PlayerInfo.gold;
                }
                this.isRunning = false;
            }, 2);
        }, this.runTime + 0.3);
    },
    // 升级抽奖
    onHanderUpgradeLottery: function () { },
    onHanderUpgradeLotteryRet: function (self, pack) {
        self.isRunning = true;
        self.runDial(pack.readInt());
    },
    onHanderLotteryList: function () { },
    onHanderLotteryListRet: function (self, pack) {
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            self.bonusList[i].string = "         " + pack.readInt();
        }
        self.node.active = true;
    },
    // 登录抽奖
    onHanderLoginAward: function () { },
    onHanderLoginAwardRet: function (self, pack) {
        var obj = new Object();
        obj.base = pack.readInt();  //基础金额
        obj.login = pack.readInt(); //连续登录加成
        obj.friend = pack.readInt();//好友加成
        self.loginAwardGold = obj.base + obj.login + obj.friend;
        self.dailyLab.string = 'Daily Spin:' + obj.base;
        self.loginLab.string = 'Retun Bonus:' + obj.login;
        self.friendLab.string = 'Rriend Bonus:' + obj.friend;
        self.totalLab.string = 'Total Won:\n' + self.loginAwardGold;
        self.runDial(obj.base)
    },
    onHanderLoginAwardList: function () { },
    onHanderLoginAwardListRet: function (self, pack) {
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            self.bonusList[i].string = "         " + pack.readInt();
        }
        self.node.active = true;
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_upgrade_lottery, this.onHanderUpgradeLottery, this);    //升级抽奖
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_upgrade_lottery_ret, this.onHanderUpgradeLotteryRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_lotteryList, this.onHanderLotteryList, this);    //升级抽奖列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_lotteryList_ret, this.onHanderLotteryListRet, this);    //升级抽奖列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_award, this.onHanderLoginAward, this);    //登录抽奖
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_award_ret, this.onHanderLoginAwardRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_awardList, this.onHanderLoginAwardList, this);    //每日登陆抽奖转盘列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_awardList_ret, this.onHanderLoginAwardListRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_upgrade_lottery, this.onHanderUpgradeLottery, this);    //升级抽奖
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_upgrade_lottery_ret, this.onHanderUpgradeLotteryRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_lotteryList, this.onHanderLotteryList, this);    //升级抽奖列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_lotteryList_ret, this.onHanderLotteryListRet, this);    //升级抽奖列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_award, this.onHanderLoginAward, this);    //登录抽奖
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_award_ret, this.onHanderLoginAwardRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_awardList, this.onHanderLoginAwardList, this);    //每日登陆抽奖转盘列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_awardList_ret, this.onHanderLoginAwardListRet, this);
    },
    // update: function (dt) {

    // },
});
