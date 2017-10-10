using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer
{
	public class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop主服务器正在启动...】-------------------");

			PackageConfig.Register();

			string mainWsAddress = IPAddress.Any.ToString();
			ushort mainWsPort = 50006;
			MainWebSocketServerMnger.GetInstance().Start(mainWsAddress, mainWsPort);

			string tcpPackAddress = IPAddress.Any.ToString();
			ushort tcpPackPort = 50007;
			TcpPackServerMnger.GetInstance().Start(tcpPackAddress, tcpPackPort);
		}
	}
}
