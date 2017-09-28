var PlayerInfo = require('PlayerInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        scrollTouch: cc.Node,
        betNum: cc.Node,
        betNumArr: [cc.Node],

        playerGold: cc.Label,
    },

    // use this for initialization
    initAlterBetUI: function () {
        this.node.active = true;
        this.scrollView = cc.find('ScrollView', this.node).getComponent(cc.ScrollView);
        this.node.active = false;
    },

    scrollCallbrack: function () {
        this.scrollPos = this.scrollView.getContentPosition();
        cc.log(this.scrollPos);
    },

    scrollMoveEnd: function () {
        var scrollPos = this.scrollView.getContentPosition();
        // var target = scrollPos.y / (this.betNum.height * 9);
        // this.scrollView.scrollToBottomRight(0.5, target);
        var num = Math.round(scrollPos.y / this.betNum.height);
        this.scrollView.setContentPosition(cc.v2(scrollPos.x, num * this.betNum.height));
        if (num < 0)
            num = 0;
        else if (num > this.betNumArr.length - 1)
            num = this.betNumArr.length - 1;
        var label = this.betNumArr[num].getChildByName('Label').getComponent(cc.Label);
        this.slotManger.alterBetGold(Number(label.string));
        // cc.log('滚动结束', label.string);
    },

    scrollEvent: function (sender, event) {
        switch (event) {
            case 9:
                this.scrollMoveEnd();
                break;
            case 10:
                this.scrollMoveEnd();
                break;
        }
    },

    btn_betMax: function () {
        this.scrollView.scrollToBottom(0.1);
    },
    openUI: function (slotManger) {
        this.node.active = true;
        this.slotManger = slotManger;
        this.playerGold.string = PlayerInfo.gold;
        if (!this.betArr) {
            this.betArr = this.slotManger.oneBetArr;
            for (var i = 0; i < this.betArr.length; i++) {
                this.betNumArr[i].getChildByName('Label').getComponent(cc.Label).string = this.betArr[i];
            }
        }
    },

    btn_closeUI: function () {
        this.node.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
