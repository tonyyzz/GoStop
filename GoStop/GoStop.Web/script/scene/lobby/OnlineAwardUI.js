var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var PlayerInfo = require("PlayerInfo");

cc.Class({
    extends: cc.Component,

    properties: {
        remainingTimeIn: cc.Label,  //当前奖励界面显示剩余时间
        goldLab: cc.Label,
        bg: cc.Node,
        onlineAward: cc.Node,
        awardNode: cc.Node,
    },
    onLoad: function () {
        this.registerMsg();
        this.bg.active = false;
        this.onlineAward.active = false;
    },
    init: function (timeLabel, bonusBtn, playerGold) {
        this.remainingTime = timeLabel;//大厅界面剩余时间
        this.bonusBtn = bonusBtn;   //大厅bonus按钮
        this.playerGold = playerGold;
        this.updateTime();
    },
    // 更新时间
    updateTime: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_awardresidueTime);
        NetworkLobby.send(p);
    },
    openOnlineAwardUI: function () {
        this.bg.active = true;
        this.onlineAward.active = true;
    },
    btn_collect: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_award);
        NetworkLobby.send(p);
    },
    btn_close: function () {
        this.bg.active = false;
        this.onlineAward.active = false;
    },
    countDownTime: function (data) {
        this.goldLab.string = data.gold;
        var time = data.time;
        var sche = function () {
            time--;
            var m = Math.floor(time / 60);
            var s = time % 60;
            if (m < 10) { m = "0" + m; }
            if (s < 10) { s = "0" + s; }
            if (this.remainingTime)
                this.remainingTime.string = m + ":" + s;
            this.remainingTimeIn.string = m + ":" + s;
            if (time <= 0) {
                this.unschedule(sche);
                this.awardNode.active = true;
                this.remainingTimeIn.node.active = false;
                this.remainingTime.node.active = false;
                this.bonusBtn.interactable = false;
            } else {
                this.awardNode.active = false;
                this.remainingTimeIn.node.active = true;
                this.remainingTime.node.active = true;
                this.bonusBtn.interactable = true;
            }
            this.nowTime = time;
        };
        this.schedule(sche, 1);
    },
    onHanderOnlineAward: function () { },
    onHanderOnlineAwardRet: function (self, pack) {
        var isSucceed = pack.readByte();
        if (isSucceed === 1) {
            self.updateTime();
            self.bg.active = false;
            self.onlineAward.active = false;
            PlayerInfo.gold += Number(self.goldLab.string);
            self.playerGold.string = PlayerInfo.gold;
        }

    },
    onHanderAwardresidueTime: function () { },
    onHanderAwardresidueTimeRet: function (self, pack) {
        var obj = new Object();
        obj.time = Number(pack.readString());
        obj.gold = pack.readShort();
        self.countDownTime(obj);
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_award, this.onHanderOnlineAward, this);//在线奖励
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_award_ret, this.onHanderOnlineAwardRet, this);//在线奖励
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_awardresidueTime, this.onHanderAwardresidueTime, this);//在线奖励领取的剩余时间
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_awardresidueTime_ret, this.onHanderAwardresidueTimeRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_award, this.onHanderOnlineAward, this);//在线奖励
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_award_ret, this.onHanderOnlineAwardRet, this);//在线奖励
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_awardresidueTime, this.onHanderAwardresidueTime, this);//在线奖励领取的剩余时间
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_online_awardresidueTime_ret, this.onHanderAwardresidueTimeRet, this);
    },
});
