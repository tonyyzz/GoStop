
var CSV = require('csv.min');
var Global = require('Global'); 

var Mod_LineRate=cc.Class({
    name: 'Mod_LineRate',
    statics: {
        // 声明静态变量
        isInit: false,//是否初始化成功
        map:{},//存储的数据
        len:0,//长度
        // 初始化数据
        init: function () {
            if (Mod_LineRate.isInit)
                return;
            Global.modMaxLen++;
            var path = 'config/lineRate';
            cc.loader.loadRes(path, function (err, text) {
                if (err) {
                    // console.log("Mod_LineRate load error!");
                    cc.error(err.message || err);
                    return;
                }
                Global.modCulLen++;
                Mod_LineRate.LoadSuc(path, text);
            });
        },
        ///加载成功
        LoadSuc: function (path, text) {
            var list = new CSV(text, { header: true}).parse();
            //读取出来
            for (var j = 0; j < list.length; j++) {
                var obj = list[j];
                var objArr = Mod_LineRate.map[obj.id];
                if (objArr == null) {
                    objArr = new Array();
                    Mod_LineRate.map[obj.id] = objArr;
                }
                objArr.push(obj);
            }
            Mod_LineRate.len = list.length;
            // cc.log("Mod_LineRate LoadSuc:" + list.length);
            Mod_LineRate.isInit = true;
            ///释放这个资源 读进内存就没用了
            cc.loader.release(path);
        },
        ///获得模型数据
        GetModData: function(id)
        {
            return Mod_LineRate.map[id];
        },
    },
    ctor () {  
        
        ///test
    },
});

module.exports = Mod_LineRate;