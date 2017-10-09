
var service = {
	storageConfig: {
		playerInfo: "PLAYERINFO"
	},
	setPlayerInfo(obj) {
		localStorage.setItem(service.storageConfig.playerInfo, JSON.stringify(obj));
	},
	getPlayerInfo() {
		return JSON.parse(localStorage.getItem(service.storageConfig.playerInfo));
	}
}