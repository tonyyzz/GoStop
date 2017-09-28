using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer
{
	public class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop主服务器正在启动...】-------------------");
			string mainWsAddress = "127.0.0.1";
			ushort mainWsPort = 50006;
			MainWebSocketServerMnger.GetInstance().Start(mainWsAddress, mainWsPort);

			string tcpPackAddress = "127.0.0.1";
			ushort tcpPackPort = 50007;
			TcpPackServerMnger.GetInstance().Start(tcpPackAddress, tcpPackPort);
		}
	}
}
