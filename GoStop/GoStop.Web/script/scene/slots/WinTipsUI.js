var AudioManager = require('AudioManager');
var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        win: cc.Node,
        winGold: cc.Label,
        winAtlas: cc.SpriteAtlas,
        winBigEffect: cc.Node,
    },

    onLoad: function () {
        this.winSpr = this.win.getComponent(cc.Sprite);
        this.isAdd = false;
    },

    openWin: function (gold) {
        if (gold === 0) return;
        this.winGold.node.active = true;
        this.win.active = false;
        this.winGold.string = gold;
    },

    openWinTips: function (gold, type, lastGold) {
        if (gold === 0) return;
        if (type === -1) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('bigwin');
        } else if (type === 0) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('jackpot');
        } else if (type === 1) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('mini');
        } else if (type === 2) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('mega');
        } else if (type === 3) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('monster');
        } else if (type === 4) {
            this.winSpr.spriteFrame = this.winAtlas.getSpriteFrame('colossal');
        }
        if (type != null) {
            this.win.active = true;
            AudioManager.playAudio('win_big');
            var time = 0.2;
            var moveUp = cc.moveBy(time, cc.v2(0, 10));
            var moveDown = cc.moveBy(time, cc.v2(0, -10));
            var repeat = cc.repeatForever(cc.sequence(moveUp, moveDown));
            this.win.runAction(repeat);
            this.scheduleOnce(function () {
                this.win.stopAction(repeat);
                this.win.active = false;
            }, 4);
            this.scheduleOnce(function () {
                this.showGold(gold, lastGold);
            }, 3.2);
            if (Global.gameID !== 100)
                this.winBigEffect.active = true;
        } else {
            this.win.active = false;
            AudioManager.playAudio('win_mini');
            this.showGold(gold, lastGold);
        }
    },

    // 《富兰克林》主题显示wild中奖总金额
    showWildGold: function (gold, slotsManager) {
        this.showGold(gold);
        this.scheduleOnce(function () {
            slotsManager.showResult();
        }, 3);
    },

    showGold: function (gold, lastGold) {
        if (!lastGold)
            lastGold = 0;
        AudioManager.playAudio('gold_change');
        this.scheGoldAdd = function () {
            AudioManager.playAudio('gold_change');
        },
            this.schedule(this.scheGoldAdd, 0.86, 2, 0);
        this.winGold.node.active = true;

        this.goldAdd = Math.floor(gold / (60 * 3));
        if (this.goldAdd < 1)
            this.goldAdd = 1;

        this.winGold.string = lastGold;
        this.maxGold = lastGold + gold;

        this.isAdd = true;
        this.scheduleOnce(function () {
            this.isAdd = false;
            this.winGold.string = gold + lastGold;
        }, 3);
    },

    closeWinTips: function () {
        this.winGold.node.active = false;
        this.winBigEffect.active = false;
    },

    update: function (dt) {
        if (this.isAdd) {
            this.winGold.string = Number(this.winGold.string) + this.goldAdd;
            if (Number(this.winGold.string) > this.maxGold) {
                this.winGold.string = this.maxGold;
                this.isAdd = false;
                this.unschedule(this.scheGoldAdd);
            }
        }
    },
});
