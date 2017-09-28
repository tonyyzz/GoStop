var Mod_LineRate = require("Mod_LineRate");
var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        spriteAtlas: cc.SpriteAtlas,
        infoItemParent: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function () {
        this.infoItemArr = this.infoItemParent.getComponentsInChildren(cc.Button);
        // var mod = Mod_LineRate.GetModData(Global.gameID);
        var mod = Mod_LineRate.GetModData(1);
        for (var i = 0; i < this.infoItemArr.length; i++) {
            if (i === 0) {
                var spr = this.infoItemArr[i].node.getChildByName('Sprite').getComponent(cc.Sprite);
                spr.spriteFrame = this.spriteAtlas.getSpriteFrame(mod[i].item_type);
            } else {
                var spr = this.infoItemArr[i].node.getChildByName('Sprite').getComponent(cc.Sprite);
                spr.spriteFrame = this.spriteAtlas.getSpriteFrame(mod[i].item_type);
                cc.find('GoldList/Gold_3', this.infoItemArr[i].node).getComponent(cc.Label).string = mod[i].num_3;
                cc.find('GoldList/Gold_4', this.infoItemArr[i].node).getComponent(cc.Label).string = mod[i].num_4;
                cc.find('GoldList/Gold_5', this.infoItemArr[i].node).getComponent(cc.Label).string = mod[i].num_5;
            }
        }
    },
    openGameHelpUI: function () {
        if (!this.infoItemArr)
            this.init();
        this.node.active = true;
    },
    btn_close: function () {
        this.node.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
