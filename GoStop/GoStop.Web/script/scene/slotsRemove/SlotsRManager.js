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
        bgAnim: cc.Node,

        expBar: cc.ProgressBar,
        expAnim: cc.Animation,

        jackpotNode: cc.Node,
        shopPrefab: cc.Prefab,

        allLine: 9,   //路线总数
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
        // this.oneBetArr = [10, 20, 30];//一次单注下注额度
        this.nowOneBet = this.oneBetArr[0]; //当前单注金额    
        this.otherPlayers = cc.find('Canvas/Players/GameOtherPlayers').getComponent('GameOtherPlayers');
        this.matrixManager = cc.find('Canvas/SlotsMatrix').getComponent('RMSManager');
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
        this.myBigWinAnim.active = false;
        this.jackpots = this.jackpotNode.getComponent('Jackpot');
        this.openShopBtn = this.myInfoNode.getChildByName('Jetton').getComponent(cc.Button);
        this.shop = cc.instantiate(this.shopPrefab).getComponent('Shop');
        cc.find('Canvas').addChild(this.shop.node);
        this.shop.init(this.playerGold);

        this.buttonManagger();
        this.touchEvent();
        this.expUp();

        this.initialSize = this.matrixManager.initialSize;   //获取矩阵初始图片的Size
        this.nowBetGold.string = (this.nowOneBet * this.allLine).toString();
        this.playerGold.string = PlayerInfo.gold.toString();
        this.lab_myName.string = PlayerInfo.nickname;

        // this.bgAnim.runAction(cc.moveTo(0.8, this.bgAnim.getPositionX(), 146));
        this.joinHouse();
    },
    //加入房间
    joinHouse: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_join);
        p.writeInt(Global.gameID);
        NetworkGame.send(p);
        cc.log('加入房間：', Global.gameID);
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
                this.dialAwardUI.openLevelAwardUI(this);
                this.isUpgrade = true;
                AudioManager.playAudio('level_up');
            }
        }
    },

    levelAwardOver: function () {
        this.isUpgrade = false;
        this.resultCount(this.betResult.resultList[this.resultIndex]);
    },

    //收到下注返回后摇动老虎机
    spinSlots: function (result) {
        if (this.chestsAward.node.active) return;
        this.bonusNow.string = result.bonusNow;
        this.bonusMax.string = result.bonusMax;
        this.winTipsUI.closeWinTips();
        this.expUp(result);
        this.isSpining = true;
        this.resultIndex = 0;   //计算结果次数叠加
        this.betResult = result;    //获取下注结果
        this.lastGold = 0;
        this.resultMatrix = this.betResult.resultList[this.resultIndex].matrix;
        AudioManager.setMusicVolume(0);
        AudioManager.playAudio('spinning');
        this.matrixManager.stopAllRunScale();   //开始时停止提示动画
        PlayerInfo.gold += -(this.nowOneBet * this.allLine);
        this.playerGold.string = PlayerInfo.gold.toString();
        this.lineTipsMgr.closeLineTips();   //重新开始，关闭连线提示
        this.matrixManager.startAllRun(this.betResult.resultList[this.resultIndex].matrix);   //spin开始播放转动动画
        // 停止滚动动画
        this.scheduleOnce(function () {
            if (!this.isUpgrade)
                this.resultCount(this.betResult.resultList[this.resultIndex]);
        }, Global.spinTime + 0.3);
    },
    //spin结束，滚动停止，计算结果
    resultCount: function (resultList) {
        AudioManager.setMusicVolume(1); //恢复背景音乐的播放
        var time = 0.1;
        //判断是否是累计奖励
        if (this.betResult.isCanUseBonus && this.betResult.bonusArr.length > 0) {
            time = this.matrixManager.bonusAward(this.betResult.bonusArr);
        }
        this.showResult(resultList, time);
    },
    // 再次检查矩阵结果
    againResultCount: function () {
        this.matrixManager.stopAllRunScale();   //停止提示动画
        // 掉落图片填补空白区域
        this.resultIndex++;
        for (var i = 0; i < this.resultIndex; i++) {
            this.lastGold += this.betResult.resultList[i].oneWinGold; //取上一次中奖金额
        }
        var time = this.matrixManager.moveDownSprite(this.betResult.resultList[this.resultIndex].matrix);
        // 如果还中奖，继续动画提示
        this.showResult(this.betResult.resultList[this.resultIndex], time);

    },
    // 显示结果
    showResult: function (resultList, time) {
        this.scheduleOnce(function () {
            if (resultList.lines.length > 0) {
                this.winTipsUI.closeWinTips();
                if (this.betResult.jackpot > 0) // jackpot大奖判断
                    this.winTipsUI.openWinTips(this.betResult.jackpot, 0, this.lastGold);
                else if (this.betResult.isMini === 1)
                    this.winTipsUI.openWinTips(this.betResult.miniJackpot, 1, this.lastGold);
                else if (this.betResult.winGold / Number(this.nowBetGold.string) >= 4)   // 中大奖判断
                    this.winTipsUI.openWinTips(resultList.oneWinGold, -1, this.lastGold);
                else if (this.betResult.winGold / Number(this.nowBetGold.string) < 4)
                    this.winTipsUI.openWinTips(resultList.oneWinGold, null, this.lastGold);
                this.lineTipsMgr.openLineTisp_Remove(resultList.lines, this);  //连线提示
            } else {
                PlayerInfo.gold = this.betResult.myGold;
                this.playerGold.string = PlayerInfo.gold;
                this.isSpining = false;
            }

        }, time);
    },
    // 连线提示结束，移除中奖图案
    removeWinSprite: function () {
        var time = this.matrixManager.removeSprite(this.betResult.resultList[this.resultIndex].replaceList);
        this.scheduleOnce(function () {
            this.againResultCount();
        }, time);
    },
    /**修改下注金额 */
    alterBetGold: function (betGold) {
        this.nowOneBet = betGold;
        this.nowBetGold.string = betGold * this.allLine;
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
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo, this.onHanderBonusInfo, this);   //玩家奖励信息
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo_ret, this.onHanderBonusInfoRet, this);
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
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_superAward_notice, this.onHanderSuperAwardNotice, this);   //中大奖后通知房间内的其他玩家（头像闪烁）
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo, this.onHanderBonusInfo, this);   //玩家奖励信息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bonusInfo_ret, this.onHanderBonusInfoRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_HALLMass, EnumType.SecondCommand.SC_HALLMass_award_notice, this.onHanderBetNotice, this);

        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ERROR, EnumType.SecondCommand.SC_ERROR_game, this.onHanderErrorGame, this); ///游戏错误消息
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_close, this.onHanderNetCloseGame, this); ///游戏服务器连接
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_game_error, this.onHanderNetErrorGame, this); ///游戏服务器连接关闭关闭
    },
});
