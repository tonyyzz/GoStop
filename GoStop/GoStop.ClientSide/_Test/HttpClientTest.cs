using GoStop.ClientSide.net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GoStop.ClientSide._Test
{
	public class HttpClientTest
	{
		public void Do()
		{
			HttpClientMnger.GetInstance().Connect();

			new Thread(o =>
			{
				Thread.Sleep(500);
				HttpClientMnger.GetInstance().Send();
			})
			{ IsBackground = true, Priority = ThreadPriority.Highest }.Start();
		}
	}
}
