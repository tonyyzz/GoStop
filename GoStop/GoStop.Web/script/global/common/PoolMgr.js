///对象池节点
var NodePool = cc.Class({
    name: 'NodePool',
    properties: {
        prefab: cc.Prefab,
        poolName: '',
        size: 0
    },
    ctor() {
        this.idx = 0;
        this.initList = [];
        this.list = [];
    },
    init(name, num, _prefab) {
        this.prefab = _prefab;
        this.size = num;
        this.poolName = name;
        for (let i = 0; i < this.size; ++i) {
            let obj = cc.instantiate(this.prefab);
            this.initList[i] = obj;
            this.list[i] = obj;
        }
        this.idx = this.size - 1;
    },
    initN() {
        init(this.poolName, this.size, this.prefab);
    },
    reset() {
        for (let i = 0; i < this.size; ++i) {
            let obj = this.initList[i];
            this.list[i] = obj;
            if (obj.active) {
                obj.active = false;
            }
            if (obj.parent) {
                obj.removeFromParent();
            }
        }
        this.idx = this.size - 1;
    },

    pop() {
        if (this.idx < 0) {//如果池子没有 则实例化1个
            let obj = cc.instantiate(this.prefab);
            this.push(obj);
            if(!cc.sys.isMobile)
                cc.log ("new instantiate pool object");
            //return null;
        }
        let obj = this.list[this.idx];
        if (obj) {
            obj.active = true;
        }
        --this.idx;
        return obj;
    },
    push(obj) {
        ++this.idx;
        obj.active = false;
        if (obj.parent) {
            obj.removeFromParent();
        }
        this.list[this.idx] = obj;
    }
});

////对象池管理器  
cc.Class({
    extends: cc.Component,

    properties: {
        fixedPool: [NodePool]///固定对象池 不需要动态加载预制体的
    },

    // use this for initialization
    onLoad: function () {

        this.poolMap = {};
        for (var i = 0; i < this.fixedPool.length; i++) {
            var nodePool = this.fixedPool[i];
            this.poolMap[name] = nodePool;
            nodePool.initN();
        }
    },
    ///初始化池子
    ///参数name poolName 可以是prefab的文件名 但要唯一
    ///参数num  初始化池子的数量
    ///参数prefab 实例化需要的预制体
    initPool: function (name, num, prefab) {
        var nodePool = new NodePool();
        this.poolMap[name] = nodePool;
        nodePool.init(name, num, prefab);
    },

    ///存入池子
    pushToPool: function (name, obj) {
        var nodePool = this.poolMap[name];
        if (nodePool == null) {
            // cc.log('not pool name'+name);
            return;
        }
        nodePool.push(obj);
    },
    ///批量存入池子
    pushAllToPool: function (objList) {
        for (var i = objList.length - 1; i >= 0; i--) {
            var nodePool = this.poolMap[objList[i].name];
            if (nodePool == null) {
                return;
            }
            nodePool.push(objList[i]);
        }
    },
    ///从池子取出对象
    popFromPool: function (name) {
        var nodePool = this.poolMap[name];
        if (nodePool == null) {
            // cc.log('not pool name'+name);
            return null;
        }
        return nodePool.pop();
    },
    ///销毁
    onDestroy: function () {

    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
