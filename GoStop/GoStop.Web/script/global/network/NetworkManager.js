var MessageManager = require("MessageManager");
var Package = require("Package");
var EnumType = require('EnumType');
var NetworkLobby = require('NetworkLobby');
var NetworkGame = require('NetworkGame');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_close, this.onHandrClose, this);///
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_error, this.onHanderError, this);///
    },

    onDestroy: function () {
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_close, this.onHanderClose, this);///
        MessageManager.deleteMsgCallback(EnumType.MainCommand.MC_CONNECT, EnumType.SecondCommand.SC_CONNECT_error, this.onHanderError, this);///
    },

    onHanderClose: function () {

    },
    
    onHanderError: function () {

    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
