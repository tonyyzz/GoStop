var CSV = require('csv.min');
var Global = require('Global'); 

var Mod_Level=cc.Class({
    name: 'Mod_Level',
    statics: {
        // 声明静态变量
        isInit: false,//是否初始化成功
        map:{},//存储的数据
        len:0,//长度
        // 初始化数据
        init: function () {
            if (Mod_Level.isInit)
                return;
                Global.modMaxLen++;
            var path = 'config/level';
            cc.loader.loadRes(path, function (err, text) {
                if (err) {
                    // console.log("Mod_Level load error!");
                    cc.error(err.message || err);
                    return;
                }
                Global.modCulLen++;
                Mod_Level.LoadSuc(path, text);
            });
        },
        ///加载成功
        LoadSuc: function (path, text) {
            var list = new CSV(text, { header: true }).parse();
            //读取出来
            for (var j = 0; j < list.length; j++) {
                var obj = list[j];
                var objArr = Mod_Level.map[obj.level];
                if (objArr == null) {
                    objArr = new Array();
                    Mod_Level.map[obj.level] = objArr;
                }
                objArr.push(obj);
            }
            Mod_Level.len = list.length;
            // cc.log("Mod_Level LoadSuc:" + list.length);
            Mod_Level.isInit = true;
            ///释放这个资源 读进内存就没用了
            cc.loader.release(path);
        },
        ///获得模型数据
        GetModData: function(id)
        {
            return Mod_Level.map[id];
        },
    },
    ctor () {  
        
        ///test
    },
});

module.exports = Mod_Level;