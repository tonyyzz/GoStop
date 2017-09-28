var Mod_Line = require("Mod_Line");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        //矩阵模拟
        var matrix = [
            [3, 2, 3, 0, 4],
            [1, 2, 1, 0, 4],
            [0, 0, 1, 0, 0]];
        var p = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4]; //测试路线
        // cc.log(this.countLine(matrix, p, 0));

    },
    /**设置路线配置 */
    setLine: function (ID) {
        this.linePos = new Array();
        var line = Mod_Line.GetModData(ID);
        // var line = Mod_Line.GetModData(10109);
        if (!line) {
            cc.log('line表配置ID读取错误，ID：', ID);
            return;
        }

        for (var i = 0; i < line.length; i++) {
            var l = line[i].line.split("-");
            var lineSub = new Array();
            for (var j = 0; j < l.length; j++) {
                var pos = new Object();
                var p = l[j].split('#');
                pos.x = Number(p[0]);
                pos.y = Number(p[1]);
                lineSub.push(pos);
            }
            this.linePos.push(lineSub);
        }
        // for (var i = 0; i < line.length; i++) {
        //     var l = line[i].line.split("-");
        //     for (var j = 0; j < l.length; j++) { l[j] = Number(l[j]); } //字符转数字
        //     this.linePos.push(l);
        // }
        // cc.log(this.linePos);
    },
    /**获取结果 */
    getResult: function (matrix) {
        var result = new Array();
        var specificType = 9;
        //路线配置
        // var linePos = [
        //     [0, 0, 0, 1, 0, 2, 0, 3, 0, 4],
        //     [1, 0, 1, 1, 1, 2, 1, 3, 1, 4],
        //     [2, 0, 2, 1, 2, 2, 2, 3, 2, 4],
        //     [0, 0, 1, 1, 2, 2, 1, 3, 0, 4],
        //     [2, 0, 1, 1, 0, 2, 1, 3, 2, 4],
        //     [0, 0, 0, 1, 1, 2, 0, 3, 0, 4],
        //     [2, 0, 2, 1, 1, 2, 2, 3, 2, 4],
        //     [1, 0, 0, 1, 0, 2, 0, 3, 1, 4],
        //     [1, 0, 2, 1, 2, 2, 2, 3, 1, 4]];

        for (var i = 0; i < this.linePos.length; i++) {
            var line = this.countLine(matrix, this.linePos[i], i)
            if (line.length >= 3 && line.type != specificType) { result.push(line); }
            line = null;
        }

        // 特殊奖励判断
        var lineObj = new Object();
        lineObj.line = 0;    //当前路线
        lineObj.type = specificType;   //类型编号
        lineObj.length = 0; //路线长度
        lineObj.subArr = [];   //路线下标数据
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === specificType)
                    lineObj.length++;
            }
        }
        if (lineObj.length >= 3) {
            result.push(lineObj);
        }

        return result;
    },
    // 计算连线逻辑
    countLine: function (matrix, pos, line) {
        var lineObj = new Object();
        lineObj.line = line;    //当前路线
        lineObj.type = 0;   //类型编号
        lineObj.length = 1; //路线长度
        lineObj.subArr = pos;   //路线下标数据
        //判断确定路线type
        for (var i = 0; i < pos.length; i ++) {
            if (matrix[pos[i].x][pos[i].y] !== 0) {
                lineObj.type = matrix[pos[i].x][pos[i].y];
                break;
            } else if (matrix[pos[i].x][pos[i].y] === 0 && i === pos.length - 2) { lineObj.type = 0; }
        }
        // 判定起始两个是否成立连线
        if (matrix[pos[0].x][pos[0].y] === 0 || matrix[pos[1].x][pos[1].y] === 0) {
            lineObj.length++;
        } else if (matrix[pos[0].y][pos[0].x] === matrix[pos[1].x][pos[1].y]) {
            lineObj.length++;
        } else {
            return lineObj;
        }
        // 判定连线长度
        if (lineObj.type === matrix[pos[2].x][pos[2].y] || matrix[pos[2].x][pos[2].y] === 0) { lineObj.length++; } else { return lineObj; }
        if (lineObj.type === matrix[pos[3].x][pos[3].y] || matrix[pos[3].x][pos[3].y] === 0) { lineObj.length++; } else { return lineObj; }
        if (lineObj.type === matrix[pos[4].x][pos[4].y] || matrix[pos[4].x][pos[4].y] === 0) { lineObj.length++; } else { return lineObj; }

        return lineObj;
    }
    /* 左右起始用法
    countLine: function (matrix, pos) {
        var lineObj = new Object();
        lineObj.length = 1; //连线长度
        lineObj.type = 0;   //连线编号类型
        lineObj.l_r = '';   //从左还是从右开始连线
        for (var i = 0; i < pos.length; i += 2) {
            if (matrix[pos[i]][pos[i + 1]] !== 0) {
                lineObj.type = matrix[pos[i]][pos[i + 1]];
                break;
            } else if (matrix[pos[i]][pos[i + 1]] === 0 && i === pos.length - 2) { lineObj.type = 0; }
        }
        if (matrix[pos[0]][pos[1]] === 0) {
            lineObj.length++;
        } else if (matrix[pos[0]][pos[1]] === matrix[pos[2]][pos[3]]) {
            lineObj.l_r = "l";
            lineObj.length++;
        }
        if (lineObj.type === matrix[pos[4]][pos[5]] || matrix[pos[4]][pos[5]] === 0) {
            lineObj.length++;
            if (lineObj.type === matrix[pos[6]][pos[7]] || matrix[pos[6]][pos[7]] === 0) {
                lineObj.length++;
                if (lineObj.type === matrix[pos[8]][pos[9]] || matrix[pos[8]][pos[9]] === 0) { lineObj.length++; }
            }
        }
        //如果左边连线长度大于2，则连线成立，否则反向检索
        if(lineObj.length > 2){
            return lineObj;
        } else {
            for (var i = pos.length - 2; i >= 2; i -= 2) {
                if (matrix[pos[i]][pos[i + 1]] !== 0) {
                    lineObj.type = matrix[pos[i]][pos[i + 1]];
                    break;
                } else if (matrix[pos[i]][pos[i + 1]] === 0 && i === 2) { lineObj.type = 0; }
            }

            lineObj.l_r = "r";
            if (matrix[pos[8]][pos[9]] === 0) {
                lineObj.length++;
            } else { if (matrix[pos[8]][pos[9]] === matrix[pos[6]][pos[7]]) { lineObj.length++ } else { return lineObj; } }
            if (lineObj.type === matrix[pos[4]][pos[5]] || matrix[pos[4]][pos[5]] === 0) { lineObj.length++; } else { return lineObj; }
            if (lineObj.type === matrix[pos[2]][pos[3]] || matrix[pos[2]][pos[3]] === 0) { lineObj.length++; } else { return lineObj; }
            return lineObj;
        }
    }
    */

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
