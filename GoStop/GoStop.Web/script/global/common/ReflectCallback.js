 var ReflectCallback = cc.Class({
    name: 'ReflectCallback',
    statics:{
        // 进行Facebook授权认证
        isAccreditOver : false,
        facebookID : "",
        facebookName: '',
        accreditFacebook: function (id, name) {
            ReflectCallback.facebookID = id;
            ReflectCallback.facebookName = name;
            ReflectCallback.isAccreditOver = true;
        },
        // 登录时验证Facebook是否授权
        isVerifyOver: false,
        loginAccreditVerify: function (id) {
            ReflectCallback.isVerifyOver = true;
            ReflectCallback.facebookID = id;
        },
        // Facebook授权错误处理
        isAccreditError: false,    //是否授权出错
        accreditErrorID: 0,        //错误类型ID
        accreditError: function (id) {
            accreditErrorID = id;
            isAccreditError = true;
        },
    },
});

module.exports = ReflectCallback;
