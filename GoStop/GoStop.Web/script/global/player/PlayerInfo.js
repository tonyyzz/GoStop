var PlayerInfo = cc.Class({
    name: 'PlayerInfo',
    statics: {
        nickname: '',
        id: 0,
        gold: 0,
        headType: 0,    //头像类型，0：本地；1：远程
        head: '',    //头像
        praise: 0,  //被点赞数
        level: 0,   //等级
        exp: 0, //经验
        totalWin: 0,    //总赢取筹码数
        biggestWin: 0,  //单次最高中奖次数
        spinsWon: 0,    //总中奖次数
        totalSpins: 0,  //总spin次数
        giftArr: [],    //收到的礼物数组
        isGetLoginAward: 1,     //是否领取过在线奖励

        openMyCenterTime: 0,  //打开个人中心时间

        ///初始化数据 切换账号使用
        initData: function () {
            PlayerInfo.openMyCenterTime = 0;
        },
    },

    ctor() {
        
    }
});

module.exports = PlayerInfo;
