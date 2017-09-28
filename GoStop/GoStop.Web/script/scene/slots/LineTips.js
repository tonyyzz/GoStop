

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        this.graphics = this.node.getComponent(cc.Graphics);

        // var lineObj = new Object();
        // lineObj.line = 1;    //当前路线
        // lineObj.type = 0;   //路线编号类型
        // lineObj.length = 5; //路线长度
        // lineObj.subArr = [0, 0, 1, 1, 2, 2, 1, 3, 0, 4];   //路线下标数据
        // this.scheduleOnce(function () {
        //     this.showLineTips(lineObj);
        //     this.blinkTips();
        // }, 2);

    },
    /**显示连线提示 */
    showLineTips: function (lineLength, lineObj, matrixTwo, initialSize) {
        this.node.active = true;
        var posRecord = new Array();    //存每个方块的一些坐标
        for (var i = 0; i < lineObj.length; i++) {
            var p = matrixTwo[lineObj[i].x][lineObj[i].y].node.getPosition();
            var rect = initialSize;
            var posObj = new Object();
            posObj.origin = p; //原点坐标
            posObj.right = new cc.v2(p.x + (rect.width / 2), p.y);    //框右边中间坐标
            posObj.rightUp = new cc.v2(p.x + (rect.width / 2), p.y + (rect.height / 2));    //框右上坐标
            posObj.rightDown = new cc.v2(p.x + (rect.width / 2), p.y - (rect.height / 2));    //框右上坐标
            posRecord.push(posObj);

            if (i < lineLength) {
                this.drawRect(p, rect);
                matrixTwo[lineObj[i].x][lineObj[i].y].runScale();
            }
            p = null; rect = null; posObj = null;
        }
        if (lineLength === 5) {
            this.graphics.stroke();
            posRecord = null;
            return;
        }

        for (var i = lineLength - 1; i < posRecord.length; i++) {
            if (i === lineLength - 1 && i < posRecord.length - 1) { //起始第一条线
                if (posRecord[i].origin.y === posRecord[i + 1].origin.y) {
                    this.graphics.moveTo(posRecord[i].right.x, posRecord[i].right.y);
                } else if (posRecord[i].origin.y >= posRecord[i + 1].origin.y)
                    this.graphics.moveTo(posRecord[i].rightDown.x, posRecord[i].rightDown.y);
                else
                    this.graphics.moveTo(posRecord[i].rightUp.x, posRecord[i].rightUp.y);
                this.drawLine(posRecord[i + 1].origin);
            } else if (i === posRecord.length - 1) { //做后一条线
                this.drawLine(posRecord[i].right);
            } else {   //中间的线
                this.drawLine(posRecord[i + 1].origin);
            }
        }
        this.graphics.stroke();
        posRecord = null;
    },

    close: function () {
        this.node.stopAllActions();
        this.graphics.clear();
        this.node.active = false;
    },
    // 画矩形
    drawRect: function (pos, rect) {
        this.graphics.rect(pos.x - (rect.width / 2), pos.y - (rect.height / 2), rect.width, rect.height);
    },
    // 画线
    drawLine: function (p) {
        this.graphics.lineTo(p.x, p.y);
    },
    /**连线闪烁提示 */
    blinkTips: function () {
        this.node.active = true;
        var blink = cc.blink(2, 2);
        this.node.runAction(blink);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
