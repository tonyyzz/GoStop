using System;
using System.Collections.Generic;


namespace GoStop.BaseCommon
{
	public enum MainCommand
	{
		/// <summary>
		/// 错误
		/// </summary>
		MC_ERROR = 0,
		/// <summary>
		/// 子服务器
		/// </summary>
		MC_SUBSERVER = 1,
		MC_CLIENT = 2,

	}
	public enum SecondCommand //不要超过 32767 因为会溢出，会和short转换
	{
		//错误相关
		SC_ERROR_hall = 1, //大厅服务器错误

		//子服务器相关
		SC_SUBSERVER_uploadWsIpAddress = 10,

		//客户端
		SC_CLIENT_login = 20,
		SC_CLIENT_login_ret = 21,

	}

	/// <summary>
	/// 错误消息
	/// </summary>
	public enum Error
	{
		/// <summary>
		/// 已经在登录中
		/// </summary>
		login_isIn = 1,
	}
}
