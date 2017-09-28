var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var PlayerInfo = require("PlayerInfo");
var Tips = require("Tips");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    init: function (playerGold) {
        this.node.active = true;
        this.registerMsg();
        this.homePlayerGold = playerGold;   //显示在主页的玩家金额
        this.isLoadData = false;  //是否已经加载过配置数据
        this.shopCommodityList = cc.find('ScrollView/view/content', this.node).getComponentsInChildren('ShopCommodity');
        this.node.active = false;
    },
    openShop: function () {
        // 判断配置数据是否已经加载到缓存
        if (Global.shopList) {
            this.setShopConfig(Global.shopList);
        } else {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storelist);
            NetworkLobby.send(p);
        }

    },
    setShopConfig: function (configList) {
        this.node.setLocalZOrder(50);
        this.node.active = true;
        if (this.isLoadData) return;
        for (var i = 0; i < configList.length; i++) {
            this.shopCommodityList[i].setConfig(configList[i], this);
        }
        this.isLoadData = true;
    },
    buyCommodity: function (id, buyGold) {
        this.buyGold = buyGold;
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storepay);
        p.writeInt(id);
        NetworkLobby.send(p);
    },
    btn_close: function () {
        cc.log('关闭商城');
        this.node.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    // 商城列表
    onHanderStoreList: function () { },
    onHanderStoreListRet: function (self, pack) {
        var list = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.id = pack.readInt();
            o.originalPrice = pack.readInt();   //原获取金币数
            o.presentPrice = pack.readInt();    //加成金币数
            o.us = pack.readInt();              //购买价格
            o.free = pack.readInt();            //加成百分比
            list.push(o);
        }
        Global.shopList = list;
        self.setShopConfig(list);
    },
    // 商城支付
    onHanderStorePlay: function () { },
    onHanderStorePlayRet: function (self, pack) {
        if (pack.readByte() === 1) {
            Tips.showTips('Play succeeds.');
            PlayerInfo.gold += self.buyGold;
            self.homePlayerGold.string = PlayerInfo.gold;
        }
    },

    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storelist, this.onHanderStoreList, this);///商城列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storelist_ret, this.onHanderStoreListRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storepay, this.onHanderStorePlay, this);///商城支付
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storepay_ret, this.onHanderStorePlayRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storelist, this.onHanderStoreList, this);///商城列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storelist_ret, this.onHanderStoreListRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storepay, this.onHanderStorePlay, this);///商城支付
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_storepay_ret, this.onHanderStorePlayRet, this);
    },
});
