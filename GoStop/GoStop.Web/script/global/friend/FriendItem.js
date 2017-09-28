var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require("Global");
var AudioManager = require('AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    init: function () {
        this.nameLab = this.node.getChildByName('Name').getComponent(cc.Label);
        this.headSpr = this.node.getComponent(cc.Sprite);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info);
            p.writeInt(this.pid);
            NetworkLobby.send(p);
            AudioManager.playAudio('click');
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
