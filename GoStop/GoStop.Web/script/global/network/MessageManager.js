var MessageManager = cc.Class({
    extends: cc.Component,

    properties: {
    },
    statics: {//静态成员
        callbackMap: {},//回调map
        ///注册消息回调
        registerMsgCallback: function (mainID, secondID, callback, target) {
            var key = mainID.toString() + secondID;
            var list = MessageManager.callbackMap[key];
            if (list == undefined) {
                list = new Array();
                MessageManager.callbackMap[key] = list;
            }
            for (var i = 0; i < list.length; i++) {
                if (list[i].callback == callback && list[i].target == target) {
                    //已经注册了
                    return;
                }
            }
            var obj = new Object();
            obj.callback = callback;
            obj.target = target;
            list.push(obj);
        },
        //删除消息回调
        deleteMsgCallback: function (mainID, secondID, callback, target) {
            var key = mainID.toString() + secondID;
            var list = MessageManager.callbackMap[key];
            if (list == undefined || list == null || list.length <= 0)
                return;
            for (var i = 0; i < list.length; i++) {
                if (list[i].callback == callback && list[i].target == target) {
                    list.splice(i, 1);
                    //cc.log("deleteMsgCallback:"+key);
                    return;
                }
            }
        },
        ///获得消息回调
        getMsgCallback: function (mainID, secondID) {
            var key = mainID.toString() + secondID;
            var list = MessageManager.callbackMap[key];
            if (list == undefined && !cc.sys.isMobile) {
                //cc.log("MessageList == undefined=========== getMsgCallback error!" + key);
                return;
            }
            if (list.length == 0 && !cc.sys.isMobile) {
                //cc.log("MessageList.length == 0=========== getMsgCallback error! msgid:" + key);
                return;
            }
            return list;

        },

    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
