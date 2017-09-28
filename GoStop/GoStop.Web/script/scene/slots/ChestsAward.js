var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');
var Tips = require('Tips');

cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
        mapUp: cc.Node,
        mapDown: cc.Node,

        small_Node: cc.Node,
        small_Gold: cc.Label,
        big_Node: cc.Node,
        big_Gold: cc.Label,
    },

    // use this for initialization
    initChests: function () {
        this.speed = 12;
        this.node.active = true;
        this.isOpenAwardOver = true;   //开启奖励是否结束
        this.slotsManager = cc.find('SlotsManager').getComponent('SlotsManager');
        this.chestsArr = cc.find('Mask/ChestsList', this.node).getComponentsInChildren('Chests');
        for (var i = 0; i < this.chestsArr.length; i++) { this.chestsArr[i].init(this); }
        this.registerMsg();
        // this.openChestsAward();
        this.node.active = false;

        this.eventIntercept();
    },
    /**开启特殊奖励 */
    openChestsAward: function (boxList) {
        this.isOpenAwardOver = true;   //开启奖励是否结束
        this.mask.setContentSize(this.mask.width, 100);
        this.mapUp.setPosition(cc.v2(this.mapUp.getPositionX(), 50));
        this.mapDown.setPosition(cc.v2(this.mapDown.getPositionX(), -50));
        var scheCallback = function () {
            this.mask.setContentSize(this.mask.width, this.mask.height + this.speed);
            this.mapUp.setPosition(cc.v2(this.mapUp.getPositionX(), this.mapUp.getPositionY() + this.speed / 2));
            this.mapDown.setPosition(cc.v2(this.mapDown.getPositionX(), this.mapDown.getPositionY() - this.speed / 2));
            if (this.mask.height >= 1131) {
                this.unschedule(scheCallback);
                this.isOpenAwardOver = false;
            }
        };
        this.schedule(scheCallback, 0.01);

        for (var i = 0; i < this.chestsArr.length; i++) {
            this.chestsArr[i].setAward(boxList[i]);
        }

        this.node.active = true;
    },
    //开启宝箱服务器返回回调
    openCallback: function (box) {
        this.awardGold = box.gold;
        this.isOpenAwardOver = true;
        for (var i = 0; i < this.chestsArr.length; i++) {
            if (box.id === this.chestsArr[i].id) {
                this.chestsArr[i].openCallback(box);
                if (box.isSpecial === 1)
                    this.bigOpen(box.gold);
                else
                    this.smallOpen(box.gold);
            }

        }
    },
    /**结束开启宝箱 */
    overOpenShests: function () {
        var scheCallback = function () {
            this.mask.setContentSize(this.mask.width, this.mask.height - this.speed);
            this.mapUp.setPosition(cc.v2(this.mapUp.getPositionX(), this.mapUp.getPositionY() - this.speed / 2));
            this.mapDown.setPosition(cc.v2(this.mapDown.getPositionX(), this.mapDown.getPositionY() + this.speed / 2));
            if (this.mask.height <= 100) {
                this.unschedule(scheCallback);
                this.scheduleOnce(function () {
                    this.node.active = false;
                    this.slotsManager.chestsAwardOver(this.awardGold);
                }, 0.5);
            }
        };
        this.schedule(scheCallback, 0.01);
    },
    smallOpen: function (gold) {
        this.small_Node.active = true;
        this.small_Gold.string = gold;
    },
    btn_smallClose: function () {
        this.small_Node.active = false;
        this.overOpenShests();
    },
    bigOpen: function (gold) {
        this.big_Node.active = true;
        this.big_Gold.string = gold;
    },
    btn_bigClose: function () {
        this.big_Node.active = false;
        this.overOpenShests();
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
        self.openChestsAward(obj.arr)
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
        self.openCallback(obj);
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate, this.onHanderSpecialPirate, this);//特殊玩法 - 海盗
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_pirate_ret, this.onHanderSpecialPirateRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox, this.onHanderOpenBox, this);//特殊玩法 - 海盗开启宝箱
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_special_openBox_ret, this.onHanderOpenBoxRet, this);
    },
    eventIntercept: function () {
        ///拦截所有的事件
        this.node.on('mouseup', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mousedown', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mouseenter', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mousemove', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('mouseleave', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchstart', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchmove', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchend', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        this.node.on('touchcancel', function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
