var Global = cc.Class({
    name: 'Global',
    statics: {

        modMaxLen: 0,//数据模型最大长度
        modCulLen: 0,//加载的当前文件

        version: "",//本地版本号

        headAtlas: null,    //本地玩家头像图集
        giftAtlas: null,    //礼物图集

        shopList : null,

        themeList: [],  //主题列表
        gameID: 0,  //游戏主题ID
        houseID: 0, //房间ID
        isInLobbyScene: false,  //是否在大厅中

        spinTime: 5,    //spin一次间隔时间

        isLogNet: true,
        //随机种子
        randomStr: "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        randomSeed: function (len) {
            var maxPos = Global.randomStr.length;
            var seed = '';
            for (var i = 0; i < len; i++) {
                seed += Global.randomStr.charAt(Math.floor(Math.random() * maxPos));
            }

            return seed;
        },
        //金额单位转换
        goldUnitConversion: function (gold) {
            var length = gold.toString().length;
            var goldStr = gold.toString();
            if (length >= 5 && length < 9)
                goldStr = goldStr.substr(0, length - 4) + '万';
            else if (length >= 9)
                goldStr = goldStr.substr(0, length - 8) + '亿';

            return goldStr;
        },
    }
});

module.exports = Global;
