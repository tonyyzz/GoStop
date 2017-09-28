var mod_Line = require('Mod_Line');
var mod_urlConfig = require('Mod_UrlConfig');
var mod_Level = require('Mod_Level');
var mod_Game = require('Mod_Game');
var mod_LineRate = require("Mod_LineRate");

var ModulManager = cc.Class({
    name: 'ModulManager',
    statics: {
        modList: new Array(),
        // 声明静态变量
        // 声明静态方法
        init: function () {
            mod_Line.init();
            mod_urlConfig.init();
            mod_Level.init();
            mod_Game.init();
            mod_LineRate.init();
        },
    },
    
    ctor() {

        ///test 
    },
});
module.exports = ModulManager;