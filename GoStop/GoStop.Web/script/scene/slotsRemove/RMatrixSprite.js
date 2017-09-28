var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (mgr, row, column) {
        this.startPosY = mgr.initialPos.y + mgr.initialSizeH * row;
        this.manager = mgr;
        this.isMove = false;
        this.isRollOver = false;    //是否滚动结束
        this.speed = 40;    //滚动速
        this.isWin = false; //当前节点是否在中奖路线上
        this.row = row;     //当前所在横列
        this.column = column;   //设置所在纵列
        this.sprite = this.node.getComponent(cc.Sprite);
        this.changeSprite();
        this.runStartPos = this.manager.maxPoy;
        this.endPos = this.manager.initialPos.y - this.manager.initialSizeH;

        this.sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        // this.createLabel();
        this.createLabel();
    },

    // 移除图片
    remove: function () {
        var scale1 = cc.scaleTo(0.3, 0);
        var callfunc = cc.callFunc(function () {
            this.manager.ms2List[this.row][this.column] = null;
            if (this.node.name == 'MatrixSprite') {
                this.manager.pool.pushToPool(this.node.name, this.node);
            } else {
                this.node.removeFromParent();
            }
        }, this);
        var seq = cc.sequence(scale1, callfunc);
        this.node.runAction(seq);

        return 0.5;
    },
    // 图片下移
    moveDown: function (delay) {
        if (this.row === 0) return null;
        var grid = 0;   //移动的格子数
        for (var i = this.row - 1; i >= 0; i--) {
            if (!this.manager.ms2List[i][this.column])
                grid++;
        }
        if (grid === 0) return null;
        this.manager.ms2List[this.row - grid][this.column] = this;
        this.manager.ms2List[this.row][this.column] = null;
        this.row -= grid;
        var time = 0.15;
        // 替换图片
        if (this.row <= 2) {
            var r = this.manager.antitone(this.row);
            this.changeSprite(this.manager.resultMatrix[r][this.column]);
        }


        var speed = grid * time;
        var move = cc.moveBy(speed, cc.v2(0, -grid * this.manager.initialSizeH));
        // this.node.runAction(move).easing(cc.easeQuadraticActionIn());
        this.node.runAction(move);
        this.startPosY = this.manager.initialPos.y + this.manager.initialSizeH * this.row;
        this.changeLabel();
        return speed;
    },
    posReset: function (mrg) {
        // 掉落
        this.gridDown = mrg.getMoveGrid(this.column);
        // cc.log('掉落格子数：', grid);
        if (this.row - this.gridDown >= 0) {
            var move = cc.moveBy(0.3, cc.v2(0, -this.gridDown * this.manager.initialSize.height));
            this.node.runAction(move);
        }
    },
    // 重置行位置
    ResetRow: function () {
        this.row -= this.gridDown;
    },
    changeSprite: function (type) {
        var ran = Math.floor(Math.random() * 9);
        if (type != undefined) {
            this.sprite.spriteFrame = this.manager.matrixAtlas.getSpriteFrame(type.toString());
        } else {
            this.sprite.spriteFrame = this.manager.matrixAtlas.getSpriteFrame(ran.toString());
        }
    },
    /**开始摇动老虎机 */
    startRun: function () {
        this.isMove = true;
        var time = Global.spinTime - 0.4 * (5 - this.column);
        // var time = 4 - 0.4 * (5 - this.column);
        this.scheduleOnce(function () {
            this.isRollOver = true;
        }, time);
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
            this.sprite.spriteFrame = this.manager.matrixAtlas.getSpriteFrame("0");
            this.node.runAction(cc.scaleTo(1, 1));
        }, 3.1);

        return 4.1;
    },
    //显示矩阵数组下标,测试用
    createLabel: function () {
        // if(this.labNode) return;
        // this.labNode = cc.instantiate(this.manager.lab);
        // this.node.addChild(this.labNode);
        // this.subLab = this.labNode.getComponent(cc.Label);
        // this.subLab.string = this.row + ',' + this.column;
    },
    changeLabel: function () {
        // this.subLab.string = this.row + ',' + this.column;
    },
    update: function (dt) {
        if (this.isMove) {
            this.node.setPositionY(this.node.getPositionY() - this.speed);
            if (this.isRollOver) {
                if (this.node.getPositionY() <= this.startPosY + 5 && this.node.getPositionY() >= this.startPosY - this.speed - 5) {
                    this.isMove = false;
                    this.isRollOver = false;
                    this.node.setPositionY(this.startPosY);
                    if (this.row <= 2) {    //行下标小于等于2的情况下
                        var r = this.manager.antitone(this.row);
                        var type = this.manager.resultMatrix[r][this.column];
                        this.changeSprite(type);
                    }
                }

            }
            if (this.node.getPositionY() <= this.endPos) {
                this.node.setPositionY(this.runStartPos);
                this.changeSprite();
            }
        }
    },
});
