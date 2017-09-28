var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkGame = require('NetworkGame');
var PlayerInfo = require("PlayerInfo");
var Tips = require("Tips")

cc.Class({
    extends: cc.Component,

    properties: {
        totalWin: cc.Label,     //获取总金额
        picksLeft: cc.Label,    //剩余开启次数
    },

    initCupPlay: function (playerGoldLab) {
        this.node.active = true;
        this.playerGoldLab = playerGoldLab;
        this.registerMsg();
        this.cupList = this.node.getChildByName('CupList').getComponentsInChildren('CupItem');
        this.cupList.forEach(function (element) {
            element.initCupItem(this);
        }, this);
        this.totalWin.string = '0';
        this.node.active = false;
        this.isOver = true; //活动是否结束
    },

    openCupActivety: function () {
        this.isOver = false;
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatShowCup);
        NetworkGame.send(p);
    },

    // 点击杯子
    clickCup: function (id) {
        if (this.isOver) return;
        this.nowOpenId = id;    //当前要开启的ID
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatOpenCup);
        p.writeInt(id);
        NetworkGame.send(p);
    },
    // 杯子数据列表
    onHanderHatShowCup: function () { },
    onHanderHatShowCupRet: function (self, pack) {
        var l = pack.readInt();
        var arr = new Array();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.id = pack.readInt();
            o.isRead = pack.readInt();  //是否开启
            o.type = pack.readInt();
            o.gold = pack.readInt();
            arr.push(o);
            self.cupList[i].setData(o);
        }
        self.node.active = true;
    },
    onHanderOpenCup: function () { },
    onHanderOpenCupRet: function (self, pack) {
        var obj = new Object();
        var playerGold = pack.readInt();
        obj.type = pack.readInt();
        obj.num = pack.readInt();
        obj.gold = pack.readInt();
        var total = pack.readInt();
        self.totalWin.string = total;
        var residueNum = pack.readInt();    //剩余次数
        self.picksLeft.string = "Picks left " + residueNum;
        for (var i = 0; i < self.cupList.length; i++) {
            if (self.cupList[i].id === self.nowOpenId) {
                self.cupList[i].openCup(obj);
            }
        }
        // 当剩余次数为0时结束玩法
        if (residueNum === 0) {
            Tips.showTips("Game Over");
            self.isOver = true;
            self.scheduleOnce(function () {
                self.cupList.forEach(function (element) {
                    element.cupReset(); // 重置所有杯子
                }, this);
                PlayerInfo.gold = playerGold;
                self.playerGoldLab.string = playerGold;
                self.node.active = false;
            }, 2)
        }
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatShowCup, this.onHanderHatShowCup, this);//显示杯子
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatShowCup_ret, this.onHanderHatShowCupRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatOpenCup, this.onHanderOpenCup, this);//打开杯子
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatOpenCup_ret, this.onHanderOpenCupRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatShowCup, this.onHanderHatShowCup, this);//显示杯子
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatShowCup_ret, this.onHanderHatShowCupRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatOpenCup, this.onHanderOpenCup, this);//打开杯子
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_hatOpenCup_ret, this.onHanderOpenCupRet, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
