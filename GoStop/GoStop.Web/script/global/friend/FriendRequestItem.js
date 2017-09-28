var Global = require('Global');
var AudioManager = require('AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {
        headIcon: cc.Sprite,
        nameLab: cc.Label,
    },

    onLoad: function () {

    },

    setInfo: function (data, friendUI) {
        this.friendUI = friendUI;
        this.nameLab.string = data.name;
        if (data.headType === 0)
            this.headIcon.spriteFrame = Global.headAtlas.getSpriteFrame(data.head);
        this.pid = data.pid;
    },
    // 拒绝请求
    btn_reject: function () {
        this.friendUI.friendRequestDispose(this.pid, 0);
        AudioManager.playAudio('click');
    },
    // 同意请求
    btn_accept: function () {
        this.friendUI.friendRequestDispose(this.pid, 1);
        AudioManager.playAudio('click');
    },
});
