var PlayerInfo = require('PlayerInfo');
var Mod_Game = require("Mod_Game");

cc.Class({
    extends: cc.Component,

    properties: {
        line: cc.Label,
        bet: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.lobbyManager = cc.find("LobbyManager").getComponent("LobbyManager");
        this.lock = this.node.getChildByName('Lock');   //是否未解锁显示
        this.themeName = this.node.getChildByName('ThemeName').getComponent(cc.Label);
        this.button = this.node.getComponent(cc.Button);
        this.themeID = null;
    },

    initThemeInfo: function (info) {
        var modGame = Mod_Game.GetModData(info.id)[0];
        this.themeName.string = modGame.name;
        this.themeID = info.id;
        this.line.string = info.line + ' line';
        this.bet.string = info.bet;
        // 未解锁
        if (info.level > PlayerInfo.level) {
            this.lock.active = true;
            this.button.interactable = false;
        } else {
            this.lock.active = false;
            this.button.interactable = true;
        }

    },

    btn_enterTheme: function () {
        if (this.themeID)
            this.lobbyManager.onEnterGame(this.themeID);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
