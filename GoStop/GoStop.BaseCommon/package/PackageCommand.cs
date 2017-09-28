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
		/// 账号
		/// </summary>
		MC_ACCOUNT = 1,
		
	}
	public enum SecondCommand //不要超过 32767 因为会溢出，会和short转换
	{
		#region 错误相关
		SC_ERROR_hall = 1, //大厅服务器错误
		#endregion

		#region 账户相关
		SC_ACCOUNT_login = 100, //登录
		SC_ACCOUNT_login_ret = 101,
		
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
