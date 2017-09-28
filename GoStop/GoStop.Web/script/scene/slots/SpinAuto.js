var AudioManager = require('AudioManager');
var Global = require('Global');
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkGame = require('NetworkGame');

cc.Class({
    extends: cc.Component,

    properties: {
        slotsMgrName: '',
    },

    initSinAuto: function (slotsMrg) {
        this.bonus = this.node.getChildByName('Bonus');
        this.bonusNum = this.bonus.getChildByName('Num').getComponent(cc.Label);
        this.awardTitle = this.bonus.getChildByName('Label').getComponent(cc.Label);    //奖励说标题
        this.bonus.active = false;
        this.slotsManager = slotsMrg;
        this.autoTime = 1;  //开启自动需要时间
        this.isAutoSpin = false;    //是否开启自动spin
        this.button = this.node.getComponent(cc.Button);
        this.init();
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.isTouch = true;
            this.touchTime = 0;
            this.nodeScale(0.95);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (!this.button.interactable && this.touchTime < this.autoTime)
                this.closeAuto();
            else if (this.button.interactable && this.touchTime < this.autoTime)
                this.spinHand();
            this.init();
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.init();
        }, this);
    },
    // 初始化，返回手动状态
    init: function () {
        this.isTouch = false;
        this.nodeScale(1);
    },
    // spin手动状态
    spinHand: function () {
        if (this.slotsManager.isSpining) return;  //在非spin过程中才能spin
        this.sendBetMsg();
        AudioManager.playAudio('spin');
    },
    //开启自动状态
    openAuto: function () {
        this.isAutoSpin = true;
        // var time = Global.spinTime + 0.7;
        this.button.interactable = false;
        this.autoSpinTime = 0.2;
        // this.sendBetMsg();

    },
    spinAuto: function () {
        this.slotsManager.isSpining = true;
        this.autoCallback = function () {
            this.autoSpinTime = 3;
            this.sendBetMsg();
        }
        this.scheduleOnce(this.autoCallback, this.autoSpinTime);
    },
    //请求下注消息
    sendBetMsg: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet);
        p.writeInt(this.slotsManager.nowOneBet);
        // p.writeInt(100);
        NetworkGame.send(p);
    },
    // 显示bonus奖励
    showBonusAward: function (num, title) {
        if (typeof title == 'undefined')
            this.awardTitle.string = 'bonus';
        else
            this.awardTitle.string = title;
        if (num > 0) {
            this.bonus.active = true;
            this.bonusNum.string = num;
        } else {
            this.bonus.active = false;
        }

    },
    closeAuto: function () {
        this.button.interactable = true;
        this.unschedule(this.autoCallback);
        this.isAutoSpin = false;
    },
    nodeScale: function (num) {
        var scale = cc.scaleTo(0.1, num);
        this.node.runAction(scale);
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.isTouch) {
            this.touchTime += dt;
            if (this.touchTime > this.autoTime) {
                this.init();
                if (this.button.interactable)
                    this.openAuto();
                else
                    this.closeAuto();
            }
        }
        if (this.isAutoSpin && !this.slotsManager.isSpining)
            this.spinAuto();
    },
});
