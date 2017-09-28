using GoStop.BaseCommon;
using GoStop.MainServer;
using HPSocketCS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer
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
			tcpPackClient = new TcpPackClient()
			{
				PackHeaderFlag = 0x2d
			};

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
		private HandleResult OnConnect(TcpClient sender)
		{
			Log.ConsoleWrite("-----------------OnConnect");
			//连接主服务器成功后，启动WebSocket子服务器
			string subWsAddress = "127.0.0.1";
			ushort subWsPort = 50008;
			bool isOnline = true;
			var flag = SubWebSocketServerMnger.GetInstance().Start(subWsAddress, subWsPort);
			if (flag)
			{
				string transmitAddress = subWsAddress;
				ushort transmitPort = subWsPort;
				if (isOnline) //如果是线上，则获取外网ip
				{
					transmitAddress = IPAddressUtils.GetOuterNatIP();
				}
				Send(Encoding.UTF8.GetBytes(transmitAddress));
			}
			return HandleResult.Ok;
		}
		private HandleResult OnReceive(TcpClient sender, byte[] bytes)
		{
			Log.ConsoleWrite("-----------------OnReceive");
			return HandleResult.Ok;
		}
		private HandleResult OnClose(TcpClient sender, SocketOperation enOperation, int errorCode)
		{
			Log.ConsoleWrite("-----------------OnClose");
			return HandleResult.Ok;
		}

		public void Send(byte[] data)
		{
			tcpPackClient.Send(data, data.Length);
		}
	}
}
