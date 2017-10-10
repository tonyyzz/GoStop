using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HPSocketCS;
using GoStop.BaseCommon;
using System.Threading;

namespace GoStop.SubServer
{
	class MySession : Session
	{
		public byte[] buffer = null;
		public int bufferLen = 0;
	}
	public class SubWebSocketServerMnger
	{
		private static SubWebSocketServerMnger Instance = null;
		private SubWebSocketServerMnger() { }
		private readonly static object obj = new object();
		public static SubWebSocketServerMnger GetInstance()
		{
			if (Instance == null)
			{
				lock (obj)
				{
					if (Instance == null)
					{
						Instance = new SubWebSocketServerMnger();
					}
				}
			}
			return Instance;
		}


		private WebSocketServer wsServer = null;

		private const string clsName = "SubWebSocketServerMnger";
		private int maxBufferSize = 1024;

		public bool Start(string bindAddress, ushort port, out string realBindAddress, out ushort realPort)
		{
			realBindAddress = bindAddress;
			realPort = port;
			var flag = false;
			while (true)
			{
				Log.WriteInfo("while");
				wsServer = new WebSocketServer
				{
					IpAddress = bindAddress,
					Port = port
				};

				wsServer.OnAccept += new TcpServerEvent.OnAcceptEventHandler(OnAccept);
				wsServer.OnWSMessageBody += new WebSocketEvent.OnWSMessageBodyEventHandler(OnWSMessageBody);
				wsServer.OnClose += new TcpServerEvent.OnCloseEventHandler(OnClose);
				wsServer.OnShutdown += new TcpServerEvent.OnShutdownEventHandler(OnShutdown);

				flag = wsServer.Start();
				if (flag)
				{
					Log.WriteInfo(string.Format(clsName + " Start OK -> ({0}:{1})",
						wsServer.IpAddress, wsServer.Port));
					break;
				}
				else
				{
					Log.WriteError(string.Format(clsName + " Start Error -> ({0}:{1})",
						wsServer.ErrorMessage, wsServer.ErrorCode));
					port++;
				}
			}
			realBindAddress = wsServer.IpAddress;
			realPort = wsServer.Port;
			return flag;
		}

