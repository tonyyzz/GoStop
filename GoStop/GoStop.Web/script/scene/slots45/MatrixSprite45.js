var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (slotsMgr, row, column) {
        this.startPosY = this.node.getPositionY();
        this.isMove = false;
        this.isRollOver = false;    //是否滚动结束
        this.isWin = false; //当前节点是否在中奖路线上
        this.speed = 40;    //滚动速度
        this.row = row;     //当前所在横列
        this.column = column;   //设置所在纵列

        if (row === 0 && column === 0) {
            this.initialSize = new Object();
            this.initialSize.width = this.node.width;
            this.initialSize.height = this.node.height;
        }

        this.slotsManager = slotsMgr;
        this.sprite = this.node.getComponent(cc.Sprite);
        this.changeSprite();
        this.runStartPos = this.slotsManager.matrixTwo[3][0].node.getPositionY();
        this.endPos = this.slotsManager.matrixTwo[0][0].node.getPositionY() - this.node.height * 3;

        this.sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        // this.createLabel();
    },
    /**开始摇动老虎机 */
    startRun: function () {
        this.isMove = true;
        var time = Global.spinTime - 0.4 * (4 - this.column);
        this.scheduleOnce(function () {
            this.isRollOver = true;
        }, time);
    },
    changeSprite: function (type) {
        var ran = Math.floor(Math.random() * 9);
        if (type != undefined) {
            this.sprite.spriteFrame = this.slotsManager.matrixAtlas.getSpriteFrame(type.toString());
        } else {
            this.sprite.spriteFrame = this.slotsManager.matrixAtlas.getSpriteFrame(ran.toString());
        }
    },
    /**获取纹理矩形区域 */
    getSpriteRect: function () {
        return this.sprite.spriteFrame.getRect();
    },

    /**当前节点在中奖路线上 */
    setWin: function () {
        this.isWin = true;
    },

    /**设置中奖提示动画 */
    runScale: function () {
        if (this.isWin) return;
        this.isWin = true;
        var scale1 = cc.scaleTo(0.3, 1.15);
        var scale2 = cc.scaleTo(0.3, 1);
        var seq = cc.sequence(scale1, scale2);
        this.repat = cc.repeatForever(seq);
        this.node.runAction(this.repat);
    },

    /**停止中奖提示动画   */
    stopRunScale: function () {
        if (!this.isWin) return;

        this.isWin = false;
        this.node.stopAction(this.repat);
        var scale = cc.scaleTo(0.1, 1);
        this.node.runAction(scale);
    },
    /**累积奖励动画 */
    bonusAward: function () {
        var seq = cc.sequence(cc.blink(2, 3), cc.scaleTo(1, 0));
        this.node.runAction(seq);
        this.scheduleOnce(function () {
            this.node.scale = 0;
            this.sprite.spriteFrame = this.slotsManager.matrixAtlas.getSpriteFrame("0");
            this.node.runAction(cc.scaleTo(1, 1));
        }, 3.1);

        return 4.1;
    },
    
    //显示矩阵数组下标
    createLabel: function () {
        var labNode = cc.instantiate(this.slotsManager.lab);
        this.node.addChild(labNode);
        var lab = labNode.getComponent(cc.Label);
        lab.string = this.row + ',' + this.column;
    },

    update: function (dt) {
        if (this.isMove) {

            this.node.setPositionY(this.node.getPositionY() - this.speed);
            if (this.isRollOver && this.node.getPositionY() <= this.startPosY && this.node.getPositionY() >= this.startPosY - (this.speed + 5)) {
                this.isMove = false;
                this.isRollOver = false;
                this.node.setPositionY(this.startPosY);
                if (this.row <= 2) {    //行下标小于等于2的情况下
                    var type = this.slotsManager.resultMatrix[this.row][this.column];
                    this.changeSprite(type);
                }
            } else if (this.node.getPositionY() <= this.endPos) {
                this.node.setPositionY(this.runStartPos);
                this.changeSprite();
            }
        }
    },
});
