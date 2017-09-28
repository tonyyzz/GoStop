var MessageManager = require("MessageManager");
var NetworkLobby = require("NetworkLobby");
var Package = require("Package");
var EnumType = require("EnumType");
var Global = require("Global");
var PlayerInfo = require("PlayerInfo");
var AudioManager = require('AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {
        friendsNode: cc.Node,   //好友列表界面
        requestsNode: cc.Node,  //邀请界面
        addFriendNode: cc.Node, //添加好友界面

        onlineFriends: cc.Node,  //在线好友列表父节点
        offOnlineFriends: cc.Node,  //不在线好友列表父节点
        allOnlinePlayers: cc.Node,  //其他随机在线玩家父节点

        firendRequest: cc.Node,    //好友请求列表父节点

        firendRequestItem: cc.Prefab,   //请求好友
        friendItem: cc.Prefab,  //好友
        friendCodeEB: cc.EditBox,   //好友id输入框
        myCodeLab: cc.Label,    //玩家自己的id
    },

    // use this for initialization
    initFriendUI: function () {
        this.node.active = true;
        this.registerMsg();
        this.toggle_friends();  //默认选中好友列表界面
        this.myCodeLab.string = 'Yuo Code: ' + PlayerInfo.id;
        this.node.active = false;
    },
    openFriendUI: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list);
        NetworkLobby.send(p);
        var p2 = new Package();
        p2.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_playerTopN);
        NetworkLobby.send(p2);
    },
    // 单选按钮调用
    toggle_friends: function () {
        this.friendsNode.active = true;
        this.requestsNode.active = false;
        AudioManager.playAudio('click');
    },
    toggle_ruquests: function () {
        this.friendsNode.active = false;
        this.requestsNode.active = true;
        AudioManager.playAudio('click');
        this.sendRequireFriendList();
    },
    btn_close: function () {
        // 清楚在线好友节点不能移除所有子节点，会把添加好友按钮也一起移除
        for (var i = 0; i < this.onlineFriendList.length; i++) {
            this.onlineFriends.removeChild(this.onlineFriendList[i])
        }
        this.offOnlineFriends.removeAllChildren();
        this.allOnlinePlayers.removeAllChildren();
        this.node.active = false;
    },
    btn_openAddFrindUI: function () {
        this.addFriendNode.active = true;
    },
    btn_closeAddFrindUI: function () {
        this.addFriendNode.active = false;
        this.friendCodeEB.string = '';
    },
    // 随机在线非好友玩家
    onHanderPlayerTopN: function () { },
    onHanderPlayerTopNRet: function (self, pack) {
        var allPlayer = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.headType = pack.readInt();
            o.head = pack.readString();
            allPlayer.push(o);
            var friend = cc.instantiate(self.friendItem).getComponent('FriendItem');
            friend.init();
            self.allOnlinePlayers.addChild(friend.node);
            friend.setInfo(o);
        }
        self.node.active = true;
    },
    // 在线的好友列表
    onHanderOnlineFirends: function () { },
    onHanderOnlineFirendsRet: function (self, pack) {
        self.onlineFriendList = new Array();
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.headType = pack.readInt();
            o.head = pack.readString();
            o.isOnline = pack.readByte();
            var friend = cc.instantiate(self.friendItem).getComponent('FriendItem');
            friend.init();
            if (o.isOnline === 1) {   //在线玩家
                self.onlineFriends.addChild(friend.node);
                self.onlineFriendList.push(friend.node);
            } else
                self.offOnlineFriends.addChild(friend.node);
            friend.setInfo(o);
        }
    },
    //请求添加好友列表
    sendRequireFriendList: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_requestFriendList);
        NetworkLobby.send(p);
    },
    onHandedRequestList: function () { },
    onHandedRequestListRet: function (self, pack) {
        self.requestList = new Array(); //请求好友的玩家列表
        var l = pack.readInt();
        for (var i = 0; i < l; i++) {
            var o = new Object();
            o.pid = pack.readInt();
            o.name = pack.readString();
            o.headType = pack.readInt();
            o.head = pack.readString();

            var request = cc.instantiate(self.firendRequestItem).getComponent('FriendRequestItem');
            self.firendRequest.addChild(request.node);
            request.setInfo(o, self);
            self.requestList.push(request.node);
        }
        cc.log('请求添加好友的玩家列表：', self.requestList);
    },
    // 好友请求处理
    friendRequestDispose: function (pid, isAgree) {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agree);
        p.writeShort(isAgree);  //0:拒绝；1:同意
        p.writeInt(pid);
        NetworkLobby.send(p);
    },
    // 同意好友请求之后刷新好友列表
    updateFriendList: function () {
        for (var i = 0; i < this.onlineFriendList.length; i++) {
            this.onlineFriends.removeChild(this.onlineFriendList[i])
        }
        this.onlineFriendList = new Array();
        this.offOnlineFriends.removeAllChildren();
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list);
        NetworkLobby.send(p);
    },
    //好友请求处理结果
    onHanderFriendAgree: function () { },
    onHanderFriendAgreeRet: function (self, pack) {
        var obj = new Object();
        obj.name = pack.readString();
        obj.pid = pack.readInt();
        obj.isAgree = pack.readShort();
        if (obj.isAgree === 1) {  //同意的情况下
            obj.headType = pack.readInt();
            obj.head = pack.readString();
        }
        for (var i = 0; i < self.requestList.length; i++) {
            if (self.requestList[i].pid === obj.pid) {
                self.firendRequest.removeChild(self.requestList[i].node);
                self.requestList.splice(i, 1);  //从数组中移除指定元素
            }
        }
        self.updateFriendList();
    },

    // 发送添加好友申请消息
    btn_sendAddFriend: function () {
        var p = new Package();
        p.Init(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add);
        p.writeInt(Number(this.friendCodeEB.string));
        NetworkLobby.send(p);
        cc.log('请求添加好友：', this.friendCodeEB.string);
    },
    onHanderAddFriend: function () { },
    onHanderAddFriendRet: function (self, pack) {
        if (!self.addFriendNode.active) return;
        self.addFriendNode.active = false;
        var aa = pack.readInt();
        cc.log('添加好友申请结果', aa);
    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_playerTopN, this.onHanderPlayerTopN, this);//前N位在线玩家列表（非好友）
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_playerTopN_ret, this.onHanderPlayerTopNRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list, this.onHanderOnlineFirends, this);//好友列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list_ret, this.onHanderOnlineFirendsRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agree, this.onHanderFriendAgree, this);//好友请求处理
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agree_ret, this.onHanderFriendAgreeRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_requestFriendList, this.onHandedRequestList, this); //请求添加好友列表
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_requestFriendList_ret, this.onHandedRequestListRet, this);
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add, this.onHanderAddFriend, this);//添加好友
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add_ret, this.onHanderAddFriendRet, this);
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_playerTopN, this.onHanderPlayerTopN, this);//前N位在线玩家列表（非好友）
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_playerTopN_ret, this.onHanderPlayerTopNRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list, this.onHanderOnlineFirends, this);//好友列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_list_ret, this.onHanderOnlineFirendsRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agree, this.onHanderFriendAgree, this);//好友请求处理
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_agree_ret, this.onHanderFriendAgreeRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_requestFriendList, this.onHandedRequestList, this); //请求添加好友列表
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_requestFriendList_ret, this.onHandedRequestListRet, this);
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add, this.onHanderAddFriend, this);//添加好友
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_FRIEND, EnumType.SecondCommand.SC_FRIEND_add_ret, this.onHanderAddFriendRet, this);
    },
});
