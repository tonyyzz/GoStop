var MainCommand = {
	//错误
	MC_ERROR: 1,
	//子服务器
	MC_SUBSERVER: 2,
	//玩家账户信息
	MC_ACCOUNT: 3,

};
var SecondCommand = {
	//错误相关
	SC_ERROR_hall: 1, //大厅服务器错误

	//子服务器相关
	SC_SUBSERVER_uploadWsIpAddress: 10,

	//客户端
	SC_ACCOUNT_login: 20,
	SC_ACCOUNT_login_ret: 21,

};