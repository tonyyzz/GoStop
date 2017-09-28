var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var ModuleManager = require("ModuleManager");
var Mod_UrlConfig = require("Mod_UrlConfig");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
        isTest: true,
    },

    // use this for initialization
    onLoad: function () {
        this.isLoadMod = true;
        Global.isLogNet = true;

        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        //这是在HotUpdate脚本和本脚本在同一个节点下的获取方法，还有HotUpdate脚本先执行
        // this.hotUpdate = this.node.getComponent('HotUpdate');
        // this.hotUpdate.updateInit(this);

        ModuleManager.init();
        cc.log('连接服务器')

    },

    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        //MessageManager.deleteMsgCallback(EnumType.MessageType.MSG_LOGIN, this.onHanderLogin, this);
    },

    connectServer: function () {
        var urlConfig = Mod_UrlConfig.GetModData();
        if (this.isTest) {
            cc.log('连接服务器，host:', urlConfig.host_test, "port:", urlConfig.port)
            NetworkLobby.connectServer(urlConfig.host_test, urlConfig.port);
        } else {
            cc.log('连接服务器，host:', urlConfig.host, "port:", urlConfig.port)
            NetworkLobby.connectServer(urlConfig.host, urlConfig.port);
        }

    },

    onHanderConnect: function (self, pack) {
        cc.log('连接大厅服务器成功');
        cc.director.loadScene('LoginScene');
    },

    sendMsg: function () {

    },

    /**
     * 更新进度值
     * fileVal: 文件更新进度值 0~1
     * byteVal：字节更新进度值 0~1
     */
    setUpdateProgress: function (fileVal, byteVal) {
        cc.log('文本更新进度:', fileVal);
        cc.log('字节更新进度：', byteVal);
    },

    /**
     * 更新日志
     * log: 日志信息
     */
    setUpdateLog: function (log) {
        cc.log("更新日志：", log);
    },

    /**
     * 大版本更新
     */
    updateBig: function () {
        cc.log('大更新')
    },

    /**
     * 更新失败
     */
    updateLost: function () {
        this.hotUpdate.retryUpdate();   //尝试重新更新
    },

    /**
     * 更新结束
     */
    updateOver: function () {

    },

    update: function (dt) {
        if (this.isLoadMod && Global.modMaxLen === Global.modCulLen) {
            cc.log('配置表初始化完成');
            this.connectServer();
            this.isLoadMod = false;
        }
    },
});
