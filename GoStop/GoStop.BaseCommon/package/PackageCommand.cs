using System;
using System.Collections.Generic;


namespace GoStop.BaseCommon
{
	public enum MainCommand
	{
		//错误
		MC_ERROR = 0,
		//子服务器
		MC_SUBSERVER = 1,
		//玩家账户信息
		MC_ACCOUNT = 2,

	}
	public enum SecondCommand //不要超过 32767 因为会溢出，会和short转换
	{
		//错误相关
		SC_ERROR_hall = 1, //大厅服务器错误

		//子服务器相关
		SC_SUBSERVER_uploadWsIpAddress = 10,
		SC_SUBSERVER_uploadClientConnCount = 11,

		//客户端
		SC_ACCOUNT_login = 20,
		SC_ACCOUNT_login_ret = 21,

	}

}
