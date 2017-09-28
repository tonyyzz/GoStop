var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        gName: cc.Label,
        gold: cc.Label,
        playerInfoUINode: cc.Node,
    },

    onLoad: function () {
        this.playerInfoUI = this.playerInfoUINode.getComponent("PlayerInfoUI");
        this.giftID = 2;
    },
    initGift: function (data) {
        this.icon.spriteFrame = Global.giftAtlas.getSpriteFrame(data.id);
        this.gName.string = data.name;
        this.gold.string = data.price;
        this.giftID = data.id;
    },
    btn_giveGift: function () {
        this.playerInfoUI.sendGiftMsg(this.giftID);
        cc.log('赠送礼物');
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
