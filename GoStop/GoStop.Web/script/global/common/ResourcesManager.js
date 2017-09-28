//           缓存资源管理
cc.Class({
    extends: cc.Component,

    properties: {
        matrixSprite: cc.Prefab,    
    },

    // use this for initialization
    onLoad: function () {
        this.poolManager = this.getComponent('PoolMgr');
        this.loadObject();
    },
    
    loadObject: function () {
        this.poolManager.initPool(this.matrixSprite.name, 30, this.matrixSprite);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
