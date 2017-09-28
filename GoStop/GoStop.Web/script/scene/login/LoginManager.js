var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var MessageManager = require("MessageManager");
var EnumType = require("EnumType");
var Tips = require("Tips");
var PlayerInfo = require("PlayerInfo");
var Global = require("Global");
var AudioManager = require("AudioManager");
var ReflectCallback = require("ReflectCallback");

cc.Class({
    extends: cc.Component,

    properties: {
        headAtlas: cc.SpriteAtlas,
        giftAtlas: cc.SpriteAtlas,

        facebookLab: cc.Label,
    },

    onLoad: function () {
        Global.headAtlas = this.headAtlas;
        this.headAtlas = null;
        Global.giftAtlas = this.giftAtlas;
        this.giftAtlas = null;
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login, this.onHanderLogin, this);///登录
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_ret, this.onHanderLoginRet, this);///登录返回

        if (cc.sys.localStorage.getItem("musicVolume") === null)
            cc.sys.localStorage.setItem("musicVolume", 1);
        else
            AudioManager.setMusicVolume(Number(cc.sys.localStorage.getItem("musicVolume")));

        if (cc.sys.localStorage.getItem("soundVolume") === null)
            cc.sys.localStorage.setItem("soundVolume", 1);
        else
            AudioManager.setSoundVolume(Number(cc.sys.localStorage.getItem("soundVolume")));

        this.facebookID = "";
        this.verifyFacebookLogin();
    },

    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login, this.onHanderLogin, this);///登录
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_ret, this.onHanderLoginRet, this);///登录返回
    },
    login: function () {
        this.platformID = null; //平台ID
        var imei = '';  //IMEI设备码
        var h5ID = '';  //h5平台ID
        

        // 如果是h5或者模拟器则使用服务器生成的ID
        if (cc.sys.isBrowser || !cc.sys.isMobile) {
            this.platformID = 3;
            if (cc.sys.localStorage.getItem("H5_ID")) {
                h5ID = cc.sys.localStorage.getItem("H5_ID")
            }
        } else {
            if (cc.sys.localStorage.getItem("IMEI")) {
                imei = cc.sys.localStorage.getItem("IMEI");
            } else {
                imei = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getIMEI", "()Ljava/lang/String;");
                cc.sys.localStorage.setItem("IMEI", imei);
            }
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                this.platformID = 1;
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                this.platformID = 2;
            }
        }

        if(this.facebookID !== ""){
            imei = "";
            h5ID = "";
        }

        this.facebookLab.string = '登录，IMEI码：' + imei;
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login);
        p.writeInt(this.platformID);  //登录平台
        p.writeString(this.facebookID); //Facebook账号
        p.writeString(imei);  //设备码
        p.writeString(h5ID);
        NetworkLobby.send(p);
        p = null;
    },

    //登录
    onHanderLogin: function (self, pack) { },
    // 登录返回
    onHanderLoginRet: function (self, pack) {
        PlayerInfo.id = pack.readInt();
        PlayerInfo.nickname = pack.readString();
        PlayerInfo.level = pack.readInt();
        PlayerInfo.exp = pack.readInt();
        PlayerInfo.gold = pack.readInt();
        PlayerInfo.iconType = pack.readInt();
        PlayerInfo.head = pack.readString();
        PlayerInfo.isGetLoginAward = pack.readByte();   //登录奖励是否已经领取
        if (self.platformID === 3 && !cc.sys.localStorage.getItem("H5_ID")){ 
            cc.sys.localStorage.setItem("H5_ID", pack.readString());
            cc.log('保存H5ID', cc.sys.localStorage.getItem("H5_ID"));
        }
            
        cc.log('登录成功, 玩家ID：', PlayerInfo.id);

        cc.director.loadScene('LobbyScene');
    },
    // "RegisterButton"注册按钮调用
    btn_Register: function () {
        Tips.showTips('未开启注册功能');
    },
    // 获取设备码
    btn_getIMEI: function () {
        if (cc.sys.os === cc.sys.OS_ANDROID)
            this.facebookLab.string = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getIMEI", "()Ljava/lang/String;");
        else if (cc.sys.os === cc.sys.OS_IOS) {

        }
    },
    // 验证授权登录
    verifyFacebookLogin: function () {
        if (cc.sys.isMobile && cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID)
                jsb.reflection.callStaticMethod("com/quge/sharelogin/FacebookShare", "loginAccreditVerify", "()V");
            else if (cc.sys.os === cc.sys.OS_IOS) {

            }
        }else{
            this.login();
        }

    },
    // 移除授权
    btn_removeAccount: function () {
        if (cc.sys.os === cc.sys.OS_ANDROID)
            jsb.reflection.callStaticMethod("com/quge/sharelogin/FacebookShare", "removeAccount", "()V");
        else if (cc.sys.os === cc.sys.OS_IOS) {

        }
    },

    update: function (dt) {
        if (cc.sys.isMobile && cc.sys.isNative && ReflectCallback.isVerifyOver) {
            ReflectCallback.isVerifyOver = false;
            this.facebookLab.string = 'facebookID:' + ReflectCallback.facebookID;
            this.facebookID = ReflectCallback.facebookID;
            this.login();
        }
    },
});
