var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var NetworkGame = require("NetworkGame");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        pName: cc.Label,
        gold: cc.Label,
        praise: cc.Label,   //点赞数
        totalWinLab: cc.Label,  //总赢取筹码数
        biggestWinLab: cc.Label,//单次最高中奖次数
        spinsWonLab: cc.Label,  //总中奖次数
        totalSpinsLab: cc.Label,//总spin次数

        scrollView: cc.ScrollView,
        scrollViewContent: cc.Node,
        pageView: cc.PageView,
        pageViewContent: cc.Node,
        giftGetListPre: cc.Prefab,

        removeFriendNode: cc.Node,
        addFriendNode: cc.Node,
        disposeTipsLab: cc.Label,   //朋友处理提示

        playerInfoNode: cc.Node,
        friendDisposeUI: cc.Node,
        giftStore: cc.Node,
    },

    init: function (friendUI) {
        this.node.active = true;
        this.eventIntercept();
        this.registerMsg();
        this.friendDisposeType = 0; //处理好友类型，0：删除；1：添加
        this.playerID = null;

        this.friendUI = friendUI;
        this.giftGetList = this.scrollViewContent.getChildByName('GiftGetListOne').getComponent('GiftGetList');
        this.giftStoreList = cc.find('ScrollView/view/content', this.giftStore).getComponentsInChildren('GiftItem');//礼物商店礼物列表
        this.node.active = false;
        this.giftList = this.pageViewContent.getComponentsInChildren('GiftGetList');
    },
    openPlayerInfoUI: function (data) {
        this.node.active = true;
        this.playerInfoNode.active = true;
        this.friendDisposeUI.active = false;
        this.giftStore.active = false;
        if (data.headType === 0)    //头像类型
            this.icon.spriteFrame = Global.headAtlas.getSpriteFrame(data.head);
        this.playerID = data.id;
        this.pName.string = data.name;
        this.gold.string = data.gold;
        this.praise.string = data.praise;
        this.totalWinLab.string = data.totalWin;
        this.biggestWinLab.string = data.biggestWin;
        this.spinsWonLab.string = data.spinsWon;
        this.totalSpinsLab.string = data.totalSpins;
        if (data.playerType === -1) { //自己
            this.removeFriendNode.active = false;
            this.addFriendNode.active = false;
        } else if (data.playerType === 0) {    //陌生人
            this.removeFriendNode.active = false;
            this.addFriendNode.active = true;
        } else if (data.playerType === 1) {    //好友
            this.removeFriendNode.active = true;
            this.addFriendNode.active = false;
        }
        // 当礼物数量小于5的时候
        if (data.giftArr.length < 5) {
            this.giftGetList.node.active = true;
            this.pageView.node.active = false;
            this.giftGetList.setGiftData(data.giftArr);
        } else {
            this.giftGetList.node.active = false;
            this.pageView.node.active = true;
            var index = 0;
            var gift = new Array();
            this.pageView.removeAllPages();
            for (var i = 0; i < data.giftArr.length; i++) {
                if (i % 4 === 0) {
                    index++;
                    this.g = new Array();
                }
                this.g.push(data.giftArr[i]);
                if (i === 4 * index - 1 || i === data.giftArr.length - 1) {
                    var giftList = cc.instantiate(this.giftGetListPre).getComponent('GiftGetList');
                    this.pageView.addPage(giftList.node);
                    giftList.setGiftData(this.g);
                }
            }
        }
    },
    // 打开礼物商城
    openGiftStore: function (pid) {
        cc.log('赠送玩家ID：', pid);
        this.playerID = pid;
        this.playerInfoNode.active = false;
        this.friendDisposeUI.active = false;
        this.btn_sendGift();
    },
    // 打开好友处理界面
    openfriendDisposeUI: function (pid) {
        this.playerID = pid;
        this.friendDisposeType = 1;
        this.playerInfoNode.active = false;
        this.giftStore.active = false;
        this.friendDisposeUI.active = true;
        this.node.active = true;
    },
    btn_sendGift: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_giftlist);
        NetworkLobby.send(p);
    },
    btn_toGifts: function () {
        this.scrollView.scrollToTop(0.1);
    },
    btn_toRecords: function () {
        this.scrollView.scrollToBottom(0.1);
    },
    btn_toHelp: function () {
        this.scrollView.scrollToBottom(0.1);
    },
    btn_close: function () {
        this.node.active = false;
    },
    btn_removeFriend: function () {
        this.friendDisposeUI.active = true;
        this.disposeTipsLab.string = "Do you want remove this friend?";
        this.friendDisposeType = 0;
    },
    btn_addFriend: function () {
        this.friendDisposeUI.active = true;
        this.disposeTipsLab.string = "Has sent a friend request?";
        this.friendDisposeType = 1;
    },
    btn_closeFriendDisposeUI: function () {
        this.friendDisposeUI.active = false;
        if (!this.playerInfoNode.active)
            this.node.active = false;
    },
    btn_closeGiftStoreUI: function () {
        this.giftStore.active = false;
        if (!this.playerInfoNode.active)
            this.node.active = false;
    },
    // 好友处理
    btn_friendYes: function () {
        if (!this.playerID) return;
        var p = new Package();
        if (this.friendDisposeType === 0) {
            p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_remove);
            p.writeInt(this.playerID);
            NetworkLobby.send(p);
        } else {
            if (Global.isInLobbyScene) {    //在大厅中添加好友
                p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add);
                p.writeInt(this.playerID);
                NetworkLobby.send(p);
            } else {    //在游戏中添加好友
                p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_addinGame);
                p.writeInt(this.playerID);
                NetworkGame.send(p);
            }
        }
    },
    btn_friendNo: function () {
        this.friendDisposeUI.active = false;
    },
    // 添加好友
    onHanderAdd: function () { },
    onHanderAddRet: function (self, pack) {
        if (!self.node.active) return;
        var aa = pack.readInt();
        self.node.active = false;
        self.removeFriendNode.active = true;
        self.addFriendNode.active = false;
    },
    // 游戏内添加好友
    onHanderAddInGame: function () { },
    onHanderAddInGameRet: function (self, pack) {
        if (!self.node.active) return;
        var result = pack.readInt();
        if (result === 2) {
            self.friendDisposeUI.active = false;
            self.node.active = false;
        }

    },
    // 删除好友
    onHanderRemove: function () { },
    onHanderRemoveRet: function (self, pakc) {
        cc.log('删除好友成功');
        self.node.active = false;
        self.removeFriendNode.active = false;
        self.addFriendNode.active = true;
        if(self.friendUI)
            self.friendUI.updateFriendList();
    },
    sendGiftMsg: function (giftID) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_gift);
        p.writeInt(this.playerID);
        p.writeInt(giftID);
        NetworkLobby.send(p);
    },
    //给该玩家赠礼
    onHanderGift: function () { },
    onHanderGiftRet: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.type = pack.readInt();
        cc.log('赠礼成功', obj);
        self.btn_closeGiftStoreUI()
    },
    // 礼物商城列表
    onHanderGiftList: function () { },
    onHanderGiftListRet: function (self, pack) {
        var giftList = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.id = pack.readInt();
            o.name = pack.readString();
            o.price = pack.readInt();
            self.giftStoreList[i].initGift(o)
            giftList.push(o);
        }
        self.node.active = true;
        self.giftStore.active = true;
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add, this.onHanderAdd, this);//添加好友
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add_ret, this.onHanderAddRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_remove, this.onHanderRemove, this);//删除好友
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_remove_ret, this.onHanderRemoveRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_gift, this.onHanderGift, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_gift_ret, this.onHanderGiftRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_giftlist, this.onHanderGiftList, this);//礼物商城列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_giftlist_ret, this.onHanderGiftListRet, this);

        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_addinGame, this.onHanderAddInGame, this);//游戏内添加好友
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_addinGame_ret, this.onHanderAddInGameRet, this);//游戏内添加好友
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add, this.onHanderAdd, this);//添加好友
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add_ret, this.onHanderAddRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_remove, this.onHanderRemove, this);//删除好友
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_remove_ret, this.onHanderRemoveRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_gift, this.onHanderGift, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_gift_ret, this.onHanderGiftRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_giftlist, this.onHanderGiftList, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_ACCOUNT, EnumType.SecondCommand.SC_ACCOUNT_giftlist_ret, this.onHanderGiftListRet, this);

        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_addinGame, this.onHanderAddInGame, this);//游戏内添加好友
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_addinGame_ret, this.onHanderAddInGameRet, this);//游戏内添加好友
    },
    eventIntercept: function () {
        ///拦截所有的事件
        var eventList = ['mouseup', 'mousedown', 'mouseenter', 'mousemove', 'mouseleave', 'touchstart', 'touchmove', 'touchend', 'touchcancel']
        for (var i = 0; i < eventList.length; i++) {
            this.node.on(eventList[i], function (event) { if (this.node.active) event.stopPropagationImmediate(); }, this);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
