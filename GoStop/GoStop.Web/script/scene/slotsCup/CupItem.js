cc.Class({
    extends: cc.Component,

    properties: {

    },

    initCupItem: function (cupMgr) {
        this.id = null;
        this.cup = this.node.getChildByName('Cup');
        this.resultLab = this.node.getChildByName('Result').getComponent(cc.Label);
        this.resultLab.node.active = false;
        this.button = this.node.getComponent(cc.Button);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (!this.button.interactable) return;
            this.button.interactable = false;
            cupMgr.clickCup(this.id);

        }, this);
    },

    // 设置数据
    setData: function (data) {

        this.id = data.id;
        //类型：1、增加2开启次数；2、增加3开启次数；3:奖金
        if (data.type === 1) {
            this.resultLab.string = 'Picks +2';
        }else if(data.type === 2){
            this.resultLab.string = 'Picks +3';
        }else if (data.type === 3)
            this.resultLab.string = data.gold;
        // 如果未开启
        if (data.isRead === 0) {
            this.button.interactable = true;
            this.cup.active = true;
            this.resultLab.node.active = false;
        }else{
            this.button.interactable = false;
            this.cup.active = false;
            this.resultLab.node.active = true;
        }
    },
    // 打开杯子
    openCup: function (data) {
        if (data.type === 1) {
            this.resultLab.string = 'Picks +2';
        }else if(data.type === 2){
            this.resultLab.string = 'Picks +3';
        }else {
            this.resultLab.string = data.gold;
        }
        this.button.interactable = false;
        this.cup.active = false;
        this.resultLab.node.active = true;
    },
    // 重置到初始状态
    cupReset: function () {
        this.cup.active = true;
        this.resultLab.node.active = false;
        this.button.interactable = true;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
