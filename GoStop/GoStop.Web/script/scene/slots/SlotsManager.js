var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');

var PlayerInfo = require("PlayerInfo");
var Mod_Level = require("Mod_Level");
var Mod_Game = require('Mod_Game');
var Tips = require("Tips");
var Global = require("Global");
var AudioManager = require("AudioManager");

cc.Class({
    extends: cc.Component,

    properties: {
        matrixAtlas: cc.SpriteAtlas,

        lab_myName: cc.Label,
        lab: cc.Prefab,
        wildLab: cc.Prefab,
        bgAnim: cc.Node,

        expBar: cc.ProgressBar,
        expAnim: cc.Animation,

        jackpotNode: cc.Node,
        shopPrefab: cc.Prefab,
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
        this.nowOneBet = Number(this.oneBetArr[0]); //当前单注金额  
        this.allLine = mod_Game[0].line;    //当前主题的路线输  
        this.otherPlayers = cc.find('Canvas/Players/GameOtherPlayers').getComponent('GameOtherPlayers');
        this.matrixArr = cc.find('Canvas/SlotsMatrix/Matrix').getComponentsInChildren('MatrixSprite');
        this.lineTipsMgr = cc.find('Canvas/SlotsMatrix/LineTipsManager').getComponent('LineTipsManager');
        this.lineTipsMgr.initLineTips(this.allLine);
        this.chestsAward = cc.find('Canvas/ChestsAward').getComponent('ChestsAward');
        this.chestsAward.initChests();
        this.chat = cc.find('Canvas/Chat').getComponent('Chat');

        this.Buttons = cc.find('Canvas/Buttons');
        this.playerGold = cc.find('Canvas/Players/Self/Gold').getComponent(cc.Label);  //玩家总金额
        this.nowBetGold = cc.find('TotalBet/BetGold', this.Buttons).getComponent(cc.Label);  //当前总的下注金额
        this.alterBetBtn = cc.find('TotalBet', this.Buttons).getComponent(cc.Button);  //修改下注额
        this.spinAuto = cc.find('SpinButton', this.Buttons).getComponent('SpinAuto');  //摇动老虎机按钮
        this.spinAuto.initSinAuto(this);
        this.menuBtn = cc.find('Menu', this.Buttons).getComponent(cc.Button);        //菜单按钮
        this.menuUI = cc.find('Canvas/MenuUI').getComponent('MenuUI');
        this.exitBtn = cc.find('Exit', this.menuUI.node).getComponent(cc.Button);
        this.helpBtn = cc.find('Help', this.menuUI.node).getComponent(cc.Button);
        this.gameHelpUI = cc.find('Canvas/GameHelpUI').getComponent('GameHelpUI');
        this.alterBet = cc.find('Canvas/AlterBetUI').getComponent('AlterBetUI');    //修改下注额
        this.alterBet.initAlterBetUI();
        this.bonusNow = cc.find('Canvas/AccumulationBonus/Now').getComponent(cc.Label);  //当前累积下注额
        this.bonusMax = cc.find('Canvas/AccumulationBonus/Max').getComponent(cc.Label);  //达到开启奖励下注额
        this.winTipsUI = cc.find('Canvas/WinTipsUI').getComponent('WinTipsUI');
        this.myInfoNode = cc.find('Canvas/Players/Self');
        this.myBigWinAnim = cc.find('PlayerBigWinAnim', this.myInfoNode);
        this.dialAwardUI = cc.find('Canvas/DialAwardUI').getComponent('DialAwardUI');
        this.dialAwardUI.initDialAwardUI();
        if (Global.gameID === 7) {
            this.cupPlay = cc.find('Canvas/MGame_Cup').getComponent('CupPlay'); //杯子玩法
            this.cupPlay.initCupPlay(this.playerGold);
        }
        this.openShopBtn = this.myInfoNode.getChildByName('Jetton').getComponent(cc.Button);
        this.shop = cc.instantiate(this.shopPrefab).getComponent('Shop');
        cc.find('Canvas').addChild(this.shop.node);
        this.shop.init(this.playerGold);

        if (Global.gameID === 1)
            this.timelimitRank = cc.find('Canvas/TimeLimitRank').getComponent("TimeLimitRank");

        this.myBigWinAnim.active = false;
        this.jackpots = this.jackpotNode.getComponent('Jackpot');
        this.buttonManagger();
        this.changeArrayTwo();
        this.touchEvent();
        this.expUp();

        this.initialSize = this.matrixTwo[0][0].initialSize;   //获取矩阵初始图片的Size
        this.nowBetGold.string = (this.nowOneBet * this.allLine).toString();
        this.playerGold.string = PlayerInfo.gold.toString();
        this.lab_myName.string = PlayerInfo.nickname;

        this.bgAnim.runAction(cc.moveTo(0.8, this.bgAnim.getPositionX(), 146));
        this.joinHouse();
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

        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo);
        NetworkGame.send(p);

        // 杯子主题下，验证上次玩法是否未完成
        if (Global.gameID === 7) {
            var isOpenCupPlay = pack.readInt();
            cc.log('上次杯子玩法完成情况：', isOpenCupPlay);
            if (isOpenCupPlay !== 0)
                self.cupPlay.openCupActivety();
        }

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
        var arrTemp = new Array();
        for (var i = 0; i < length; i++) {
            if (i % 5 === 0)
                arrTemp = new Array();
            arrTemp.push(pack.readByte());
            if (i % 5 === 4) {
                obj.matrix.push(arrTemp);
                cc.log(arrTemp);    //log显示矩阵结果
            }
        }

        // Alice玩法替换列，wild替换列数 1-5 数值，0表示没有替换
        if (Global.gameID === 6)
            obj.changeColumn = pack.readInt();

        obj.freeNum = 0;
        // 冰魔法主题增加免费次数
        if (Global.gameID === 4 || Global.gameID === 6 || Global.gameID === 7) {
            obj.freeNum = pack.readInt();
        }

        // 杯子玩法特殊奖励
        obj.isOpenCupPlay = 0;  //是否开启了杯子玩法，0表示未开启
        if (Global.gameID === 7) {
            obj.isOpenCupPlay = pack.readInt();
            cc.log('是否开启杯子玩法：', obj.isOpenCupPlay);
        }

        // 读取累积奖励配置
        obj.isCanUseBonus = pack.readByte();
        if (obj.isCanUseBonus) {
            obj.bonusArr = new Array();
            var l = pack.readInt();
            for (var i = 0; i < l; i++) { obj.bonusArr.push(pack.readShort()); }
        }
        obj.bonusNow = pack.readInt();
        obj.bonusMax = pack.readInt();
        obj.bonusNum = pack.readByte();
        self.bonusNow.string = obj.bonusNow;
        self.bonusMax.string = obj.bonusMax;
        if (obj.freeNum > 0)
            self.spinAuto.showBonusAward(obj.freeNum, "free");
        else
            self.spinAuto.showBonusAward(obj.bonusNum);

        //spin结果
        var arr = new Array();
        obj.lineNum = pack.readInt();
        for (var i = 0; i < obj.lineNum; i++) {
            var l = new Object();
            l.type = pack.readByte();
            l.length = pack.readShort();
            arr.push(l);
        }

        obj.lines = arr;
        obj.myGold = pack.readInt();
        // 《富兰克林》玩法特有数据
        obj.wildGold = 0;
        if (Global.gameID === 5)
            obj.wildGold = pack.readInt();  //出现wild赢取的奖金

        obj.winGold = pack.readInt();   //中奖金额
        obj.profitGold = pack.readInt();//纯利润
        obj.level = pack.readInt();
        obj.exp = pack.readInt();
        if (Global.gameID === 1) {
            obj.specialLength = pack.readInt();
            obj.specialArr = new Array();
            for (var i = 0; i < obj.specialLength; i++) {
                obj.specialArr.push(pack.readInt());
            }
            if (obj.specialLength > 0)
                self.chestsAward.getBoxList();
        } else if (Global.gameID === 2) {
            obj.isMini = pack.readByte();
            obj.miniJackpot = pack.readInt();
            self.jackpots.jackpot_dragon(null, obj.miniJackpot);
            if (obj.isMini === 1)
                cc.log('获得MiniJackpot:', obj.miniJackpot);
        }

        obj.jackpot = pack.readInt();
        if (obj.jackpot > 0)
            cc.log('赢取奖池大奖：', obj.jackpot);
        // cc.log('下注结果', obj);
        self.resultMatrix = obj.matrix;
        self.spinSlots();
        self.betResult = obj;
        self.expUp(obj);
        self.isSpining = true;
        obj = null;
    },


    // 玩家获取奖池大奖通知
    onHanderBetNotice: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.gold = pack.readInt();
    },
    //中大奖通知其他玩家
    onHanderSuperAwardNotice: function (self, pack) {
        var pid = pack.readInt();
        if (pid === PlayerInfo.id) {
            self.myBigWinAnim.active = true;
            self.scheduleOnce(function () {
                self.myBigWinAnim.active = false;
            }, 3)
        } else
            self.otherPlayers.playBigWinEffect(pid);
    },
    // 玩家奖励信息
    onHanderBonusInfo: function () { },
    onHanderBonusInfoRet: function (self, pack) {
        var obj = new Object();
        obj.nowExp = pack.readInt();
        obj.maxExp = pack.readInt();
        obj.bonusNum = pack.readByte();
        self.spinAuto.showBonusAward(obj.bonusNum);
        self.bonusNow.string = obj.nowExp;
        self.bonusMax.string = obj.maxExp;
        cc.log('累积奖励：', obj);
    },
    onHanderPlayerActivityRet: function (self, pack) {
        var aa = pack.readInt();    //活动结算奖励的钱
        var money = pack.readInt(); //玩家账号金额
        // cc.log('活动结束奖励金额：', aa);
        // cc.log('目前玩家账号金额：', money);
    },
    onHanderRankAndPrizeRet: function (self, pack) {
        var obj = new Object();
        // 前20玩家排名
        var rankLength = pack.readInt();
        obj.rankList = new Array();
        for (var i = 0; i < rankLength; i++) {
            var r = new Object();
            r.rank = pack.readInt();
            r.name = pack.readString();
            obj.rankList.push(r);
        }
        // 积分排名奖励说明
        var prizeLength = pack.readInt();
        obj.prizeList = new Array();
        for (var i = 0; i < prizeLength; i++) {
            var p = new Object();
            p.rank = pack.readInt();
            p.prizeGold = pack.readInt();   //奖励金额
            obj.prizeList.push(p);
        }
        obj.myRank = pack.readInt();
        obj.myIntegral = pack.readInt();    //我的积分
        obj.residueTime = pack.readInt();   //剩余时间
        obj.nowPoolGold = pack.readInt();
        // 显示前三排名
        var topLength = pack.readInt();
        obj.topList = new Array();
        for (var i = 0; i < topLength; i++) {
            var t = new Object();
            t.rank = pack.readInt();
            t.name = pack.readString();
            t.integral = pack.readInt();
            obj.topList.push(t);
        }
        self.timelimitRank.updateRank(obj);
        // cc.log('积分活动数据：', obj);
    },
    //当前节点触屏事件
    touchEvent: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                if (self.menuUI.node.active) {
                    //如果触摸的点不在节点的矩形上
                    if (!self.touchRect(self.menuUI.node, touch))
                        self.menuUI.closeMenu();
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
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet);
        p.writeInt(this.nowOneBet);
        NetworkGame.send(p);
    },
    //按钮管理
    buttonManagger: function () {
        // 打开修改注额界面
        this.alterBetBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.spinAuto.bonus.active) {
                Tips.showTips('The bonus or free state cannot be opened!');
                return;
            }

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
        // 游戏帮助
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.menuUI.closeMenu();
            this.gameHelpUI.openGameHelpUI();
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
            this.isUpgrade = false; //是否升级
            var expMax = Mod_Level.GetModData(level.level);
            this.expAnim.node.active = true;
            this.expAnim.node.setPosition(this.spinAuto.node.getPosition());
            var move = cc.moveTo(0.7, cc.v2(this.myInfoNode.getPosition()));
            this.expAnim.node.runAction(move);
            this.scheduleOnce(function () { this.expAnim.node.active = false; }, 0.9);
            this.expBar.progress = level.exp / Number(expMax[0].exp);
            if (level.level > PlayerInfo.level) {     //升级处理
                PlayerInfo.level = level.level;
                this.dialAwardUI.openLevelAwardUI(this);
                this.isUpgrade = true;
                AudioManager.playAudio('level_up');
            }
        }
    },

    levelAwardOver: function () {
        this.isUpgrade = false;
        this.resultCount();
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
        PlayerInfo.gold += -(this.nowOneBet * this.allLine);
        this.playerGold.string = PlayerInfo.gold.toString();
        this.lineTipsMgr.closeLineTips();   //重新开始，关闭连线提示
        for (var i = 0; i < this.matrixArr.length; i++) { this.matrixArr[i].startRun(); }
        this.scheduleOnce(function () {
            if (!this.isUpgrade)
                this.resultCount();
        }, Global.spinTime + 0.3);
    },
    //spin结束，停止转动，计算结果
    resultCount: function () {
        AudioManager.setMusicVolume(1);
        // 杯子主题特殊玩法
        if (this.betResult.isOpenCupPlay !== 0) {
            this.cupPlay.openCupActivety();
            this.spinAuto.closeAuto();
            this.isSpining = false;
        }
        // 开启特殊奖励判断,《海盗主题》特有
        if (this.betResult.specialLength > 0) {
            this.chestsAward.getBoxList();
            this.spinAuto.closeAuto();
            this.isSpining = false;
        } else if (this.betResult.wildGold !== 0) {
            var g = 25 * (this.nowOneBet / Number(this.oneBetArr[0]));
            // 在wild图案上显示金额
            for (var i = 0; i < this.resultMatrix.length; i++) {
                for (var j = 0; j < this.resultMatrix[i].length; j++) {
                    if (this.resultMatrix[i][j] === 0)
                        this.matrixTwo[i][j].showWildGold(g);
                }
            }
            this.winTipsUI.showWildGold(this.betResult.wildGold, this);
        } else
            this.showResult();
    },
    // 显示结果
    showResult: function () {
        var time1 = 0.1;
        var time2 = 0.1;
        // Alice主题替换列
        if (Global.gameID === 6 && this.betResult.changeColumn > 0) {
            var c = this.betResult.changeColumn - 1;
            for (var i = 0; i < this.matrixTwo.length; i++) {
                time1 = this.matrixTwo[i][c].bonusAward();
            }
        }
        // 累计奖励替换图标
        this.scheduleOnce(function () {
            if (this.betResult.isCanUseBonus && this.betResult.bonusArr.length > 0) {
                this.betResult.bonusArr.forEach(function (e) {
                    var row = Math.floor(e / 5);
                    var column = e % 5;
                    time2 = this.matrixTwo[row][column].bonusAward();
                }, this);
            }
            this.scheduleOnce(function () {
                this.isSpining = false;
                if (this.betResult.jackpot > 0) // jackpot大奖判断
                    this.winTipsUI.openWinTips(this.betResult.jackpot, 0);
                else if (this.betResult.isMini === 1)
                    this.winTipsUI.openWinTips(this.betResult.miniJackpot, 1);
                else if (this.betResult.winGold / Number(this.nowBetGold.string) >= 4)   // 中大奖判断
                    this.winTipsUI.openWinTips(this.betResult.winGold, -1);
                else if (this.betResult.winGold / Number(this.nowBetGold.string) < 4)
                    this.winTipsUI.openWinTips(this.betResult.winGold);

                PlayerInfo.gold = this.betResult.myGold;
                this.playerGold.string = PlayerInfo.gold.toString();
                this.lineTipsMgr.openLineTisp(this.betResult.lines, this.matrixTwo, this.initialSize);  //连线提示
            }, time2);
        }, time1)


    },
    /**特殊奖励结束 */
    chestsAwardOver: function (awardGold) {
        PlayerInfo.gold += awardGold;
        this.playerGold.string = PlayerInfo.gold.toString();
        this.showResult();
    },
    /**修改下注金额 */
    alterBetGold: function (betGold) {
        this.nowOneBet = betGold;
        this.nowBetGold.string = betGold * this.allLine;
    },
    /**转换成二维矩阵 */
    changeArrayTwo: function () {
        this.matrixTwo = new Array();
        var arrTemp = new Array();
        for (var i = 10; i < this.matrixArr.length; i++) {
            if (i % 5 === 0)
                arrTemp = new Array();
            arrTemp.push(this.matrixArr[i]);
            if (i % 5 === 4)
                this.matrixTwo.push(arrTemp);
        }
        for (var i = 0; i < 10; i++) {
            if (i % 5 === 0)
                arrTemp = new Array();
            arrTemp.push(this.matrixArr[i]);
            if (i % 5 === 4)
                this.matrixTwo.push(arrTemp);
        }

        for (var i = 0; i < this.matrixTwo.length; i++) {
            for (var j = 0; j < this.matrixTwo[i].length; j++) { this.matrixTwo[i][j].init(this, i, j); }
        }
    },
    update: function (dt) {

    },

    onHanderJoin: function () { },
    onHanderLeave: function () { },
    onHanderBet: function () { },
    onHanderLottery: function () { },

    onHanderInviteFirendsAccept: function () { },
    onHanderInviteFirendsAcceptRet: function (self, pack) {
        cc.log('邀请返回结果：', pack.readByte());
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join, this.onHanderJoin, this);///加入牌桌
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_ret, this.onHanderJoinRet, this); ///加入返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join_notice, this.onHanderJoinNotice, this); ///加入通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave, this.onHanderLeave, this); ///离开游戏
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_ret, this.onHanderLeaveRet, this); ///离开返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_leave_notice, this.onHanderLeaveNotice, this); ///离开通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo, this.onHanderBonusInfo, this);   //玩家奖励信息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo_ret, this.onHanderBonusInfoRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_playerActivity_ret, this.onHanderPlayerActivityRet, this);  //限时活动结束通知
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_activityRankAndPrize_ret, this.onHanderRankAndPrizeRet, this);  //限时活动数据刷新通知
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
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo, this.onHanderBonusInfo, this);   //玩家奖励信息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo_ret, this.onHanderBonusInfoRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_playerActivity_ret, this.onHanderPlayerActivityRet, this);  //限时活动结束通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_activityRankAndPrize_ret, this.onHanderRankAndPrizeRet, this);  //限时活动数据刷新通知
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_HALLMass, EnumType.SecondCommand.SC_HALLMass_award_notice, this.onHanderBetNotice, this);

        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ERROR, EnumType.SecondCommand.SC_ERROR_game, this.onHanderErrorGame, this); ///游戏错误消息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_close, this.onHanderNetCloseGame, this); ///游戏服务器连接
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_error, this.onHanderNetErrorGame, this); ///游戏服务器连接关闭关闭
    },
});
