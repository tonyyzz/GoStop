cc.Class({
    extends: cc.Component,

    properties: {
        playerGoldWave: cc.Graphics,    //玩家总金额变化波峰图
        loseAndWinWave: cc.Graphics,    //输赢金额波峰图
        benkerGoldWave: cc.Graphics,    //庄家总金额变化波峰图
        bankerLoseWinWave: cc.Graphics, //庄家输赢金额波峰图
    },

    // use this for initialization
    onLoad: function () {
        this.graphics = this.node.getComponent(cc.Graphics);
        this.createPosition();
    },
    //创建坐标系
    createPosition() {
        this.graphics.moveTo(0, -100);
        this.graphics.lineTo(0, 300);
        this.graphics.moveTo(-40, 0);
        this.graphics.lineTo(11000, 0);
        for (var i = 1; i <= 20; i++) {
            var poy = 10 * i
            this.graphics.moveTo(0, poy);
            this.graphics.lineTo(10, poy);
        }
        // for (var i = 1; i <= 50; i++) {
        //     var pox = 20 * i
        //     this.graphics.moveTo(pox, 0);
        //     this.graphics.lineTo(pox, 10);
        // }
        this.graphics.stroke();
    },
    // 余额
    createPlayerGoldWave: function (goldArr, initGold) {
        this.playerGoldWave.clear();
        this.playerGoldWave.moveTo(0, 0);
        for (var i = 0; i < goldArr.length; i++) {
            var pox = 1 * (i + 1);
            var poy = (goldArr[i] - initGold) / 200; // 每10像素20000金
            this.playerGoldWave.lineTo(pox, poy);
        }
        this.playerGoldWave.stroke();
    },
    // 输赢金额
    createLoseAndWinWave: function (goldArr){
        this.loseAndWinWave.clear();
        this.loseAndWinWave.moveTo(0, 0);
        for (var i = 0; i < goldArr.length; i++) {
            var pox = 1 * (i + 1);
            var poy = goldArr[i] / 20; // 金额/每10像素200金
            this.loseAndWinWave.lineTo(pox, poy);
        }
        this.loseAndWinWave.stroke();
    },
    createBankerGoldWave: function (goldArr) {
        this.benkerGoldWave.clear();
        this.benkerGoldWave.moveTo(0, 0);
        for (var i = 0; i < goldArr.length; i++) {
            var pox = 10 * (i + 1);
            var poy = (goldArr[i]) / 10000; // 每10像素1刻度100000金
            this.benkerGoldWave.lineTo(pox, poy);
        }
        this.benkerGoldWave.stroke();
    },
    createBankerLostWinWave: function (goldArr) {
        this.bankerLoseWinWave.clear();
        this.bankerLoseWinWave.moveTo(0, 0);
        for (var i = 0; i < goldArr.length; i++) {
            var pox = 10 * (i + 1);
            var poy = (goldArr[i]) / 1000; // 每10像素1刻度10000金
            this.bankerLoseWinWave.lineTo(pox, poy);
        }
        this.bankerLoseWinWave.stroke();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
