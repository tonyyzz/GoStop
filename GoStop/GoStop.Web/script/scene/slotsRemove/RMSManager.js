cc.Class({
    extends: cc.Component,

    properties: {
        matrixAtlas: cc.SpriteAtlas,

        lab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.matrixParent = this.node.getChildByName('Matrix');
        var ms = this.matrixParent.getComponentsInChildren('RMatrixSprite');
        this.pool = cc.find('Pool').getComponent('PoolMgr');
        this.ms2List = new Array();
        this.initialPos = ms[0].node.getPosition(); //矩阵数组图片起始位置
        //取初始图片宽高
        this.initialSizeH = ms[0].node.getContentSize().height;
        this.initialSizeW = ms[0].node.getContentSize().width;
        this.initialSize = new Object();
        this.initialSize.height = this.initialSizeH;
        this.initialSize.width = this.initialSizeW;
        this.maxPoy = ms[ms.length - 1].node.getPositionY(); //矩阵最高位置Y轴坐标
        this.resultMatrix = null;   //矩阵结果
        var arrTemp = null;
        for (var i = 0; i < ms.length; i++) {
            if (i % 5 === 0)
                arrTemp = new Array();
            arrTemp.push(ms[i]);
            if (i % 5 === 4)
                this.ms2List.push(arrTemp);
        }
        for (var i = 0; i < this.ms2List.length; i++) {
            for (var j = 0; j < this.ms2List[i].length; j++) {
                this.ms2List[i][j].init(this, i, j);
            }
        }
    },
    startAllRun: function (firstResult) {
        this.resultMatrix = firstResult;
        // cc.log(this.resultMatrix[0]);
        // cc.log(this.resultMatrix[1]);
        // cc.log(this.resultMatrix[2]);
        for (var a = 0; a < this.ms2List.length; a++) {
            for (var b = 0; b < this.ms2List[a].length; b++) {
                this.ms2List[a][b].startRun();
            }
        }
    },
    // 开始时停止上局提示动画
    stopAllRunScale: function () {
        for (var a = 0; a < this.ms2List.length; a++) {
            for (var b = 0; b < this.ms2List[a].length; b++) {
                if (this.ms2List[a][b])
                    this.ms2List[a][b].stopRunScale();
            }
        }
    },
    // 累计奖励替换图片
    bonusAward: function (bonusArr) {
        var time = 0;
        bonusArr.forEach(function (e) {
            var row = Math.floor(e / 5);
            row = this.antitone(row);
            var column = e % 5;
            time = this.ms2List[row][column].bonusAward();
        }, this);
        return time;
    },
    removeSprite: function (arr) {
        var time = 0;
        arr.forEach(function (element) {
            element.x = this.antitone(element.x);
            time = this.ms2List[element.x][element.y].remove();
        }, this);

        return time;
    },
    moveDownSprite: function (matrix) {
        this.resultMatrix = matrix;
        // cc.log(matrix[0]);
        // cc.log(matrix[1]);
        // cc.log(matrix[2]);
        var time = 0;
        for (var i = 0; i < this.ms2List.length; i++) {
            for (var j = 0; j < this.ms2List[i].length; j++) {
                if (this.ms2List[i][j]) {
                    var t = this.ms2List[i][j].moveDown();
                    if (t) time = t;
                }

            }
        }
        time += 0.5;
        this.scheduleOnce(function () {
            this.fillingSprite();
        }, time);

        return time;
    },
    // 充填空白区块
    fillingSprite: function () {
        var startPos = this.ms2List[0][0].node.getPosition();
        for (var i = 0; i < this.ms2List.length; i++) {
            for (var j = 0; j < this.ms2List[i].length; j++) {
                if (!this.ms2List[i][j]) {
                    var m = this.pool.popFromPool('MatrixSprite').getComponent('RMatrixSprite');
                    this.matrixParent.addChild(m.node);
                    m.node.setScale(1, 1);
                    m.node.setPosition(cc.v2(startPos.x + this.initialSizeW * j, startPos.y + this.initialSizeH * i));
                    m.init(this, i, j);
                    this.ms2List[i][j] = m;
                }
            }
        }
    },
    btn_run: function () {
        for (var i = 0; i < this.ms2List.length; i++) {
            for (var j = 0; j < this.ms2List[i].length; j++) {
                this.ms2List[i][j].startRun();
            }
        }
    },
    // 矩阵反序计算
    antitone: function (num) {
        if (num === 2)
            return 0;
        else if (num === 0)
            return 2;
        else
            return num;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
