using GoStop.BaseCommon;
using GoStop.SubServer.package.client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer
{
	class PackageConfig
	{
		/// <summary>
		/// 注册包体
		/// </summary>
		public static void Register()
		{
			//
			PackageManage.Instance.RegisterPackage((short)MainCommand.MC_ACCOUNT, (short)SecondCommand.SC_ACCOUNT_login, new AccountLoginPacket());

		}
	}
}
