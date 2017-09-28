var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkGame = require('NetworkGame');

cc.Class({
    extends: cc.Component,

    properties: {
        jackpotList: [cc.Node],
    },

    // use this for initialization
    onLoad: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot_notice, this.onHanderJackpotNotice, this);//同一主题奖池金额群发通知（同一theme）
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot, this.onHanderJackpot, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot_ret, this.onHanderJackpotRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot_notice, this.onHanderJackpotNotice, this);//同一主题奖池金额群发通知（同一theme）
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot, this.onHanderJackpot, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot_ret, this.onHanderJackpotRet, this);
    },
    // 奖池金额变化通知
    onHanderJackpotNotice: function (self, pack) {
        self.updateJackpot(pack);
    },
    onHanderJackpot: function () { },
    onHanderJackpotRet: function (self, pack) {
        self.updateJackpot(pack);
    },
    initJackpot: function (themeID) {
        this.id = themeID;
        for (var i = 0; i < this.jackpotList.length; i++) {
            var tid = this.jackpotList[i].name.split('_')[1];
            if (Number(tid) === themeID)
                this.jackpotList[i].active = true;
            else
                this.jackpotList[i].active = false;
        }
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_jackpot);
        p.writeInt(themeID);
        NetworkGame.send(p);
    },
    updateJackpot: function (pack) {
        switch (this.id) {
            case 1:
                this.jackpot_pirate(pack);
                break;
            case 2:
                this.jackpot_dragon(pack);
                break;
            case 100:
                this.jackpot_slots777(pack);
                break;
        }
    },
    jackpot_pirate: function (pack) {
        if (!this.jackpot) {
            this.jackpot = cc.find('Pirate_1', this.node).getComponent(cc.Label);
        }
        this.jackpot.string = pack.readInt();
    },
    jackpot_dragon: function (pack, miniGold) {
        if (!this.jp) {
            this.jp = cc.find('Dragon_2', this.node);
            this.jackpot = this.jp.getChildByName('Jackpot').getComponent(cc.Label);
            this.jackpotMini = this.jp.getChildByName('JackpotMini').getComponent(cc.Label);
        }
        if (pack)
            this.jackpot.string = pack.readInt();
        if (miniGold)
            this.jackpotMini.string = miniGold;
    },
    jackpot_slots777: function (pack, miniGold) {
        if (!this.jackpot) {
            this.jackpot = cc.find('Slots777_100', this.node);
            this.mini = cc.find('Mini/Gold', this.jackpot).getComponent(cc.Label);
            this.mega = cc.find('Mega/Gold', this.jackpot).getComponent(cc.Label);
            this.monster = cc.find('Monster/Gold', this.jackpot).getComponent(cc.Label);
            this.colossal = cc.find('Colossal/Gold', this.jackpot).getComponent(cc.Label);
        }
        if (miniGold)
            this.mini.string = miniGold;
        if (pack) {
            this.mega.string = pack.readString();
            this.monster.string = pack.readString();
            this.colossal.string = pack.readString();
        }

    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
