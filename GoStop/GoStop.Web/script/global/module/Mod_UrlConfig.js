/**
 * 网络地区配置文件
 */
var CSV = require('csv.min');
var Global = require('Global');

var Mod_UrlConfig=cc.Class({
    name: 'Mod_UrlConfig',
    statics: {
        // 声明静态变量
        isInit: false,//是否初始化成功
        len:0,//长度
        config:null,
        // 初始化数据
        init: function () {
            if (Mod_UrlConfig.isInit)
                return;
            Global.modMaxLen++;
            var path = 'config/urlConfig';
            cc.loader.loadRes(path, function (err, text) {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                Global.modCulLen++;
                Mod_UrlConfig.LoadSuc(path, text);
            });
        },
        ///加载成功
        LoadSuc: function (path, text) {
            // cc.log("Mod_UrlConfig LoadSuc:");
            Mod_UrlConfig.config = text.config;
            
            // cc.log("====================="+Mod_UrlConfig.config.download);
            //Mod_Area.len = list.length;

            Mod_UrlConfig.isInit = true;  
            ///释放这个资源 读进内存就没用了
            cc.loader.release(path);  
        },
        //获得配置
        GetModData: function () {
            return Mod_UrlConfig.config;

        },

    },
    ctor () {  
        
        ///test
    },
});

module.exports = Mod_UrlConfig;