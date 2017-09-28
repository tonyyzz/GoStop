cc.Class({
    extends: cc.Component,

    properties: {
        myRankLab: cc.Label,
        myIntegralLab: cc.Label,
        surplusTimeLab: cc.Label,
        poolGoldLab: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.rankItem = cc.find('Rank', this.node).getComponentsInChildren('TimeLimitRankItem');
        
    },

    updateRank: function (data) {
        this.myRankLab.string = '我的排名:' + data.myRank;
        this.myIntegralLab.string = '我的积分:' + data.myIntegral;
        this.surplusTimeLab.string = '剩余时间:' + data.residueTime + '秒';
        this.poolGoldLab.string = '奖池金额:' + data.nowPoolGold;
        for(var i = 0; i < data.topList.length; i++){
            this.rankItem[i].updateData(data.topList[i], data.prizeList[i].prizeGold)
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
