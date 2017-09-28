
var CSV = require('csv.min');
var Global = require('Global'); 

var Mod_Game=cc.Class({
    name: 'Mod_Game',
    statics: {
        // 声明静态变量
        isInit: false,//是否初始化成功
        map:{},//存储的数据
        len:0,//长度
        // 初始化数据
        init: function () {
            if (Mod_Game.isInit)
                return;
            Global.modMaxLen++;
            var path = 'config/game';
            cc.loader.loadRes(path, function (err, text) {
                if (err) {
                    // console.log("Mod_Game load error!");
                    cc.error(err.message || err);
                    return;
                }
                Global.modCulLen++;
                Mod_Game.LoadSuc(path, text);
            });
        },
        ///加载成功
        LoadSuc: function (path, text) {
            var list = new CSV(text, { header: true}).parse();
            //读取出来
            for (var j = 0; j < list.length; j++) {
                var obj = list[j];
                var objArr = Mod_Game.map[obj.id];
                if (objArr == null) {
                    objArr = new Array();
                    Mod_Game.map[obj.id] = objArr;
                }
                objArr.push(obj);
            }
            Mod_Game.len = list.length;
            // cc.log("Mod_Game LoadSuc:" + list.length);
            Mod_Game.isInit = true;
            ///释放这个资源 读进内存就没用了
            cc.loader.release(path);

            // var list = Mod_Game.getRegexArr(text, /[\n|\r|\r\n](.+)/g);
            // for(var i = 0; i< 3; i++){
            //      var aa = Mod_Game.getRegexArr(list[i], /([^,]*)/img);
            // }
        },
        ///获得模型数据
        GetModData: function(id)
        {
            return Mod_Game.map[id];
        },
    //     getRegexArr: function (str, pattern, index) {
    //         debugger;
	// 				var regArr = [];
	// 				var result = [], regexp = new RegExp(pattern);
	// 				while ((result = regexp.exec(str)) != null) {
	// 					if (!!index) {
	// 						regArr.push(result[index]);
	// 					} else {
	// 						regArr.push(result[1]);
	// 					}
	// 				}
	// 				return regArr;
	// 			}

    },
    ctor () {  
        
        ///test
    },
});

module.exports = Mod_Game;