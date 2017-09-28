var AudioObject = require('AudioObject');
//音效管理器 只用于音效 背景音乐需要单独处理
var AudioManager = cc.Class({
    extends: cc.Component,

    properties: {
        musicBg: {
            default: [],
            type: AudioObject,  // 
        },
        audioCommon: {
            default: [],
            type: AudioObject,  // 公共音效
        },
    },
    statics: {
        instance: null,//单例
        // 声明静态方法 
        playAudio: function (name) {
            if (AudioManager.instance != null)
                AudioManager.instance.play(name);
        },
        playMusic: function (name) {

            if (AudioManager.instance != null)
                AudioManager.instance.playMusic(name);
        },
        //设置音乐音量
        setMusicVolume: function (volume) {
            if (AudioManager.instance != null) {
                AudioManager.instance.setMusicVolume(volume);
            }
        },
        //设置音效音量
        setSoundVolume: function (volume) {
            if (AudioManager.instance != null) {
                AudioManager.instance.setSoundVolume(volume);
            }
        },
        musicVolume: 1,//音乐音量
        soundVolume: 1,//音效音量

    },

    onLoad: function () {
        this.audioMap = {};
        AudioManager.instance = this;

        var source = this.getComponents(cc.AudioSource);

        for (var i = 0; i < this.audioCommon.length; i++) {
            this.audioMap[this.getResourceName(this.audioCommon[i].audioUrl)] = this.audioCommon[i].audioUrl;
        }
        for (var i = 0; i < this.musicBg.length; i++) {
            this.audioMap[this.getResourceName(this.musicBg[i].audioUrl)] = this.musicBg[i].audioUrl;
        }
        ///让节点一直存在 不销毁  想要在切换场景的时候销毁 需要调用 cc.game.removePersistRootNode 
        cc.game.addPersistRootNode(this.node);
    },
    // 获取音乐音效资源文件名作为Map的key
    getResourceName: function (audioUrl) {
        var s = audioUrl.split('/');
        var s2 = s[s.length - 1].split('.');
        var key = s2[0];    //音乐资源文件名
        s = null; s2 = null;
        return key
    },
    //播放音效
    play: function (name) {
        if (!this.audioMap[name]) {
            cc.log("play audio error !! ");
            return;
        }
        cc.audioEngine.playEffect(this.audioMap[name], false, true);
    },
    //播放背景音乐
    playMusic: function (name) {
        if (!this.audioMap[name]) {
            //    cc.log("play audio error !!");
            return;
        }
        cc.audioEngine.stopMusic(true);//先停止再播放
        cc.audioEngine.playMusic(this.audioMap[name], true);

        //if (cc.sys.isBrowser || cc.sys.isMobile)
        //    cc.audioEngine.playMusic(this.audioMap[name], true, true);

    },
    setMusicVolume: function (volume) {
        AudioManager.musicVolume = volume;
        cc.audioEngine.setMusicVolume(volume);
    },
    setSoundVolume: function (volume) {

        AudioManager.soundVolume = volume;
        cc.audioEngine.setEffectsVolume(volume);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
