cc.Class({
    extends: cc.Component,

    properties: {
        rankLab: cc.Label,
        nameLab: cc.Label,
        integralLab: cc.Label,
        prizeGoldLab: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    
    updateData: function(player, rank){
        this.rankLab.string = player.rank;
        this.nameLab.string = player.name;
        this.integralLab.string = '积分:' + player.integral;
        this.prizeGoldLab.string = '奖金:' + rank;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
