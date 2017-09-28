var Mod_Line = require('Mod_Line');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    initLineTips: function (line) {
        this.lineArr = this.node.getComponentsInChildren('LineTips');
        var line = Mod_Line.GetModData(line);
        this.linePos = new Array();
        for (var i = 0; i < line.length; i++) {
            var obj = new Object();
            var l = line[i].value.split("-");
            obj.sub = new Array();
            obj.type = line[i].type;
            for (var j = 0; j < l.length; j++) {
                var pos = new Object();
                var p = l[j].split('#');
                pos.x = Number(p[0]);
                pos.y = Number(p[1]);
                obj.sub.push(pos);
            }
            this.linePos.push(obj);
        }
        // for (var i = 1; i < this.lineArr.length; i++) { this.lineArr[i].node.active = false; }
    },

    /**开启路线连接提示 
     * matrixTwo:结果二位数组
    */
    openLineTisp: function (lineObjArr, matrixTwo, initialSize) {
        if (lineObjArr.length === 0) return;

        this.linesShowNum = lineObjArr.length;
        for (var i = 0; i < this.lineArr.length; i++) {
            if (i < lineObjArr.length) {
                for (var j = 0; j < this.linePos.length; j++) {
                    if (this.linePos[j].type === lineObjArr[i].type) {
                        this.lineArr[i].showLineTips(lineObjArr[i].length, this.linePos[j].sub, matrixTwo, initialSize);
                    }
                }
            } else
                this.lineArr[i].close();
        }
        this.scheduleOnce(function () {
            this.linesBlink();
        }, 1);
    },
    linesBlink: function () {
        var index = 0;
        this.blinkCallback = function () {
            if (index === this.linesShowNum) { index = 0; }
            // cc.log('闪烁：', index, this.linesShowNum);
            for (var i = 0; i < this.lineArr.length; i++) {
                if (index === i)
                    this.lineArr[i].blinkTips();
                else
                    this.lineArr[i].node.active = false;
            }
            index++;
        }
        this.schedule(this.blinkCallback, 2);
    },
    /**开启路线连接提示 消除玩法*/
    openLineTisp_Remove: function (lineObjArr, manager) {
        if (lineObjArr.length === 0) return;
        this.slotsManager = manager;
        this.linesShowNum = lineObjArr.length;
        for (var i = 0; i < this.lineArr.length; i++) {
            if (i < lineObjArr.length) {
                for (var j = 0; j < this.linePos.length; j++) {
                    if (this.linePos[j].type === lineObjArr[i].type) {
                        // 上下反序下标
                        for (var k = 0; k < this.linePos[j].sub.length; k++) {
                            if (this.linePos[j].sub[k].x === 2)
                                this.linePos[j].sub[k].x = 0;
                            else if (this.linePos[j].sub[k].x === 0)
                                this.linePos[j].sub[k].x = 2;
                        }
                        this.lineArr[i].showLineTips(lineObjArr[i].length, this.linePos[j].sub, manager.matrixManager.ms2List, manager.initialSize);
                    }
                }
            } else
                this.lineArr[i].close();
        }
        this.scheduleOnce(function () {
            this.linesBlink_Remove();
        }, 1);
    },
    linesBlink_Remove: function () {
        var index = 0;
        this.blinkCallback = function () {
            for (var i = 0; i < this.lineArr.length; i++) {
                if (index === i)
                    this.lineArr[i].blinkTips();
                else
                    this.lineArr[i].node.active = false;
            }
            index++;
            //路线提示结束
            if (index === this.linesShowNum) {
                this.slotsManager.removeWinSprite();
                this.closeLineTips();
            }
        }
        this.schedule(this.blinkCallback, 2);
    },
    closeLineTips: function () {
        this.unschedule(this.blinkCallback);
        for (var i = 0; i < this.lineArr.length; i++) { this.lineArr[i].close(); }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
