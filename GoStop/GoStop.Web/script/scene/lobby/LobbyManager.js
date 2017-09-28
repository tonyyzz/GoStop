var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var NetworkGame = require("NetworkGame");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require("Global");
var PlayerInfo = require("PlayerInfo");
var Mod_Level = require("Mod_Level");
var AudioManager = require("AudioManager");
var Mod_Game = require("Mod_Game");

cc.Class({
    extends: cc.Component,

    properties: {
        lab_PlayerName: cc.Label,
        lab_PlayerGold: cc.Label,
        headIcon: cc.Sprite,

        btn_Scale: cc.Button,
        btn_Friends: cc.Button,
        btn_Bonus: cc.Button,
        btn_Setting: cc.Button,
        btn_GetChips: cc.Button,
        btn_MyCenter: cc.Button,

        lab_Level: cc.Label,
        expBar: cc.ProgressBar,

        themePrant: cc.Node,

        // myCenter: MyCenter,
    },

    // use this for initialization
    onLoad: function () {
        AudioManager.playMusic('bgm_lobby');
        Global.isInLobbyScene = true;
        this.myCenter = cc.find('Canvas/MyCenter').getComponent('MyCenter');
        if (PlayerInfo.isGetLoginAward) {
            var loginAward = cc.find('Canvas/DialAwardUI').getComponent('DialAwardUI');
            loginAward.initDialAwardUI();
            loginAward.openLoginAwardUI(this.lab_PlayerGold);
        }
        this.friendUI = cc.find('Canvas/FriendsUI').getComponent('FriendUI');
        this.friendUI.initFriendUI();
        this.playerInfoUI = cc.find('Canvas/PlayerInfoUI').getComponent('PlayerInfoUI');
        this.playerInfoUI.init(this.friendUI);
        this.shop = cc.find('Canvas/Shop').getComponent('Shop');
        this.shop.init(this.lab_PlayerGold);
        this.themeArr = this.themePrant.getComponentsInChildren("ThemeInfo");
        var remainingTime = this.btn_Bonus.node.getChildByName('RemainingTime').getComponent(cc.Label);
        this.onlineAwardUI = cc.find('Canvas/OnlineAwardUI').getComponent('OnlineAwardUI');
        this.onlineAwardUI.init(remainingTime, this.btn_Bonus, this.lab_PlayerGold);
        this.settingsUI = cc.find('Canvas/SettingsUI').getComponent('SettingsUI');
        this.settingsUI.init();
        this.initData();
        this.registerMsg(); //注册服务器消息
        this.buttonManager();

        var expMax = Mod_Level.GetModData(PlayerInfo.level + 1);
        if (PlayerInfo.exp > 0)
            this.expBar.progress = PlayerInfo.exp / Number(expMax[0].exp);
        else
            this.expBar.progress = 0;
        this.lab_Level.string = PlayerInfo.level;
        this.lab_PlayerName.string = PlayerInfo.nickname;
        this.headIcon.spriteFrame = Global.headAtlas.getSpriteFrame(PlayerInfo.head);

        // 请求主题配置
        if (Global.themeList.length === 0) {
            var p = new Package();
            p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_themeinfo);
            NetworkLobby.send(p);
        } else {
            for (var i = 0; i < Global.themeList.length; i++) {
                this.themeArr[i].initThemeInfo(Global.themeList[i]);
            }

        }

    },

    onHanderTest: function (self, pack) {

    },
    initData: function () {
        this.lab_PlayerName.string = PlayerInfo.name;
        this.lab_PlayerGold.string = PlayerInfo.gold;
    },
    //进入游戏G-1
    onEnterGame: function (id) {
        cc.log('进入游戏：', id);
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter);
        p.writeInt(id);
        NetworkLobby.send(p);
        Global.gameID = id;
    },


    onHanderGame: function (self, pack) { },
    onHanderGameRet: function (self, pack) {
        var game = new Object();
        game.ip = pack.readString();
        game.port = pack.readInt();
        cc.log('连接游戏服务器', game);
        NetworkGame.connectServer(game.ip, game.port);//连接游戏服务器G-2
        // game = null;
    },
    //连接游戏服务器成功
    onHanderConnectGame: function (self, pack) {
        //登录游戏服务器验证G-3
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login);
        p.writeInt(PlayerInfo.id);
        NetworkGame.send(p);
    },

    onHanderGameLogin: function (self, pack) { },
    onHanderGameLoginRet: function (self, pack) {
        cc.log('登录游戏服务器成功：房间id:', Global.gameID);
        cc.director.loadScene(Mod_Game.GetModData(Global.gameID)[0].scene_name);
    },

    //查看自己的基础信息
    onHanderMyInfo: function (self, pack) { },
    onHanderMyInfoRet: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.name = pack.readString();
        obj.level = pack.readInt();
        obj.praise = pack.readInt();
        obj.exp = pack.readInt();
        obj.headType = pack.readInt();
        obj.head = pack.readString();
        obj.gold = pack.readInt();
        obj.totalWin = pack.readInt();
        obj.biggestWin = pack.readInt();
        obj.spinsWon = pack.readInt();
        obj.totalSpins = pack.readInt();
        obj.playerType = pack.readInt();    //查看的玩家类型，-1：自己；0：陌生人；1：好友
        obj.giftArr = new Array();
        var length = pack.readInt();
        for (var i = 0; i < length; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.giver = pack.readString();    //赠送人
            o.headType = pack.readInt();
            o.head = pack.readString();
            o.giftType = pack.readInt();
            obj.giftArr.push(o);
        }
        if (obj.playerType !== -1) {
            self.playerInfoUI.openPlayerInfoUI(obj);
        } else {
            PlayerInfo.id = obj.id;
            PlayerInfo.nickname = obj.name;
            PlayerInfo.level = obj.level;
            PlayerInfo.praise = obj.praise;
            PlayerInfo.exp = obj.exp;
            PlayerInfo.headType = obj.headType;
            PlayerInfo.head = obj.head;
            PlayerInfo.gold = obj.gold;
            PlayerInfo.totalWin = obj.totalWin;
            PlayerInfo.biggestWin = obj.biggestWin;
            PlayerInfo.spinsWon = obj.spinsWon;
            PlayerInfo.totalSpins = obj.totalSpins;
            PlayerInfo.giftArr = obj.giftArr
            self.myCenter.openMyCenter();
        }
        obj = null;
    },
    // 主题信息配置
    onHanderThemeInfo: function () { },
    onHanderThemeInfoRet: function (self, pack) {
        var obj = new Object();
        obj.length = pack.readInt();
        obj.infoArr = new Array();
        for (var i = 0; i < obj.length; i++) {
            var o = new Object();
            o.id = pack.readInt();
            o.level = pack.readInt();
            o.line = pack.readInt();
            o.bet = pack.readInt();
            obj.infoArr.push(o);
        }
        for (var i = 0; i < obj.infoArr.length; i++) {
            self.themeArr[i].initThemeInfo(obj.infoArr[i]);
        }
        Global.themeList = obj.infoArr;
    },

    buttonManager: function () {
        this.btn_Bonus.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onlineAwardUI.openOnlineAwardUI();
        }, this);
        this.btn_Friends.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.friendUI.openFriendUI();
        }, this);
        this.btn_GetChips.node.on(cc.Node.EventType.TOUCH_END, function (event) {

        }, this);
        this.btn_Scale.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.shop.openShop();
        }, this);
        this.btn_Setting.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.settingsUI.openSettingsUI();
        }, this);
        this.btn_MyCenter.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var date = new Date();
            //判断上次进入个人中心时间，如果时间差超过一个小时，向服务器请求数据刷新
            if (date.getTime() - PlayerInfo.openMyCenterTime > 3600000) {
                PlayerInfo.openMyCenterTime = date.getTime();
                var p = new Package();
                p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info);
                p.writeInt(PlayerInfo.id);
                NetworkLobby.send(p);
            } else {
                this.myCenter.openMyCenter();
            }
        }, this);
    },
    onHanderInviteFirendsNotice: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.name = pack.readString();
        obj.gameID = pack.readInt();
        obj.houseID = pack.readInt();
        cc.log('收到游戏邀请通知', obj);
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_accept);
        p.writeInt(0);
        p.writeInt(obj.id);
        p.writeInt(obj.gameID);
        p.writeInt(obj.houseID);
        NetworkLobby.send(p);
    },
    onHanderInviteFirendsAccept: function () { },
    onHanderInviteFirendsAcceptRet: function (self, pack) {
        cc.log('邀请返回结果：', pack.readByte());
    },
    //限时活动结束通知
    onHanderPlayerActivityRet: function (self, pack) {
        var aa = pack.readInt();    //活动结算奖励的钱
        var money = pack.readInt(); //玩家账号金额
        cc.log('活动结束奖励金额：', aa);
        cc.log('目前玩家账号金额：', money);
    },
    //大厅显示对应主题的限时活动消息
    onHanderActivityLiOfHall: function (self, pack) {
        var obj = new Object();
        obj.themeID = pack.readInt();
        obj.poolGold = pack.readInt();
        obj.residueTime = pack.readInt();   //剩余时间
        obj.joinPlayerNum = pack.readInt(); //参与人数
        cc.log('限时活动通知：', obj);
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter, this.onHanderGame, this);///进入游戏
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter_ret, this.onHanderGameRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this);///连接游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login, this.onHanderGameLogin, this);//登录游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login_ret, this.onHanderGameLoginRet, this);//登录游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info, this.onHanderMyInfo, this);//查看用户基础信息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info_ret, this.onHanderMyInfoRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_themeinfo, this.onHanderThemeInfo, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_themeinfo_ret, this.onHanderThemeInfoRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_TEST, EnumType.SecondCommand.SC_TEST_A, this.onHanderTest, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_playerActivity_ret, this.onHanderPlayerActivityRet, this);  //限时活动结束通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_activityLiOfHall_ret, this.onHanderActivityLiOfHall, this);  //大厅显示对应主题的限时活动消息
    },
    onDestroy: function () {
        Global.isInLobbyScene = false;
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter, this.onHanderGame, this);///进入游戏
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter_ret, this.onHanderGameRet, this);///进入游戏
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this); ///连接游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login, this.onHanderGameLogin, this);//登录游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login_ret, this.onHanderGameLoginRet, this);//登录游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info, this.onHanderMyInfo, this);//查看自己的基础信息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_info_ret, this.onHanderMyInfoRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_themeinfo, this.onHanderThemeInfo, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_themeinfo_ret, this.onHanderThemeInfoRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_playerActivity_ret, this.onHanderPlayerActivityRet, this);  //限时活动结束通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_activityLiOfHall_ret, this.onHanderActivityLiOfHall, this);  //大厅显示对应主题的限时活动消息
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});


