/**
 * 路线配置表
 */
var CSV = require('csv.min');
var Global = require('Global'); 

var Mod_Line=cc.Class({
    name: 'Mod_Line',
    statics: {
        // 声明静态变量
        isInit: false,//是否初始化成功
        map:{},//存储的数据
        len:0,//长度
        // 初始化数据
        init: function () {
            if (Mod_Line.isInit)
                return;
                Global.modMaxLen++;
            var path = 'config/line';
            cc.loader.loadRes(path, function (err, text) {
                if (err) {
                    // console.log("Mod_Line load error!");
                    cc.error(err.message || err);
                    return;
                }
                Global.modCulLen++;
                Mod_Line.LoadSuc(path, text);
            });
        },
        ///加载成功
        LoadSuc: function (path, text) {
            var list = new CSV(text, { header: true }).parse();
            //读取出来
            for (var j = 0; j < list.length; j++) {
                var obj = list[j];
                var objArr = Mod_Line.map[obj.line];
                if (objArr == null) {
                    objArr = new Array();
                    Mod_Line.map[obj.line] = objArr;
                }
                objArr.push(obj);
            }
            Mod_Line.len = list.length;
            // cc.log("Mod_Line LoadSuc:" + list.length);
            Mod_Line.isInit = true;
            ///释放这个资源 读进内存就没用了
            cc.loader.release(path);
        },
        ///获得模型数据
        GetModData: function(id)
        {
            return Mod_Line.map[id];
        },
    },
    ctor () {  
        
        ///test
    },
});

module.exports = Mod_Line;