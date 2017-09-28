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
		/// 子服务期
		/// </summary>
		MC_SUBSERVER = 1,
		
	}
	public enum SecondCommand //不要超过 32767 因为会溢出，会和short转换
	{
		#region 错误相关
		SC_ERROR_hall = 1, //大厅服务器错误
		#endregion

		#region 子服务器相关
		SC_SUBSERVER_uploadWsIpAddress = 10,
		
		#endregion

		
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
