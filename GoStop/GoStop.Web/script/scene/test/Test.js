var Mod_Mgr = require('ModuleManager');
var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require("NetworkGame");
var Mod_UrlConfig = require("Mod_UrlConfig");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
        initPlyaerGoldEB: cc.EditBox,
        ranNumEB: cc.EditBox,
        oneTypeEB: cc.EditBox,
        betOneGoldEB: cc.EditBox,
        themeIdEB: cc.EditBox,
        linesEB: cc.EditBox,
        loginEB: cc.EditBox,
        playerGoldLab: cc.Label,
        toggle: cc.Toggle,
        spinNumLab: cc.Label,
        isTestNet: true,

        waveFigure: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login, this.onHanderLogin, this);///登录
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_ret, this.onHanderLoginRet, this);///登录返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter, this.onHanderGame, this);///进入游戏
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter_ret, this.onHanderGameRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this);///连接游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login, this.onHanderGameLogin, this);//登录游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login_ret, this.onHanderGameLoginRet, this);//登录游戏服务器
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join, this.onHanderJoin, this);///加入牌桌
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_ret, this.onHanderJoinRet, this); ///加入返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回

        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_TEST, EnumType.SecondCommand.SC_PressureTest_Bet, this.onHanderBetTest, this); ///压力测试 - 下注操作

        this.slotsCount = this.node.getComponent('SlotsCount');
        this.wave = this.waveFigure.getComponent('WaveFigure');
        this.ranPool = new Array();
        this.nowRatioID = 0;
        this.playerID = 0;
        Global.isLogNet = false;
        this.isSpining = false;
        Mod_Mgr.init();
        this.scheduleOnce(function () {
            cc.log('读取配置表完成');
            this.connectServer();
        }, 0.2);

    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_lobby, this.onHanderConnect, this);  //连接成功
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login, this.onHanderLogin, this);///登录
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login_ret, this.onHanderLoginRet, this);///登录返回
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter, this.onHanderGame, this);///进入游戏
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter_ret, this.onHanderGameRet, this);///进入游戏
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game, this.onHanderConnectGame, this); ///连接游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login, this.onHanderGameLogin, this);//登录游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_login_ret, this.onHanderGameLoginRet, this);//登录游戏服务器
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join, this.onHanderJoin, this);  //加入牌桌
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_ret, this.onHanderJoinRet, this); ///加入返回
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回

        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_TEST, EnumType.SecondCommand.SC_PressureTest_Bet, this.onHanderBetTest, this); ///压力测试 - 下注操作
    },
    connectServer: function () {
        var urlConfig = Mod_UrlConfig.GetModData();
        if (this.isTestNet) {
            cc.log('连接大厅服务器，host:', urlConfig.host_test, "port:", urlConfig.port);
            NetworkLobby.connectServer(urlConfig.host_test, urlConfig.port);
        } else {
            cc.log('连接大厅服务器，host:', urlConfig.host, "port:", urlConfig.port);
            NetworkLobby.connectServer(urlConfig.host, urlConfig.port);
        }

    },
    onHanderConnect: function (self, pack) {
        cc.log('连接大厅服务器成功');
    },
    btn_login: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_login);
        p.writeString(this.loginEB.string);
        p.writeString('123456');
        NetworkLobby.send(p);
        p = null;
    },
    //登录
    onHanderLogin: function (self, pack) { },
    // 登录返回
    onHanderLoginRet: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.nickname = pack.readString();
        obj.level = pack.readInt();
        obj.exp = pack.readInt();
        obj.gold = pack.readInt();
        cc.log('登录成功:', obj);
        self.playerID = obj.id;
        self.playerGoldLab.string = obj.gold;
        self.enterGame();
    },
    //进入游戏G-1
    enterGame: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_enter);
        p.writeInt(Number(this.themeIdEB.string));
        NetworkLobby.send(p);
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
        p.writeInt(self.playerID);
        NetworkGame.send(p);
    },

    onHanderGameLogin: function (self, pack) { },
    onHanderGameLoginRet: function (self, pack) {
        cc.log('登录游戏服务器成功');
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join);
        p.writeInt(Number(self.themeIdEB.string));
        NetworkGame.send(p);
    },

    onHanderJoin: function () { },
    //加入房间返回
    onHanderJoinRet: function (self, pack) {
        var obj = new Object();
        obj.houseID = pack.readInt();
        obj.num = pack.readInt();
        obj.players = new Array();
        for (var i = 0; i < obj.num; i++) {
            var o = new Object();
            o.key = pack.readInt();
            o.name = pack.readString();
            obj.players.push(o);
        }
        Global.houseID = obj.houseID;
        cc.log('加入房间', obj);
    },
    // 下注返回
    onHanderBetRet: function (self, pack) {
        if (self.themeIdEB.string === '1' || self.themeIdEB.string === '2') {  //海盗主题||龙主题
            //下注回调
            var obj = new Object();
            var length = pack.readInt();
            var a = new Array(); var b = new Array(); var c = new Array();
            for (var i = 0; i < length; i++) {
                if (i <= 4)
                    a.push(pack.readByte());
                else if (i >= 5 && i <= 9)
                    b.push(pack.readByte());
                else if (i >= 10)
                    c.push(pack.readByte());
            }
            obj.matrix = [a, b, c];
            var arr = new Array();
            //spin结果
            obj.lineNum = pack.readInt();
            for (var i = 0; i < obj.lineNum; i++) {
                var l = new Object();
                l.type = pack.readByte();
                l.length = pack.readShort();
                arr.push(l);
            }
            obj.lines = arr;
            obj.myGold = pack.readInt();
            obj.winGold = pack.readInt();   //中奖金额
            obj.profitGold = pack.readInt();//纯利润
            obj.level = pack.readInt();
            obj.exp = pack.readInt();
            if (self.themeIdEB.string === '1') {
                obj.specialLength = pack.readInt();
                obj.specialArr = new Array();
                for (var i = 0; i < obj.specialLength; i++) {
                    obj.specialArr.push(pack.readInt());
                }
                if (obj.specialLength > 0)
                    cc.log('海盗主题——触发特殊玩法');
            } else if (self.themeIdEB.string === '2') {
                obj.isMini = pack.readByte();
                obj.miniJackpot = pack.readInt();
                if (obj.isMini === 1)
                    cc.log('龙主题——获得MiniJackpot:', obj.miniJackpot);
            }
            obj.jackpot = pack.readInt();
            if (obj.jackpot > 0) {
                cc.log('赢取奖池大奖：', obj.jackpot);
            }
            if (self.toggle.isChecked || obj.jackpot > 0) {
                cc.log(a);
                cc.log(b);
                cc.log(c);
                cc.log('中奖路线结果', obj.lines);
            }
            self.countResult(obj);
        } else if (self.themeIdEB.string === '100') {   //777主题
            var obj = new Object();
            var length = pack.readInt();
            obj.matrix = new Array();
            for (var i = 0; i < length; i++) {
                obj.matrix.push(pack.readByte());
            }
            obj.myGold = pack.readInt();
            obj.winGold = pack.readInt();   //中奖金额
            obj.profitGold = pack.readInt();//纯利润
            obj.level = pack.readInt();
            obj.exp = pack.readInt();
            obj.jackpot = pack.readInt();
            if (self.toggle.isChecked) {
                if (obj.jackpot > 0) {
                    obj.jackpotType = pack.readByte();
                    cc.log('赢取jackpot大奖：', obj.jackpot, '类型：', obj.jackpotType);
                }
                cc.log('中奖结果：', obj.matrix);
                if (obj.winGold > 0)
                    cc.log("中奖，金额：", obj.winGold);
            }
            self.countResult(obj);
        }
        if (self.toggle.isChecked)
            cc.log('整体结果：', obj);
        obj = null;
    },

    countResult: function (result) {
        if (result.winGold > 0)
            this.allWinNum++;
        this.allBetNum++
        this.playerGoldLab.string = Number(this.playerGoldLab.string) + result.winGold;
        this.allWinGold += result.winGold;
        var profit = result.winGold - Number(this.betOneGoldEB.string) * Number(this.linesEB.string);
        this.goldChangeArr.push(Number(this.playerGoldLab.string));
        this.oneGoldChangeArr.push(profit);

        this.again_spin();
    },
    again_spin: function () {
        if (this.spinNum >= Number(this.ranNumEB.string)) {
            this.isSpining = false;
            var win = this.allWinNum / this.allBetNum * 100;
            cc.log('总spin次数：', this.allBetNum, '中奖次数：', this.allWinNum, '中奖率：', win);
            var rvt = this.allWinGold / this.allBetGold * 100;
            cc.log('总投出：', this.allBetGold, '总收入：', this.allWinGold, '回报率：', rvt, '%');
            this.wave.createPlayerGoldWave(this.goldChangeArr, this.playerInitGold);
            this.wave.createLoseAndWinWave(this.oneGoldChangeArr);
            return;
        }
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet);
        p.writeInt(Number(this.betOneGoldEB.string));
        NetworkGame.send(p);
        this.playerGoldLab.string = Number(this.playerGoldLab.string) - Number(this.betOneGoldEB.string) * Number(this.linesEB.string);
        this.allBetGold += (Number(this.betOneGoldEB.string) * Number(this.linesEB.string));
        this.spinNum++;
        this.spinNumLab.string = this.spinNum;
    },
    // 按钮调用
    btn_spin: function () {
        if (this.isSpining) { return; }

        this.isSpining = true;
        this.goldChangeArr = new Array();    //每spin一次总金额的变化
        this.oneGoldChangeArr = new Array(); //每spin一次输赢金额的变化
        this.playerInitGold = Number(this.playerGoldLab.string);
        this.spinNum = 0;
        this.allBetGold = 0;    //总投出金额
        this.allWinGold = 0;
        this.allBetNum = 0;
        this.allWinNum = 0;

        this.again_spin();
    },
    // 下注测试
    btn_betTest: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_TEST, EnumType.SecondCommand.SC_PressureTest_Bet);
        p.writeInt(Number(this.ranNumEB.string));
        p.writeInt(Number(this.betOneGoldEB.string));
        NetworkGame.send(p);
        cc.log('请求服务器计算,计算次数越大等待越久，请等待…');
    },
    onHanderBetTest: function (self, pack) {
        var obj = new Object();
        obj.gold = pack.readInt();
        obj.betNum = pack.readInt();   //下注次数
        obj.winNum = pack.readInt();    //中奖次数
        obj.aa = pack.readString(); //中奖率
        obj.toss = pack.readInt();  //总投出
        obj.income = pack.readInt();    //总收入
        obj.bb = pack.readString(); //回报率
        self.playerGoldLab.string = obj.gold;
        cc.log('收到结果');
        cc.log('下注次数：', obj.betNum);
        cc.log('中奖次数：', obj.winNum);
        cc.log("总投出：", obj.toss);
        cc.log("总收入：", obj.income);
        cc.log('回报率:', Number(obj.bb) * 100, '%');
        cc.log('中奖率:', Number(obj.aa) * 100, '%');
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
