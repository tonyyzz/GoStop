var packageFuntion = {
	errorHallFunc(target, pack) {
		var errorType = pack.readInt();
		switch (errorType) {
			case 1: { //已经登录
				console.warn("玩家已经登录");
			} break;
			default: {
				console.warn("错误消息未知");
			} break;
		}
	},
	accountLoginRetFunc(target, pack) {
		console.log(pack);
		var serverType = pack.readString();
		console.info("serverType:" + serverType);
		if (serverType === "main") {
			var flag = pack.readInt();
			console.log(flag);
			if (flag === 1) {
				var subAddress = pack.readString();
				console.log(subAddress);
				var subPort = pack.readInt();
				console.log(subPort);
				webSocketMnger.close();
				webSocketMnger.connect(subAddress, subPort);
			}
		} else if (serverType === "sub") {
			var Id = pack.readInt();
			console.log(Id);
			var Name = pack.readString();
			console.log(Name);
			var Money = pack.readInt();
			console.log(Money);
			var Level = pack.readInt();
			console.log(Level);

			//存储玩家信息
			var player = {};
			player.Id = Id;
			player.Name = Name;
			player.Money = Money;
			player.Level = Level;
			console.log(player);
			service.setPlayerInfo(player);
		} else {
			console.error("serVerType错误");
		}
	}
}