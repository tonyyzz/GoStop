cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    init: function (chestsaward) {
        this.chestsAward = chestsaward;
        this.open = cc.find('Open', this.node); //开启奖励
        this.close = cc.find('Close', this.node); //未开启奖励
        this.awardLab = cc.find('Open/Label', this.node).getComponent(cc.Label);    //奖励说明
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (!this.close.active || this.chestsAward.isOpenAwardOver) return;
            this.chestsAward.openBox(this.id);
        }, this);
    },
    openCallback: function (box) {
        this.close.active = false;
        this.awardLab.string = box.gold;
    },
    /**设置奖励说明 */
    setAward: function (box) {
        this.id = box.id;
        if (box.isRead === 1) {   //已开启
            this.close.active = false;
            this.awardLab.string = box.gold;
        } else {
            this.close.active = true;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
