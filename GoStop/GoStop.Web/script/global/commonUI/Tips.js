var Tips = cc.Class({
    extends: cc.Component,

    properties: {
        textLabel:cc.Label,//tip内容
    },
    statics:{
        instance:Tips,//单例
        showTips:function (txt) {//显示tips
            if(Tips.instance!=null)
            {
                Tips.instance._showTips(txt);
            }
        },
        showTipsTime:function (txt, time) {//显示tips
            if(Tips.instance!=null)
            {
                Tips.instance._showTipsTime(txt, time);
            }
        },
        
    },

    // use this for initialization
    onLoad: function () {
        Tips.instance = this;
        this.node.opacity = 0;
        cc.game.addPersistRootNode(this.node);//不销毁节点
        this.node.setLocalZOrder(1000);

    },
    start:function(){
        this.node.active = false;
    },
    ///显示TIPS
    _showTips:function(txt){
         this.node.active = true;
        // 停止所有动作
        this.node.stopAllActions();
        var action = cc.fadeIn(0);
        // 执行动作
        this.node.runAction(action);   

        this.textLabel.string = txt;
        this.scheduleOnce(function () {
            var action = cc.fadeOut(2.0);
            var callfun = cc.callFunc(function () {
                this.node.active = false;
            }, this);
            var sqe = cc.sequence(action, callfun);
            // 执行动作
            this.node.runAction(sqe);
        }, 0.1);
    },
    ///显示TIPS,消失时间可控制
    _showTipsTime:function(txt, time){
         this.node.active = true;
        // 停止所有动作
        this.node.stopAllActions();
        var action = cc.fadeIn(0);
        
        // 执行动作
        this.node.runAction(action);   
        
        this.textLabel.string = txt;
        this.scheduleOnce(function () {
            var action = cc.fadeOut(time);
            var callfun = cc.callFunc(function () {
                this.node.active = false;
            }, this);
            var sqe = cc.sequence(action, callfun);
            // 执行动作
            this.node.runAction(sqe);
        }, 0.1);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
