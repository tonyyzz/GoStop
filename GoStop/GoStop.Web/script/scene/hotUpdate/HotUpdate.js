cc.Class({
    extends: cc.Component,

    properties: {
        manifestUrl: cc.RawAsset,   //将asset目录下的manifest文件在编辑器中拖到当前节点
    },

    // use this for initialization
    onLoad: function () {
        
    },
    // 更新初始化
    updateInit: function (updateMgr) {
        this.updateManger = updateMgr;
        this.isUpdating = false;    //是否在更新过程中

        // 热更新只支持原生环境
        if (!cc.sys.isNative) return;

        // "projectName-remote-asset"，这里是热更新资源存放文件夹，命名格式建议："工程名-remote-asset"
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'projectName-remote-asset');
        // cc.log('Storage path for remote asset : ' + storagePath);  //输出本地热更新资源存放路径
        // cc.log('Local manifest URL : ' + this.manifestUrl);
        this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }

        // 自定义版本号的高低规则，检测更新的时候回调这里
        this._am.setVersionCompareHandle(function (versionA, versionB) {
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b)
                    continue;
                else
                    return a - b;
            }
            if (vB.length > vA.length)
                return -1;
            else
                return 0;
        });

        /**
          *检测有没有更新失败的资源
          *设置验证回调,但我们还没有md5校验函数,所以只有打印一些消息
          *如果验证通过返回true,否则返回假
        */
        this._am.setVerifyCallback(function (path, asset) {
            var compressed = asset.compressed;    // 当asset被压缩,我们不需要检查它的md5,因为zip文件已被删除。
            var expectedMD5 = asset.md5;            // 获取正确的md5值。
            var relativePath = asset.path;      // asset路径是相对路径和路径。
            var size = asset.size;              // asset文件的大小,但这个值可能缺少。
            if (compressed) {
                var log = "Verification passed : " + relativePath;
                return true;
            } else {
                var log = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // 当并发任务太多了，一些Android设备可能减慢下载过程。
            // 值可能不准确,请做更多的测试,找到最适合你的游戏。
            this._am.setMaxConcurrentTask(2);
        }

        this.checkUpdate();
    },

    //更新检测
    checkUpdate: function () {

        // 判断是否获取到manifest文件，获取失败则停止更新
        if (!this._am.getLocalManifest().isLoaded()) {
            var log = 'Failed to load local manifest ...';
            return;
        }

        // 注册更新监听
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));    //回调checkCb函数
        cc.eventManager.addListener(this._checkListener, 1);

        this._am.checkUpdate();
        this.isUpdating = true;
    },

    checkCb: function (event) {
        // cc.log('Code: ' + event.getEventCode());
        var log = null;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:    //没有找到本地manifest版本文件
                log = "No local manifest file found, hot update skipped.";
                this.updateLost();
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:    //远程版本文件加载错误
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:       //远程版本文件解析错误
                log = "Fail to download manifest file, hot update skipped.";
                this.updateLost();
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:         //本地版本跟远程版本一致，不用更新
                log = "Already up to date with the latest remote version.";
                this.notNewVersion();
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:          //发现新版本
                log = 'New version found, please try to update.';
                ////////发现版本，在这里处理版本的更新，选择大更新安装包替换或者热更新
                /////例： 以版本号（X.X.X格式）的第一个版本号差异对比
                var remoteVersion = this._am.getRemoteManifest().getVersion();
                var localVersion = this._am.getLocalManifest().getVersion();//获取本地版本号
                if (remoteVersion[0] - localVersion[0] >= 1){   //版本差异大于等于1，则进行大更新
                    this.updateBig();
                }else{
                    this.hotUpdateStart();
                }
                break;
            default:
                return;
        }
        this.updateLog(log);
    },

    // 开始热更新，在这里进行更新的一些处理
    hotUpdateStart: function () {
        if (this._am) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));  //回调updateCb函数
            cc.eventManager.addListener(this._updateListener, 1);

            this._am.update();
            this.isUpdating = true;
        }
    },

    updateCb: function (event) {
        var needRestart = false;    //是否需要重试启动程序
        var failed = false;         //是否更新失败
        var log = null;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:    //没有发现本地manifest文件，跳过更新
                log = 'No local manifest file found, hot update skipped.';
                failed = true;
                this.updateLost();
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:        //更新进行中…
                var msg = event.getMessage();
                if (msg) {
                    log = 'Updated file: ' + msg;   //更新文件消息
                }

                var progressFile = event.getPercentByFile() / 100;  //文件更新进程
                var progressByte = event.getPercent() / 100;            //字节更新进程
                this.updateProgress(progressFile, progressByte);  
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:    //远程版本文件加载错误
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:       //远程版本文件解析错误
                log = 'Fail to download manifest file, hot update skipped.';
                // failed = true;
                this.updateLost();
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:         //本地版本跟远程版本一致，不用更新
                log = 'Already up to date with the latest remote version.';
                failed = true;
                this.notNewVersion();
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:            //更新完成
                log = 'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:              //更新失败
                log = 'Update failed. ' + event.getMessage();
                this.updateLost();
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:             //更新过程出现错误
                log = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                this.updateLost();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:           //解压错误
                log = event.getMessage();
                this.updateLost();
                break;
            default:
                break;
        }
        this.updateLog(log);
        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // 预先考虑manifest的搜索路径
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            cc.log(JSON.stringify(newPaths));

            Array.prototype.unshift(searchPaths, newPaths);
            // 这个值将被检索和附加在游戏启动默认搜索路径,
            // !!! 重新添加主要的搜索路径。js是非常重要的,否则,新的脚本不会生效。
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

            jsb.fileUtils.setSearchPaths(searchPaths);
            if (cc.sys.isMobile)
                cc.game.restart();  //更新结束后重启客户端
        }
    },

    /**
     * 未发现新版本，跳过更新
     */
    notNewVersion: function () {
        this.updateManger.updateOver();
    },

    /**
     * 更新失败的回调
     * 失败的情况下回进入这个函数，失败后在这里进行一些相关处理
     */
    updateLost: function () {
        this.updateManger.updateLost();
    },

    /**
     * 重新更新
     */
    retryUpdate: function () {
        this._am.downloadFailedAssets();
    },

    /**
     * 更新日志
     */
    updateLog: function (log){
        if(!log) return;

        this.updateManger.setUpdateLog(log);
    },

    /**
     * 更新进度数值
     */
    updateProgress: function(fileVal, byteVal){
        this.updateManger.setUpdateProgress(fileVal, byteVal);
    },

    /**
     * 大更新
     */
    updateBig: function(){
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'projectName-remote-asset/');
        var ret = jsb.fileUtils.removeDirectory(storagePath);   //删除缓存资源 
        //////// 后续处理
        this.updateManger.updateBig();
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
