var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');

var ModuleManager = require("ModuleManager");
var Mod_UrlConfig = require("Mod_UrlConfig");
var Global = require("Global");


cc.Class({
    extends: cc.Component,

    properties: {
        isConnetTestSever: false,

        mainProEB: cc.EditBox,
        secondProEB: cc.EditBox,

        eb_friend: cc.EditBox,


        msgNode: cc.Prefab,
        scrollViewContent: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.playerID = 0;
        this.isLoadMod = true;
        ModuleManager.init();
        this.mainPro = 0;
        this.secondPro = 0;
        this.msgArr = new Array();
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this);///连接游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ERROR, EnumType.SecondCommand.SC_ERROR_hall, this.onHanderError, this);///连接游戏服务器
        this.sendMsg(4, 1, this.onHanderError, null);
        this.sendMsg(3, 92, this.addFriendNotice, null);
        this.sendMsg(1, 17, this.gift);

        this.sendMsg(1, 128, this.jinfeng, null);
        this.sendMsg(1, 129, this.loginJinfeng, null);
        this.sendMsg(1, 130, this.jinyan, null);
        this.sendMsg(1, 131, this.jiechuJinyan, null);
    },

    // 禁封通知
    jinfeng: function(self, pack){
        cc.log('账号禁封：', pack.readByte());
    },
    // 登录是禁封通知
    loginJinfeng: function (self, pack){
        cc.log('登录禁封通知:', pack.readByte());
    },
    // 禁言通知
    jinyan: function (self, pack) {
        cc.log('禁言通知:', pack.readByte());
    },
    // 解除禁言
    jiechuJinyan: function (self, pack) {
        cc.log('解除禁言通知:', pack.readByte());
    },

    // 大厅消息错误日志
    onHanderError: function (self, pack) {
        cc.log('大厅错误消息：', pack.readShort());
    },

    connectServer: function () {
        var urlConfig = Mod_UrlConfig.GetModData();
        if (this.isConnetTestSever)
            NetworkLobby.connectServer(urlConfig.host_test, urlConfig.port); //发送连接服务器请求
        else
            NetworkLobby.connectServer(urlConfig.host, urlConfig.port); //发送连接服务器请求
    },

    connectGameServer: function (host, port) {
        NetworkGame.connectServer(host, port); //发送连接服务器请求
    },

    onHanderConnect: function (self, pack) {
        cc.log('连接服务器成功');
    },

    onHanderConnectGame: function (self, pack) {
        cc.log('连接游戏服务器成功');
        //登录游戏服务器
        var m = 2;
        var s = EnumType.SecondCommand.SC_GAME_login;
        var p = new Package();
        p.Init(m, s);
        cc.log("wwwww", self.playerID);
        p.writeInt(self.playerID);

        self.sendMsg(m, s, null, p, 'game');
        self.sendMsg(m, s + 1, self.gameLogin, null, 'game');
    },
    //游戏登录
    gameLogin: function (self, pack) {
        //加入房间
        var m = 2;
        var s = EnumType.SecondCommand.SC_GAME_join;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(1);
        self.sendMsg(m, s, null, p, 'game');
        self.sendMsg(m, s + 1, self.m_3, null, 'game');
    },

    // 发送消息
    sendMsg: function (mainPro, secondPro, msgCallBack, pack, type) {
        MessageManager.registerMsgCallback(mainPro, secondPro, msgCallBack, this);
        if (pack)
            if (type === 'game')
                NetworkGame.send(pack);
            else
                NetworkLobby.send(pack);
    },
    btn_bangFacebook: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_bindingFacebook;
        var p = new Package();
        p.Init(m, s);
        p.writeString('1235');
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.bangFacebook);
    },
    bangFacebook: function (self, pack) {
        cc.log('绑定Facebook：', pack.readByte());
    },
    // 登录
    btn_Login: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_login;
        var p = new Package();
        this.platformID = 1;
        p.Init(m, s);
        if (cc.sys.isNative) {
            p.writeInt(this.platformID);  //登录平台
            p.writeString(''); //Facebook账号
            p.writeString('123456');  //设备码
            p.writeString('');
        } else {
            p.writeInt(this.platformID);  //登录平台
            p.writeString(''); //Facebook账号
            p.writeString('123459');  //设备码
            p.writeString('');
        }

        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.m_1);
    },
    m_1: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.name = pack.readString();
        obj.level = pack.readInt();
        obj.exp = pack.readInt();
        obj.money = pack.readInt();
        obj.headType = pack.readInt();
        obj.head = pack.readString();
        obj.isGetLogin = pack.readByte();   //是否是首次登录
        if(cc.sys.isBrowser && self.platformID === 3)
            obj.H5ID = pack.readString();
        cc.log('登录回调', obj);
    },

    //点赞玩家
    btn_zan: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_zan;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(4);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.zan);
    },
    zan: function (self, pack) {
        var z = pack.readInt();
        cc.log('点赞玩家 回调', z);
    },
    //礼物商城
    btn_giftList: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_giftlist;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(4);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onGiftList);
    },
    onGiftList: function (self, pack) {
        var arr = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++){
            var o = new Object();
            o.id = pack.readInt();
            o.name = pack.readString();
            o.price = pack.readInt();
            arr.push(o);
        }
        cc.log('礼物列表：', arr);
    },
    //商城列表
    btn_ShopList: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_storelist;
        var p = new Package();
        p.Init(m, s);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onShopList);
    },
    onShopList: function (self, pack) {
        var list = new Array();
        var l = pack.readInt();
        for(var i = 0; i < l; i++){
            var o = new Object();
            o.id = pack.readInt();
            o.originalPrice = pack.readInt();
            o.presentPrice = pack.readInt();
            o.us = pack.readInt();
            o.free = pack.readInt();
            list.push(o);
        }
        cc.log('商城列表：', list);
    },
    //购买商品
    btn_buyShop: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_storepay;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(1);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onBuyShop);
    },
    onBuyShop: function (self, pack) {
        cc.log('购买商品结果：', pack.readByte());
        cc.log('账号金额：', pack.readInt());
    },
    //修改个人信息
    btn_alterMyInfo: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_updateNameAndheadimg;
        var p = new Package();
        p.Init(m, s);
        p.writeString('player1');
        p.writeInt(0);
        p.writeString('icon_2');
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onAlterMyInfo);
    },
    onAlterMyInfo: function (self, pack) {
        
        cc.log('修改个人信息结果', pack.readByte());
    },
    // 在线奖励
    btn_getOnlineAward: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_online_award;
        var p = new Package();
        p.Init(m, s);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onOnlineAward);
    },
    onOnlineAward: function (self, pack) {
        var obj = new Object();
        obj.offsetTime = pack.readInt();
        obj.gold = pack.readShort();
        cc.log('在线奖励金额', obj);
    },

    // 查看玩家信息
    btn_checkPlayerInfo: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_info;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(2);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.playerinfo);
    },
    playerinfo: function (self, pack) {
        var p = new Object();
        p.pid = pack.readInt();
        p.name = pack.readString();
        p.level = pack.readInt();
        p.zan = pack.readInt();
        p.exp = pack.readInt();
        p.headType = pack.readInt();
        p.head = pack.readString();
        p.money = pack.readInt();
        p.l_total = pack.readInt();
        p.l_max = pack.readInt();
        p.l_num = pack.readInt();
        p.l_spin = pack.readInt();
        cc.log('其他玩家信息', p);
    },

    // 登录抽奖
    btn_loginAward: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_login_award;
        var p = new Package();
        p.Init(m, s);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.onAward);
    },
    onAward: function (self, pack) {
        var obj = new Object();
        obj.gold = pack.readInt();  //转盘普通奖励
        obj.gold_2 = pack.readInt();    //连续登录奖励
        obj.gold_3 = pack.readInt();    //好友加成奖励
        cc.log("每日抽奖结果", obj);
    },

    // 赠礼
    btn_gift: function () {
        var m = 1;
        var s = EnumType.SecondCommand.SC_ACCOUNT_gift;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(1);
        p.writeInt(1);
        this.sendMsg(m, s, null, p);
    },
    gift: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.type = pack.readInt();
        cc.log('赠礼回调', obj);
    },

    //添加好友
    btn_addFriend: function () {
        // 进入游戏
        var m = 3;
        var s = EnumType.SecondCommand.SC_FRIEND_add;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(Number(this.eb_friend.string));
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.m_2);
    },

    m_2: function (self, pack) {
        var f = pack.readByte();
        cc.log('添加好友 回调', f);
    },
    //收到请求好友通知
    addFriendNotice: function (self, pack) {
        cc.log('收到请求好友通知：', pack.readInt());
    },

    // 删除好友
    bet_deleteFriend: function () {
        var m = 3;
        var s = EnumType.SecondCommand.SC_FRIEND_remove;
        var p = new Package();
        p.Init(m, s);
        p.writeInt(Number(this.eb_friend.string));
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.m_3);
    },
    m_3: function (self, pack) {
        var id = pack.readInt();
        cc.log('删除好友 回调', id);
    },

    // 同意添加好友
    btn_agreeFriend: function () {
        var m = 3;
        var s = EnumType.SecondCommand.SC_FRIEND_agree;
        var p = new Package();
        p.Init(m, s);
        p.writeShort(1);
        p.writeInt(0);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.m_5);
    },

    m_5: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.pid = pack.readInt();
        obj.isAgree = pack.readShort();
        if (obj.isAgree == 1) {
            cc.log('同意添加');
        } else {
            cc.log('拒绝添加');
        }
        cc.log('添加好友 回调', obj);

    },

    // 好友列表
    btn_friendList: function () {
        var m = 3;
        var s = EnumType.SecondCommand.SC_FRIEND_list;
        var p = new Package();
        p.Init(m, s);
        this.sendMsg(m, s, null, p);
        this.sendMsg(m, s + 1, this.m_4);
    },
    m_4: function (self, pack) {
        var obj = new Object();
        obj.l = pack.readInt();
        obj.friendList = new Array();
        for (var i = 0; i < obj.l; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.head = pack.readInt();
            o.isOnline = pack.readByte();    //是否在线
            obj.friendList.push(o);
        }
        cc.log('好友列表 回调', obj);
    },




    btn_sendMsg: function () {
        MessageManager.deleteMsgCallback(this.mainPro, this.secondPro, this.msgCallBack, this); //注册前线清楚掉老的消息
        this.mainPro = Number(this.mainProEB.string);
        this.secondPro = Number(this.secondProEB.string);
        // this.mainPro = 1;
        // this.secondPro = 1;
        MessageManager.registerMsgCallback(this.mainPro, this.secondPro, this.msgCallBack, this);///注册消息
        this.scheduleOnce(function () {
            var p = new Package();
            p.Init(this.mainPro, this.secondPro);
            // p.writeString('123');
            // p.writeString('123456');

            for (var i = 0; i < this.msgArr.length; i++) {
                var type = cc.find('Type', this.msgArr[i]).getComponent(cc.EditBox);
                var data = cc.find('Data', this.msgArr[i]).getComponent(cc.EditBox);
                if (type.string === '0')
                    p.writeInt(Number(data.string));
                else if (type.string === "1")
                    p.writeFloat(Number(data.string));
                else if (type.string === '2')
                    p.writeString(date.string);
                else if (type.string === '3')
                    p.writeShort(Number(date.string));
            }
            NetworkLobby.send(p);
            cc.log('向服务器发送消息：', p);
            p = null;
        }, 0.2);
    },

    msgCallBack: function (self, pack) {

    },

    btn_addData: function () {
        var m = cc.instantiate(this.msgNode)
        this.scrollViewContent.addChild(m);
        this.msgArr.push(m);
    },

    btn_deleteOneData: function () {
        this.scrollViewContent.removeChild(this.msgArr[this.msgArr.length - 1]);
        this.msgArr.pop();
        cc.log(this.msgArr.length);
    },

    btn_deleteData: function () {
        for (var i = 0; i < this.msgArr.length; i++) {
            this.scrollViewContent.removeChild(this.msgArr[i]);
        }
        this.msgArr = new Array();
    },

    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this); ///连接游戏服务器
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.isLoadMod && Global.modMaxLen === Global.modCulLen) {
            cc.log('配置表初始化完成');
            this.connectServer();
            this.isLoadMod = false;
        }
    },
});
