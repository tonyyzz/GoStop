cc.Class({
    extends: cc.Component,

    properties: {
        originalCostLab: cc.Label,  //原获取金额
        discountPriceLab: cc.Label, //活动加成后金额
        freeLab: cc.Label,  //加成百分比
    },

    // use this for initialization
    onLoad: function () {
        this.id = null; //商品ID
    },
    // 设置商品配置
    setConfig: function (config, shop) {
        this.shopManager = shop;
        this.originalCostLab.string = config.originalPrice;
        this.discountPriceLab.string = config.presentPrice;
        this.freeLab.string = config.free + "%";
        this.id = config.id;
    },
    //点击购买商品
    btn_buy: function () {
        this.shopManager.buyCommodity(this.id, Number(this.discountPriceLab.string));
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
