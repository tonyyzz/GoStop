using GoStop.BaseCommon;
using HPSocketCS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer
{
	/// <summary>
	/// 与主服务器通信
	/// </summary>
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
			bool isOnline = false;
			var flag = SubWebSocketServerMnger.GetInstance().Start(subWsAddress, subWsPort, out subWsAddress, out subWsPort);
			if (flag) //WsSocket启动成功后，将wsSocket的IPAddress上传至主服务器
			{
				string wsTransmitAddress = subWsAddress;
				ushort wsTransmitPort = subWsPort;
				if (isOnline) //如果是线上，则获取外网ip
				{
					wsTransmitAddress = IPAddressUtils.GetOuterNatIP();
				}
				Package pack = new Package(MainCommand.MC_SUBSERVER, SecondCommand.SC_SUBSERVER_uploadWsIpAddress);
				pack.Write(wsTransmitAddress);
				pack.Write(wsTransmitPort);
				Send(pack);
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

		public void Send(Package pack)
		{
			byte[] bytes = pack.GetBuffer();
			int len = pack.getLen();
			byte[] bytes_tmp = new byte[len];
			Array.Copy(bytes, 0, bytes_tmp, 0, len);
			CustomDE.Encrypt(bytes_tmp, 0, bytes_tmp.Length);
			tcpPackClient.Send(bytes_tmp, bytes_tmp.Length);
		}
	}
}
