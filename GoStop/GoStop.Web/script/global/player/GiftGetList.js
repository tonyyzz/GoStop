var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        giftList: [cc.Node],
    },

    onLoad: function () {

    },
    setGiftData: function (dataList) {
        this.node.active = true;
        if(dataList.length === 0){
            this.node.active = false;
            
            return;
        }
        
        for(var i = 0; i < this.giftList.length; i++){
            if(i < dataList.length){
                this.giftList[i].active = true;
                var icon = this.giftList[i].getChildByName('GiftIcon').getComponent(cc.Sprite);
                icon.spriteFrame = Global.giftAtlas.getSpriteFrame(dataList[i].giftType);
                var giver = this.giftList[i].getChildByName('PlayerName').getComponent(cc.Label);
                giver.string = 'Gift by ' + dataList[i].giver;
                icon = null; giver = null;
            }else
                this.giftList[i].active = false;
        }
    },
    // update: function (dt) {

    // },
});
