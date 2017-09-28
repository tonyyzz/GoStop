var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        nameLab: cc.Label,
        headSpr: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {
        this.isDesignate = false;   //是否选定
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.isDesignate) {
                this.isDesignate = false;
                this.headSpr.node.color = new cc.Color(255, 255, 255);
            } else {
                this.isDesignate = true;
                this.headSpr.node.color = new cc.Color(122, 122, 122);
            }
        }, this);
    },

    setInfo: function (data) {
        this.nameLab.string = data.name;
        if (data.headType === 0)
            this.headSpr.spriteFrame = Global.headAtlas.getSpriteFrame(data.head);
        this.pid = data.pid;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
