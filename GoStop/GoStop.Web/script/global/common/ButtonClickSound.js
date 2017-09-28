var AudioManager = require('AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    
    onLoad: function () {
        var button = this.node.getComponent(cc.Button);
        button.node.on('click', function () {
            AudioManager.playAudio('click');
        }, this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
