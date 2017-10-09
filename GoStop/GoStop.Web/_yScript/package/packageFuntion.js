var packageFuntion = {
	accountLoginRetFunc(target, pack) {
		console.log(pack);
		var serverType = pack.readString();
		console.info("serverType:" + serverType);
		if (serverType == "main") {
			var flag = pack.readInt();
			console.log(flag);
			if (flag == 1) {
				var subAddress = pack.readString();
				console.log(subAddress);
				var subPort = pack.readInt();
				console.log(subPort);
				webSocketMnger.close();
				webSocketMnger.connect(subAddress, subPort);
			}
		} else if (serverType == "sub") {
			var testStr = pack.readString();
			console.log(testStr);
		} else {
			console.error("serVerType错误");
		}
	}
}