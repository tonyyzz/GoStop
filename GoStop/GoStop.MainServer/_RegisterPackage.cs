using GoStop.BaseCommon;
using GoStop.MainServer.package.subServer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer
{
	class PackageConfig
	{
		/// <summary>
		/// 注册包体
		/// </summary>
		public static void Register()
		{
			#region ------------账号------------
			PackageManage.Instance.RegisterPackage((short)MainCommand.MC_SUBSERVER, (short)SecondCommand.SC_SUBSERVER_uploadWsIpAddress, new UploadWsIPAddressPacket());
			#endregion

			

		}
	}
}
