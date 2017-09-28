var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var MessageManager = require("MessageManager");
var EnumType = require("EnumType");
var AudioManager = require("AudioManager");
var ReflectCallback = require("ReflectCallback");
var Tips = require("Tips");

cc.Class({
    extends: cc.Component,

    properties: {
        musicToggle: cc.Toggle,
        soundToggle: cc.Toggle,
    },

    init: function () {
        this.node.active = true;
        this.node.active = false;
    },
    openSettingsUI: function () {
        this.registerMsg();
        this.node.active = true;
        if (Number(cc.sys.localStorage.getItem("musicVolume")) === 1)
            this.musicToggle.isChecked = true;
        else if (Number(cc.sys.localStorage.getItem("musicVolume")) === 0)
            this.musicToggle.isChecked = false;
        if (Number(cc.sys.localStorage.getItem("soundVolume")) === 1)
            this.soundToggle.isChecked = true;
        else if (Number(cc.sys.localStorage.getItem("soundVolume")) === 0)
            this.soundToggle.isChecked = false;
        // AudioManager.setMusicVolume(cc.sys.localStorage.getItem("musicVolume"));
        // AudioManager.setMusicVolume(cc.sys.localStorage.getItem("soundVolume"));
    },
    btn_close: function () {
        this.node.active = false;
    },
    toggle_setMusic: function () {
        if (this.musicToggle.isChecked) {
            AudioManager.setMusicVolume(1);
            cc.sys.localStorage.setItem("musicVolume", 1)
        } else {
            AudioManager.setMusicVolume(0);
            cc.sys.localStorage.setItem("musicVolume", 0)
        }

    },
    toggle_setSound: function () {
        if (this.soundToggle.isChecked) {
            AudioManager.setSoundVolume(1);
            cc.sys.localStorage.setItem("soundVolume", 1)
        } else {
            AudioManager.setSoundVolume(0);
            cc.sys.localStorage.setItem("soundVolume", 0)
        }
    },
    // 授权应用
    btn_Facebook: function () {
        if (cc.sys.os === cc.sys.OS_ANDROID)
            jsb.reflection.callStaticMethod("com/quge/sharelogin/FacebookShare", "applyAccredit", "()V");
        else if (cc.sys.os === cc.sys.OS_IOS) {

        }
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // 是否授权Facebook成功检测
        if (ReflectCallback.isAccreditOver) {
            ReflectCallback.isAccreditOver = false;

            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook);
            p.writeString(ReflectCallback.facebookID);
            NetworkLobby.send(p);
        }
        if (ReflectCallback.accreditError) {
            ReflectCallback.isAccreditError = false;
            //授权错误ID
            Tips.showTips('Accredit Error,ID:' + ReflectCallback.accreditErrorID);
        }
    },
    onHanderBindingFacebook: function () { },
    onHanderBindingFacebookRet: function (self, pack) {
        if (pack.readByte() == 1)
            Tips.showTips('Accredit succeed.');
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook, this.onHanderBindingFacebook, this);///绑定Facebook账号
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook_ret, this.onHanderBindingFacebookRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook, this.onHanderBindingFacebook, this);///绑定Facebook账号
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook_ret, this.onHanderBindingFacebookRet, this);
    },
});
