var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');

var PlayerInfo = require("PlayerInfo");
var Mod_Level = require("Mod_Level");
var Mod_Game = require("Mod_Game");
var Tips = require("Tips");
var Global = require("Global");
var AudioManager = require("AudioManager");

cc.Class({
    extends: cc.Component,

    properties: {
        matrixAtlas: cc.SpriteAtlas,

        myName: cc.Label,
        nowBetGold: cc.Label,
        lab: cc.Prefab,
        shopPrefab: cc.Prefab,

        expBar: cc.ProgressBar,
        expAnim: cc.Animation,

        betReduceBtn: cc.Button,
        betAddBtn: cc.Button,
        betMaxBtn: cc.Button,

        betGoldLab: cc.Label,
        wonGoldLab: cc.Label,

        modBetID: 1,    //读取bet配置表的id
    },

    // use this for initialization
    onLoad: function () {
        AudioManager.playMusic('bgm_theme');
        this.registerMsg(); //加载网络配置
        this.resultMatrix = new Array();    //服务器返回的spin结果
        this.betResult = new Object();  //下注服务器返回结果
        this.state = null;  //'jion':加入;'gaming':游戏中;'exit':退出
        this.isLoadMod = true;
        this.isSpining = false; //是否是在spin中

        var mod_Game = Mod_Game.GetModData(Global.gameID);
        this.oneBetArr = mod_Game[0].bet.split('|');//一次单注下注额度
        this.nowBetSub = 0; //当前单注数组下标
        this.nowOneBet = Number(this.oneBetArr[this.nowBetSub]); //当前单注金额   
        this.otherPlayers = cc.find('Canvas/Players/GameOtherPlayers').getComponent('GameOtherPlayers');
        this.matrixArr = cc.find('Canvas/SlotsMatrix/Matrix').getComponentsInChildren('MatrixSprite777');
        this.chestsAward = cc.find('Canvas/ChestsAward').getComponent('ChestsAward');
        this.chestsAward.initChests();
        this.chat = cc.find('Canvas/Chat').getComponent('Chat');
        this.changeArrayTwo();
        this.Buttons = cc.find('Canvas/Buttons');
        this.playerGold = cc.find('Canvas/Players/Self/Gold').getComponent(cc.Label);  //玩家总金额
        this.alterBetBtn = cc.find('TotalBet', this.Buttons).getComponent(cc.Button);  //修改下注额
        this.spinAuto = cc.find('SpinButton', this.Buttons).getComponent('SpinAuto');  //摇动老虎机按钮
        this.spinAuto.initSinAuto(this);
        this.menuBtn = cc.find('Menu', this.Buttons).getComponent(cc.Button);        //菜单按钮
        this.menuUI = cc.find('Canvas/MenuUI').getComponent('MenuUI');
        this.exitBtn = cc.find('Exit', this.menuUI.node).getComponent(cc.Button);
        this.alterBet = cc.find('Canvas/AlterBetUI').getComponent('AlterBetUI');    //修改下注额
        this.winTipsUI = cc.find('Canvas/WinTipsUI').getComponent('WinTipsUI');
        this.myInfoNode = cc.find('Canvas/Players/Self/Icon');
        this.myBigWinAnim = cc.find('PlayerBigWinAnim', this.myInfoNode);
        this.myBigWinAnim.active = false;
        this.jackpots = cc.find('Canvas/Jackpot').getComponent('Jackpot');
        this.dialAwardUI = cc.find('Canvas/DialAwardUI').getComponent('DialAwardUI');
        this.dialAwardUI.initDialAwardUI();
        this.openShopBtn = cc.find('Canvas/Players/Self/Jetton').getComponent(cc.Button);
        this.shop = cc.instantiate(this.shopPrefab).getComponent('Shop');
        cc.find('Canvas').addChild(this.shop.node);
        this.shop.init(this.playerGold);

        this.buttonManagger();
        this.touchEvent();
        this.expUp();

        this.nowBetGold.string = this.nowOneBet;
        this.playerGold.string = PlayerInfo.gold.toString();
        this.joinHouse();
    },
    // init用于需要先加载Mod结束再初始化的数据
    init: function () {
        this.myName.string = PlayerInfo.nickname;
    },

    //加入房间
    joinHouse: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join);
        p.writeInt(Global.gameID);
        NetworkGame.send(p);
    },
    //离开房间
    exitHouse: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave);
        p.writeInt(Global.gameID);
        p.writeInt(Global.houseID);
        NetworkGame.send(p);
    },
    // 错误消息返回
    onHanderErrorGame: function (self, pack) {
        cc.log('游戏错误信息：', pack.readShort());
    },

    onHanderNetCloseGame: function (self, pack) {
        if (self.state === 'exit') {
            cc.director.loadScene('LobbyScene');
        }
    },

    onHanderNetErrorGame: function (self, pack) {

    },

    //加入房间返回
    onHanderJoinRet: function (self, pack) {
        //加入房间
        var obj = new Object();
        obj.houseID = pack.readInt();
        obj.num = pack.readInt();
        obj.players = new Array();
        for (var i = 0; i < obj.num; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.headType = pack.readInt();
            o.head = pack.readString();
            self.otherPlayers.playerJoin(o);
            obj.players.push(o);
        }
        Global.houseID = obj.houseID;

        self.jackpots.initJackpot(Global.gameID);
    },
    // 其他玩家加入牌桌通知
    onHanderJoinNotice: function (self, pack) {
        var obj = new Object();
        obj.pid = pack.readInt();
        obj.name = pack.readString();
        obj.headType = pack.readInt();
        obj.head = pack.readString();
        self.otherPlayers.playerJoin(obj);
    },
    // 离开返回
    onHanderLeaveRet: function (self, pack) {
        self.state = 'exit';
        NetworkGame.close();
        if (cc.sys.isBrowser)
            cc.director.loadScene('LobbyScene');
    },
    // 离开通知
    onHanderLeaveNotice: function (self, pack) {
        var obj = new Object();
        obj.pid = pack.readInt();
        obj.name = pack.readString();
        self.otherPlayers.playerExit(obj.pid);
    },
    // 下注返回
    onHanderBetRet: function (self, pack) {
        self.winTipsUI.closeWinTips();
        //下注回调
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
        obj.jackpotType = pack.readByte();
        obj.miniJackpot = pack.readInt();
        self.jackpots.jackpot_slots777(null, obj.miniJackpot);

        cc.log('下注结果', obj);
        self.resultMatrix = obj.matrix;
        self.spinSlots();
        self.betResult = obj;
        self.expUp(obj);
        self.isSpining = true;
        obj = null;
    },

    // 抽奖返回
    onHanderLotteryRet: function (self, pack) {
        cc.log('升级抽奖中奖金币：', pack.readInt());
    },
    // 获取宝箱列表
    getBoxList: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate);
        NetworkGame.send(p);
    },
    onHanderSpecialPirate: function (self, pack) { },
    onHanderSpecialPirateRet: function (self, pack) {
        var obj = new Object();
        obj.length = pack.readInt();
        obj.arr = new Array();
        for (var i = 0; i < obj.length; i++) {
            var o = new Object();
            o.id = pack.readInt();
            o.isRead = pack.readInt();
            o.gold = pack.readInt();
            o.isSpecial = pack.readInt();   //是否是特殊宝箱
            obj.arr.push(o);
        }
        self.boxList = obj.arr;
        cc.log('宝箱列表', obj);
    },
    /**开启宝箱 */
    openBox: function (boxID) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox);
        p.writeInt(boxID);
        NetworkGame.send(p);
        cc.log('请求开宝箱：', boxID);
    },
    onHanderOpenBox: function (self, pack) { },
    onHanderOpenBoxRet: function (self, pack) {
        var obj = new Object();
        obj.id = pack.readInt();
        obj.gold = pack.readInt();
        obj.isSpecial = pack.readInt();
        cc.log('开启宝箱:', obj);
        self.chestsAward.openCallback(obj);
    },
    // 玩家获取奖池大奖通知
    onHanderBetNotice: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.gold = pack.readInt();
        cc.log('奖池大奖通知', obj);
    },
    //中大奖通知其他玩家
    onHanderSuperAwardNotice: function (self, pack) {
        var pid = pack.readInt();
        if (pid !== PlayerInfo.id)
            self.otherPlayers.playBigWinEffect(pid);
    },
    //当前节点触屏事件
    touchEvent: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                if (self.menuUI.node.active) {
                    //如果触摸的点不在节点的矩形上
                    if (!self.touchRect(self.menuUI.node, touch)) {
                        self.menuUI.node.active = false;
                    }
                }
                self.otherPlayers.closePlayerMenu();
                return true;
            },
            onTouchMoved: function (touch, event) { },
            onTouchEnded: function (touch, event) { }
        }, self.Buttons);
    },
    touchRect: function (recthNode, touch) {
        //把触摸点根节点转到canvas节点下的Buttons节点
        var touchPos = this.Buttons.convertTouchToNodeSpace(touch);
        var rectPos = recthNode.getPosition();
        var rectSize = recthNode.getContentSize();
        //定义一个Rect
        var nodeRect = new cc.Rect(rectPos.x, rectPos.y, rectSize.width, rectSize.height);
        //判断是否点击到加注选择栏
        cc.log(nodeRect, touchPos);
        if (nodeRect.contains(touchPos)) {
            return true;
        }
        return false;
    },
    /**发送下注请求 */
    sendBetMsg: function () {
        // 下注
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet);
        p.writeInt(this.nowOneBet);
        NetworkGame.send(p);
        // cc.log('开始下注,单注注额：', this.nowOneBet);
    },
    //按钮管理
    buttonManagger: function () {
        // 打开修改注额界面
        this.alterBetBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.alterBet.openUI(this);
        }, this);
        // 菜单按钮
        this.menuBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.menuUI.openMenu();
        }, this);
        // 退出游戏回到大厅
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.exitHouse();
        }, this);
        this.betReduceBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.nowBetSub > 0) {
                this.nowOneBet = Number(this.oneBetArr[--this.nowBetSub]);
                this.betGoldLab.string = this.nowOneBet;
            }

        }, this);
        this.betAddBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.nowBetSub < this.oneBetArr.length - 1) {
                this.nowOneBet = Number(this.oneBetArr[++this.nowBetSub]);
                this.betGoldLab.string = this.nowOneBet;
            }
        }, this);
        this.betMaxBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.nowBetSub = this.oneBetArr.length - 1;
            this.nowOneBet = Number(this.oneBetArr[this.nowBetSub]);
            this.betGoldLab.string = this.nowOneBet;
        }, this);
         // 打开商城
        this.openShopBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.shop.openShop();
        }, this);
    },

    //玩家经验增加
    expUp: function (level) {
        if (!level) {
            var expMax = Mod_Level.GetModData(PlayerInfo.level);
            this.expBar.progress = PlayerInfo.exp / Number(expMax[0].exp);
        } else {
            var expMax = Mod_Level.GetModData(level.level);
            this.expAnim.node.active = true;
            this.expAnim.node.setPosition(this.spinAuto.node.getPosition());
            var move = cc.moveTo(0.7, cc.v2(this.myInfoNode.getPosition()));
            this.expAnim.node.runAction(move);
            this.scheduleOnce(function () { this.expAnim.node.active = false; }, 0.9);
            this.expBar.progress = level.exp / Number(expMax[0].exp);
            if(level.level > PlayerInfo.level){     //升级处理
                this.dialAwardUI.openLevelAwardUI();
                AudioManager.playAudio('level_up');
            }
        }
    },

    //收到下注返回后摇动老虎机
    spinSlots: function () {
        if (this.chestsAward.node.active) return;
        AudioManager.setMusicVolume(0);
        AudioManager.playAudio('spinning');
        for (var a = 0; a < this.matrixTwo.length; a++) {
            for (var b = 0; b < this.matrixTwo[a].length; b++) {
                this.matrixTwo[a][b].stopRunScale();    //开始时停止提示动画
            }
        }
        this.playerGoldChange(-this.nowOneBet);   //扣除下注总额
        for (var i = 0; i < this.matrixArr.length; i++) { this.matrixArr[i].startRun(); }
        this.scheduleOnce(function () {
            this.resultCount();
        }, Global.spinTime + 0.3);
    },
    //spin结束，计算结果
    resultCount: function () {
        this.isSpining = false;
        AudioManager.setMusicVolume(1);
        // 开启特殊奖励判断
        if (this.betResult.specialLength > 0) {
            this.chestsAward.openChestsAward(this.boxList);
            this.spinAuto.closeAuto();
        }
        // jackpot大奖判断
        if (this.betResult.jackpot > 0) {
            this.winTipsUI.openWinTips(this.betResult.jackpot, this.betResult.jackpotType);
            this.playMyBigWinEffect();
        } else if (this.betResult.winGold / Number(this.nowBetGold.string) >= 4) {   // 中大奖判断
            this.winTipsUI.openWinTips(this.betResult.winGold)
            this.playMyBigWinEffect();
        }else if (this.betResult.winGold / Number(this.nowBetGold.string) < 4)
            this.winTipsUI.openWinTips(this.betResult.winGold)

        this.wonGoldLab.string = this.betResult.winGold;
        PlayerInfo.gold = this.betResult.myGold;
        this.playerGold.string = PlayerInfo.gold;
    },
    playMyBigWinEffect: function () {
        this.myBigWinAnim.active = true;
        this.scheduleOnce(function () {
            this.myBigWinAnim.active = false;
        }, 3)
    },
    /**玩家的金额变化结算 */
    playerGoldChange: function (gold) {
        PlayerInfo.gold += gold;
        this.playerGold.string = PlayerInfo.gold;

    },
    /**转换成二维矩阵 */
    changeArrayTwo: function () {
        var m0 = new Array(); var m1 = new Array(); var m2 = new Array(); var m3 = new Array();
        for (var i = 0; i < this.matrixArr.length; i++) {
            if (i <= 2)
                m2.push(this.matrixArr[i]);
            else if (i >= 3 && i <= 5)
                m3.push(this.matrixArr[i]);
            else if (i >= 6 && i <= 8)
                m0.push(this.matrixArr[i]);
            else if (i >= 9 && i <= 11)
                m1.push(this.matrixArr[i]);
        }
        this.matrixTwo = [m0, m1, m2, m3];  //老虎机二维矩阵
        for (var i = 0; i < this.matrixTwo.length; i++) {
            for (var j = 0; j < this.matrixTwo[i].length; j++) { this.matrixTwo[i][j].init(this, i, j); }
        }
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.isLoadMod && Global.modMaxLen === Global.modCulLen) {
            this.init();
            this.isLoadMod = false;
        }
    },

    onHanderJoin: function () { },
    onHanderLeave: function () { },
    onHanderBet: function () { },
    onHanderLottery: function () { },

    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join, this.onHanderJoin, this);///加入牌桌
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_ret, this.onHanderJoinRet, this); ///加入返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_notice, this.onHanderJoinNotice, this); ///加入通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave, this.onHanderLeave, this); ///离开游戏
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_ret, this.onHanderLeaveRet, this); ///离开返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_notice, this.onHanderLeaveNotice, this); ///离开通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_HALLMass, EnumType.SecondCommand.SC_HALLMass_award_notice, this.onHanderBetNotice, this);

        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ERROR, EnumType.SecondCommand.SC_ERROR_game, this.onHanderErrorGame, this); ///游戏错误消息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_close, this.onHanderNetCloseGame, this); ///游戏服务器连接关闭
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_error, this.onHanderNetErrorGame, this); ///游戏服务器连接错误
    },

    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join, this.onHanderJoin, this);  //加入牌桌
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_ret, this.onHanderJoinRet, this); ///加入返回
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_notice, this.onHanderJoinNotice, this); ///加入通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave, this.onHanderLeave, this); ///离开游戏
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_ret, this.onHanderLeaveRet, this); ///离开返回
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_notice, this.onHanderLeaveNotice, this); ///离开通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_HALLMass, EnumType.SecondCommand.SC_HALLMass_award_notice, this.onHanderBetNotice, this);

        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ERROR, EnumType.SecondCommand.SC_ERROR_game, this.onHanderErrorGame, this); ///游戏错误消息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_close, this.onHanderNetCloseGame, this); ///游戏服务器连接
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_error, this.onHanderNetErrorGame, this); ///游戏服务器连接关闭关闭
    },
});

