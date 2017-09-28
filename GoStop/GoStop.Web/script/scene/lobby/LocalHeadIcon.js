cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    init: function (myCenter) {
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            myCenter.alterHeadIcon(this.node.name);
        }, this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
