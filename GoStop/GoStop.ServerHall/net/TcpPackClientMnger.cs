using GoStop.BaseCommon;
using HPSocketCS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.ServerHall.net
{
	public class TcpPackClientMnger
	{
		private static TcpPackClientMnger Instance = null;
		private TcpPackClientMnger() { }
		private readonly static object obj = new object();
		public static TcpPackClientMnger GetInstance()
		{
			if (Instance == null)
			{
				lock (obj)
				{
					if (Instance == null)
					{
						Instance = new TcpPackClientMnger();
					}
				}
			}
			return Instance;
		}

		private TcpPackClient tcpPackClient = null;
		private const string clsName = "TcpPackClientMnger";

		public void Connect(string address, ushort port)
		{
			tcpPackClient = new TcpPackClient();

			tcpPackClient.OnConnect += new TcpClientEvent.OnConnectEventHandler(OnConnect);
			tcpPackClient.OnReceive += new TcpClientEvent.OnReceiveEventHandler(OnReceive);
			tcpPackClient.OnClose += new TcpClientEvent.OnCloseEventHandler(OnClose);

			if (tcpPackClient.Connect(address, port))
			{
				Log.WriteInfo(string.Format("" + clsName + " Connect {0}:{1} OK", address, port));
			}
			else
			{
				Log.WriteInfo(string.Format("" + clsName + " Connect {0}:{1} ERROR", address, port));
			}
		}

		private HandleResult OnClose(TcpClient sender, SocketOperation enOperation, int errorCode)
		{
			Log.ConsoleWrite("-----------------OnClose");
			return HandleResult.Ok;
		}

		private HandleResult OnReceive(TcpClient sender, byte[] bytes)
		{
			Log.ConsoleWrite("-----------------OnReceive");
			return HandleResult.Ok;
		}

		private HandleResult OnConnect(TcpClient sender)
		{
			Log.ConsoleWrite("-----------------OnConnect");
			return HandleResult.Ok;
		}
	}
}