		private HandleResult OnAccept(IntPtr connId, IntPtr pClient)
		{
			Log.ConsoleWrite("--------------OnAccept");
			// 客户进入了
			// 获取客户端ip和端口
			string ip = string.Empty;
			ushort port = 0;
			if (wsServer.GetRemoteAddress(connId, ref ip, ref port))
			{
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> PASS({1}:{2})", connId, ip.ToString(), port));
			}
			else
			{
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> Server_GetClientAddress() Error", connId));
			}
			// 设置附加数据
			MySession session = new MySession
			{
				ConnId = connId,
				IpAddress = ip,
				Port = port,
				buffer = new byte[maxBufferSize],//设置用户网络缓冲区
				player = null
			};

			////session.player = new Player(connId, tcp);//设置用户数据

			if (!wsServer.SetExtra(connId, session))
			{
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> SetConnectionExtra fail", connId));
				return HandleResult.Ignore;
			}

			//向主服务器发送链接个数
			var connCount = wsServer.ConnectionCount;
			Package pack = new Package(MainCommand.MC_SUBSERVER, SecondCommand.SC_SUBSERVER_uploadClientConnCount);
			pack.Write(wsServer.IpAddress);
			pack.Write((int)wsServer.Port);
			pack.Write((long)connCount);
			TcpPackClientMnger.GetInstance().Send(pack);

			return HandleResult.Ok;
		}
		private HandleResult OnWSMessageBody(IntPtr connId, byte[] bytes)
		{
			try
			{
				if (bytes == null || bytes.Length <= 2)
				{
					return HandleResult.Ignore;
				}
				Log.ConsoleWrite("--------------OnWSMessageBody");
				var session = wsServer.GetExtra<Session>(connId);
				if (session == null)
				{
					Log.WriteInfo(string.Format(clsName + " - session = null > [{0},OnReceive] -> ({1} bytes)",
						connId, bytes.Length));
					return HandleResult.Error;
				}
				Log.WriteInfo(string.Format(clsName + " - > [{0},OnReceive] -> {1}:{2} ({3} bytes)",
					session.ConnId, session.IpAddress, session.Port, bytes.Length));
				int len = BitConverter.ToInt32(bytes, 0); //长度
				CustomDE.Decrypt(bytes, 0, bytes.Length);
				bytes = bytes.Skip(4).ToArray();
				short mainid = BitConverter.ToInt16(bytes, 0); //主协议
				short secondid = BitConverter.ToInt16(bytes, 2); //次协议
				Console.WriteLine(clsName + " : ----package log: 【{0}】正在调用主协议为【{1}】，次协议为【{2}】的接口",
						DateTime.Now.ToString("HH:mm:ss"), mainid, secondid);
				Package pack = PackageManage.Instance.NewPackage(mainid, secondid);
				if (pack == null)
				{
					throw new Exception(
						string.Format("主协议为【{0}】，次协议为【{1}】的包体不存在或者还未注册",
						mainid, secondid));
				}
				pack.Write(bytes, len);
				pack.ReadHead();
				pack.SetPosition(4);
				pack.SetSession(session);
				try
				{
					ThreadPool.QueueUserWorkItem(o =>
					{
						pack.Excute();
					});
					//pack.Excute();
				}
				catch (Exception ex)
				{
					Log.WriteError(ex);
					return HandleResult.Error;
				}
			}
			catch (Exception ex)
			{
				Log.WriteError(ex);
				return HandleResult.Ignore;
			}
			return HandleResult.Ok;
		}

		private HandleResult OnClose(IntPtr connId, SocketOperation enOperation, int errorCode)
		{
			Log.ConsoleWrite("--------------OnClose");
			if (errorCode == 0)
			{
				Log.WriteInfo(string.Format(clsName + " : [{0},OnClose]",
					connId));
			}
			else
			{
				Log.WriteInfo(string.Format(clsName + " : [{0},OnClose] -> OP:{1},CODE:{2}",
					connId, enOperation, errorCode));
			}
			var session = wsServer.GetExtra<Session>(connId);
			if (session != null && session.player != null)
			{
				Model.PlayerModel player = session.player as Model.PlayerModel;
				if (player != null)
				{
					Console.WriteLine(string.Format(clsName + " :-------------玩家【{0}】在【{1}】时下线----------------", player.Id, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")));
					player.Offline();//玩家下线
				}
				session = null;
				//移除该玩家与客户端的通信
				if (!wsServer.RemoveExtra(connId))
				{
					Log.WriteInfo(string.Format(clsName + " : [{0},OnClose] -> SetConnectionExtra({0}, null) fail",
						connId));
				}
			}

			return HandleResult.Ok;
		}
		private HandleResult OnShutdown()
		{
			Log.ConsoleWrite("--------------OnShutdown");
			// 服务关闭了
			Log.WriteInfo(" > [OnShutdown]");
			return HandleResult.Ok;
		}

		public void Send(IntPtr connId, Package pack)
		{
			byte[] bytes = pack.GetBuffer();
			int len = pack.getLen();
			byte[] bytes_tmp = new byte[len];
			Array.Copy(bytes, 0, bytes_tmp, 0, len);
			CustomDE.Encrypt(bytes_tmp, 0, bytes_tmp.Length);
			var state = wsServer.GetWSMessageState(connId);
			if (state != null)
			{
				// 原样返回给客户端
				wsServer.SendWSMessage(connId, state, bytes_tmp);
			}
		}

		public void Disconnect(IntPtr conID)
		{
			wsServer.Disconnect(conID);
		}
	}
}
