using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer
{
	public class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop子服务器正在启动...】-------------------");
			string tcpPackAddress = "127.0.0.1";
			ushort TcpPackPort = 50007;
			TcpPackClientMnger.GetInstance().Connect(tcpPackAddress, TcpPackPort);
		}
	}
}
