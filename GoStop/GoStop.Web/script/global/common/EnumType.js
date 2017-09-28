//模块类型（按功能划分）
var MainCommand = cc.Enum({
    MC_TEST: 0,
    MC_ACCOUNT: 1,    //账号 个人中心
    MC_GAME: 2, //玩法消息
    MC_FRIEND: 3,//好友
    MC_ERROR: 4,//错误模块
    MC_HALLMass: 5,//大厅模块

    MC_CONNECT: 1000,       //连接服务器
});

// 网络模块
var SecondCommand = cc.Enum({
    SC_TEST_A: 0,
    SC_ERROR_hall: 50,//大厅服务器返回错误
    SC_ERROR_game: 51,//游戏服务器返回错误 
    SC_ACCOUNT_login: 100,//登录消息
    SC_ACCOUNT_login_ret: 101,
    SC_ACCOUNT_zan: 102,//点赞 
    SC_ACCOUNT_zan_ret: 103,
    SC_ACCOUNT_info: 104,//查看用户信息 （包括好友 陌生人）
    SC_ACCOUNT_info_ret: 105,
    SC_ACCOUNT_gift: 106,//向其他用户送礼
    SC_ACCOUNT_gift_ret: 107,
    SC_ACCOUNT_login_award: 108,//每日登陆抽奖
    SC_ACCOUNT_login_award_ret: 109,
    SC_ACCOUNT_online_award: 110,//在线奖励
    SC_ACCOUNT_online_award_ret: 111,
    SC_ACCOUNT_themeinfo: 112,  //主题配置
    SC_ACCOUNT_themeinfo_ret: 113,
    SC_ACCOUNT_updateHeadimg: 114, //修改玩家头像
    SC_ACCOUNT_updateHeadimg_ret: 115, //修改玩家头像 返回
    SC_ACCOUNT_giftlist: 116,//礼物商城列表
    SC_ACCOUNT_giftlist_ret: 117,
    SC_ACCOUNT_updateName: 118, //修改玩家名称
    SC_ACCOUNT_updateName_ret: 119, //修改玩家名称 返回
    SC_ACCOUNT_online_awardresidueTime: 120,//在线奖励领取的剩余时间
    SC_ACCOUNT_online_awardresidueTime_ret: 121,
    SC_ACCOUNT_login_awardList: 122,//每日登陆抽奖转盘列表
    SC_ACCOUNT_login_awardList_ret: 123,
    SC_ACCOUNT_storelist: 124, //商城列表
    SC_ACCOUNT_storelist_ret: 125,
    SC_ACCOUNT_storepay: 126, //商城支付
    SC_ACCOUNT_storepay_ret: 127,
    SC_ACCOUNT_blockNumber_ret: 128, //账号禁用后通知给玩家
    SC_ACCOUNT_loginBlockNotice_ret: 129, //登录时账号禁用的状态通知给玩家
    SC_ACCOUNT_gagTalk_ret: 130, //账号禁言后通知给玩家
    SC_ACCOUNT_removeGagTalk_ret: 131, //账号解除禁言后通知给玩家
    SC_ACCOUNT_bindingFacebook: 132,//绑定facebook
    SC_ACCOUNT_bindingFacebook_ret: 133,//绑定facebook 返回

    SC_GAME_enter: 300,  //进入游戏  返回GAME IP
    SC_GAME_enter_ret: 301,
    SC_GAME_join: 302,//加入牌桌
    SC_GAME_join_ret: 303,//加入返回
    SC_GAME_join_notice: 304,//加入通知
    SC_GAME_leave: 305,      //离开游戏
    SC_GAME_leave_ret: 306,  //离开返回
    SC_GAME_leave_notice: 307,   //离开通知  
    SC_GAME_bet: 308,      //下注（所有玩法）
    SC_GAME_bet_ret: 309,
    SC_GAME_login: 310,//登录gameserver 
    SC_GAME_login_ret: 311,
    SC_GAME_upgrade_lottery: 312,//升级抽奖
    SC_GAME_upgrade_lottery_ret: 313,

    SC_GAME_special_pirate: 314,//特殊玩法 - 海盗
    SC_GAME_special_pirate_ret: 315,
    SC_GAME_special_openBox: 316, //特殊玩法 - 开启宝箱
    SC_GAME_special_openBox_ret: 317,
    SC_GAME_chat: 318, //聊天系统
    SC_GAME_chat_notice: 319, //聊天群发通知（同一table）
    SC_GAME_jackpot_notice: 320, //同一主题奖池金额群发通知
    SC_GAME_jackpot: 321,  //进入某个主题玩法后，通知该玩家奖池信息
    SC_GAME_jackpot_ret: 322,
    SC_GAME_bet_superAward_notice: 323,//中大奖后通知房间内的其他玩家（头像闪烁）
    SC_GAME_lotteryList: 324,//升级抽奖列表
    SC_GAME_lotteryList_ret: 325,//升级抽奖列表返回
    SC_GAME_bonusInfo: 326, //玩家奖励信息
    SC_GAME_bonusInfo_ret: 327, //玩家奖励信息 返回
    SC_GAME_playerActivity_ret: 328, //游戏服务器中通知在线玩家限时活动结算消息
    SC_GAME_activityRankAndPrize_ret: 329, //给在该游戏服务器中的该主题中的玩家推送限时活动的rank和prize消息
    SC_GAME_activityLiOfHall_ret: 330, //大厅显示对应主题的限时活动消息
    SC_GAME_special_hatShowCup: 331,//显示杯子
    SC_GAME_special_hatShowCup_ret: 332,//显示杯子 返回
    SC_GAME_special_hatOpenCup: 333,//打开杯子
    SC_GAME_special_hatOpenCup_ret: 334,//打开杯子 返回

    SC_FRIEND_add: 500,//添加好友
    SC_FRIEND_add_ret: 501,
    SC_FRIEND_add_notice: 502,//添加好友通知
    SC_FRIEND_remove: 503,//删除好友
    SC_FRIEND_remove_ret: 504,
    SC_FRIEND_agree: 505,//同意添加好友
    SC_FRIEND_agree_ret: 506,//同意请求
    SC_FRIEND_list: 507,//请求好友列表 
    SC_FRIEND_list_ret: 508,
    SC_FRIEND_invite: 509,//邀请好友
    SC_FRIEND_invite_ret: 510,
    SC_FRIEND_invite_notice: 511, //邀请通知好友
    SC_FRIEND_accept: 512,//好友是否接受邀请
    SC_FRIEND_accept_ret: 513,  //接收者收到
    SC_FRIEND_accept_notice: 514,  //发起人收到
    SC_FRIEND_playerTopN: 515, //前N位在线玩家列表（非好友）
    SC_FRIEND_playerTopN_ret: 516,
    SC_FRIEND_requestFriendList: 517, //请求添加好友列表
    SC_FRIEND_requestFriendList_ret: 518,
    SC_FRIEND_agreeFriend_notice: 519, //添加好友申请发出后的同房间的聊天消息广播
    SC_FRIEND_addinGame: 520,//在游戏中添加好友
    SC_FRIEND_addinGame_ret: 521,

    SC_HALLMass_award_notice: 1000, //玩家下注中大奖的群发

    SC_CONNECT_lobby: 1001, //连接大厅服务器
    SC_CONNECT_game: 1002, //连接游戏服务器
    SC_CONNECT_lobby_close: 1003, //服务器关闭
    SC_CONNECT_lobby_error: 1004, //服务器连接错误
    SC_CONNECT_game_close: 1005, //服务器关闭
    SC_CONNECT_game_error: 1006, //服务器连接错误

    SC_PressureTest_Bet: 1800, //压力测试 - 下注操作
});

module.exports = {
    MainCommand: MainCommand,
    SecondCommand: SecondCommand,
}