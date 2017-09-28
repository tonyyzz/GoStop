using GoStop.BaseCommon;
using GoStop.ClientSide._Test;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.ClientSide
{
	public class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop客户端正在连接服务器...】-------------------");
			new HttpClientTest().Do();
		}
	}
}
