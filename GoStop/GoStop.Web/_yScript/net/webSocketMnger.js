var webSocketMnger = {
	ws: null,
	connect: (address, port) => {
		MessageRegister.register();
		ws = new WebSocket("ws://" + address + ":" + port);
		ws.binaryType = "arraybuffer";
		ws.onopen = (event) => {
			console.log("onopen");
			var package = new Package(MainCommand.MC_ACCOUNT, SecondCommand.SC_ACCOUNT_login);
			webSocketMnger.send(package);
		}
		ws.onmessage = function (event) {
			var pack = new Package();
			pack.InitFromNet(event.data);
			webSocketMnger.handleMessage(pack);
			pack = null;
		};
		ws.onclose = function (event) {
			console.log(event);
			console.log("WebSocketClosed!");
		};
		ws.onerror = function (event) {
			console.log(event);
			console.log("WebSocketError!");
		};
	},
	send: (pack) => {
		var bytes = pack.getbytes();
		var len = pack.getbytesLen();
		var buffer_tmp = new Uint8Array(bytes, 0, len);
		var enc = buffer_tmp;
		for (var i = 0; i < len; i++)
			enc[i] ^= 0xa7;
		var result = new DataView(new ArrayBuffer(4 + enc.byteLength));
		result.setInt32(0, len, true);

		for (var i = 0; i < enc.byteLength; i++) {
			result.setUint8(i + 4, enc[i], true);
		}
		ws.send(result.buffer);
		result = null;
		buffer_tmp = null;
	},

	close: () => {
		if (!!ws) ws.close();
	},
	///接收到返回的消息，消息处理
	handleMessage(pack) {
		if (!pack.mainID || !pack.secondID) {
			console.warn("错误的消息包 " + pack.mainID + " " + pack.secondID + "");
			return;
		}
		var callbackList = MessageManager.getMsgCallback(pack.mainID, pack.secondID);
		if (!!callbackList && callbackList.length > 0) {
			for (var i = 0; i < callbackList.length; i++) {
				var callbackObj = callbackList[i];
				callbackObj.callback(callbackObj.target, pack);
				callbackObj = null;
			}
		}
		callbackList = null;
	},
}