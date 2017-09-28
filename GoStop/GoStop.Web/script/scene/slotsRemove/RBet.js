var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkGame = require('NetworkGame');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        this.registerMsg();

        this.spinAuto = cc.find('Canvas/Buttons/SpinButton', this.Buttons).getComponent('SpinAuto');  //摇动老虎机按钮
        this.slotsManager = cc.find('SlotsManager').getComponent('SlotsRManager');
        this.ms = this.node.getComponentsInChildren('RMatrixSprite');
        this.ms2 = new Array();
        var arr = null;
        for (var i = 0; i < this.ms.length; i++) {
            if (i % 5 === 0)
                arr = new Array();
            arr.push(this.ms[i]);
            if (i % 5 === 4)
                this.ms2.push(arr);
        }
    },


    // 获取最大行位置
    getMaxRow: function (column) {
        var max = 0;
        for (var i = 0; i < this.ms2.length; i++) {
            var r = this.ms2[i][column].row;
            if (max < r) max = r;
        }
        return max;
    },
    // 向下移动距离格子数
    getMoveGrid: function (column) {
        var max = 0;
        for (var i = 0; i < this.ms2.length; i++) {
            var r = this.ms2[i][column].row
            if (max < r) max = r;
        }

        return max - 2;
    },
    // 下注
    onHanderBet: function () { },
    onHanderBetRet: function (self, pack) {
        var obj = new Object();
        obj.spinFreeNum = pack.readInt();   //剩余免费次数
        // // 读取累积奖励配置
        obj.isCanUseBonus = pack.readByte();
        if (obj.isCanUseBonus) {
            obj.bonusArr = new Array();
            var l = pack.readInt();
            for (var i = 0; i < l; i++) { obj.bonusArr.push(pack.readShort()); }
        }
        obj.bonusNow = pack.readInt();
        obj.bonusMax = pack.readInt();
        obj.bonusNum = pack.readByte();
        self.spinAuto.showBonusAward(obj.bonusNum);


        var betResultLength = pack.readInt();   //下注结果
        obj.resultList = new Array();
        for (var a = 0; a < betResultLength; a++) {
            //矩阵结果
            var resultObj = new Object;
            resultObj.matrix = new Array();
            var arrTemp = new Array();
            var matrixLength = pack.readInt();
            for (var i = 0; i < matrixLength; i++) {
                if (i % 5 === 0)
                    arrTemp = new Array();
                arrTemp.push(pack.readByte());
                if (i % 5 === 4)
                    resultObj.matrix.push(arrTemp);
            }
            arrTemp = null; matrixLength = null;
            // 中奖路线
            var winLength = pack.readInt();
            resultObj.lines = new Array();
            for (var i = 0; i < winLength; i++) {
                var winObj = new Object();
                winObj.type = pack.readByte();    //中奖路线
                winObj.length = pack.readShort();  //中奖长度
                resultObj.lines.push(winObj);
            }
            winObj = null; winLength = null;
            // 被移除的下标
            var replaceLength = pack.readInt();
            resultObj.replaceList = new Array();
            for (var i = 0; i < replaceLength; i++) {
                var replaceObj = new Object();
                replaceObj.x = pack.readInt();
                replaceObj.y = pack.readInt();
                resultObj.replaceList.push(replaceObj);
                replaceObj = null;
            }
            replaceLength = null;
            resultObj.oneWinGold = pack.readInt();

            obj.resultList.push(resultObj);
        }

        obj.myGold = pack.readInt();
        obj.winGold = pack.readInt();   //中奖金额
        obj.profitGold = pack.readInt();//纯利润
        obj.level = pack.readInt();
        obj.exp = pack.readInt();
        obj.jackpot = pack.readInt();
        if (obj.jackpot > 0)
            cc.log('赢取奖池大奖：', obj.jackpot);

        cc.log('下注结果', obj);
        self.slotsManager.spinSlots(obj);    //开始播放spin动画
        obj = null;

    },
    registerMsg: function () {
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.registerMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回
    },
    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet, this.onHanderBet, this); ///下注
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_GAME, EnumType.SecondCommand.SC_GAME_bet_ret, this.onHanderBetRet, this); ///下注返回
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
