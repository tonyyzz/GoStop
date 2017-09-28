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
    onLoad: function () {
        this.eventIntercept();
    },

    openMenu: function () {
        this.node.active = true;
    },
    closeMenu: function () {
        this.node.active = false;
    },
    eventIntercept:function () {
        ///拦截所有的事件
        this.node.on('mouseup', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mousedown', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mouseenter', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mousemove', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mouseleave', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchstart', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchmove', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchend', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchcancel', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
