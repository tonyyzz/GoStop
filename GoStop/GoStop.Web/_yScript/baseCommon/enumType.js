var MainCommand = {
	/// <summary>
	/// 错误
	/// </summary>
	MC_ERROR : 0,
	/// <summary>
	/// 子服务器
	/// </summary>
	MC_SUBSERVER: 1,
	MC_CLIENT : 2,

};
var SecondCommand = {
	//错误相关
	SC_ERROR_hall: 1,

	//子服务器相关
	SC_SUBSERVER_uploadWsIpAddress: 10,

	//客户端
	SC_CLIENT_login: 20,
	SC_CLIENT_login_ret : 21,

};