using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer
{
public	class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop服务器正在启动...】-------------------");
			string wsAddress = "127.0.0.1";
			ushort wsPort = 50006;
			WebSocketServerMnger.GetInstance().Start(wsAddress, wsPort);
		}
	}
}
