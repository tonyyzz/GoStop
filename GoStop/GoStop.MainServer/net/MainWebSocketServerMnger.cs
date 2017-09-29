using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HPSocketCS;
using GoStop.BaseCommon;

namespace GoStop.MainServer
{
	class MySession : Session
	{
		public byte[] buffer = null;
		public int bufferLen = 0;
	}
	public class MainWebSocketServerMnger
	{
		private static MainWebSocketServerMnger Instance = null;
		private MainWebSocketServerMnger() { }
		private readonly static object obj = new object();
		public static MainWebSocketServerMnger GetInstance()
		{
			if (Instance == null)
			{
				lock (obj)
				{
					if (Instance == null)
					{
						Instance = new MainWebSocketServerMnger();
					}
				}
			}
			return Instance;
		}


		private WebSocketServer wsServer = null;

		private const string clsName = "MainWebSocketServerMnger";
		private int maxBufferSize = 1024;

		public bool Start(string bindAddress, ushort port)
		{
			wsServer = new WebSocketServer
			{
				IpAddress = bindAddress,
				Port = port
			};

			wsServer.OnAccept += new TcpServerEvent.OnAcceptEventHandler(OnAccept);
			wsServer.OnWSMessageBody += new WebSocketEvent.OnWSMessageBodyEventHandler(OnWSMessageBody);
			wsServer.OnClose += new TcpServerEvent.OnCloseEventHandler(OnClose);
			wsServer.OnShutdown += new TcpServerEvent.OnShutdownEventHandler(OnShutdown);

			var flag = wsServer.Start();
			if (flag)
			{
				Log.WriteInfo(string.Format("" + clsName + " Start OK -> ({0}:{1})",
					wsServer.IpAddress, port));
			}
			else
			{
				Log.WriteError(string.Format("" + clsName + " Start Fail -> ({0}:{1})",
					wsServer.ErrorMessage, wsServer.ErrorCode));
			}
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
				Log.WriteInfo(string.Format("" + clsName + " > [{0},OnAccept] -> PASS({1}:{2})", connId, ip.ToString(), port));
			}
			else
			{
				Log.WriteInfo(string.Format("" + clsName + " > [{0},OnAccept] -> Server_GetClientAddress() Error", connId));
			}
			// 设置附加数据
			MySession session = new MySession();
			session.ConnId = connId;
			session.IpAddress = ip;
			session.Port = port;
			session.buffer = new byte[maxBufferSize];//设置用户网络缓冲区

			////session.player = new Player(connId, tcp);//设置用户数据

			if (!wsServer.SetExtra(connId, session))
			{
				Log.WriteInfo(string.Format("" + clsName + " > [{0},OnAccept] -> SetConnectionExtra fail", connId));
				return HandleResult.Ignore;
			}

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
					Log.WriteInfo(string.Format("" + clsName + " - session = null > [{0},OnReceive] -> ({1} bytes)",
						connId, bytes.Length));
					return HandleResult.Error;
				}
				Log.WriteInfo(string.Format("" + clsName + " - > [{0},OnReceive] -> {1}:{2} ({3} bytes)",
					session.ConnId, session.IpAddress, session.Port, bytes.Length));
				int len = BitConverter.ToInt32(bytes, 0); //长度
				CustomDE.Decrypt(bytes, 0, bytes.Length);
				bytes = bytes.Skip(4).ToArray();
				short mainid = BitConverter.ToInt16(bytes, 0); //主协议
				short secondid = BitConverter.ToInt16(bytes, 2); //次协议
				Console.WriteLine("" + clsName + " : ----package log: 【{0}】正在调用主协议为【{1}】，次协议为【{2}】的接口",
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
				pack.SetSession(session);
				try
				{
					pack.Excute();
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
			//客户端关闭连接
			if (errorCode == 0)
				Log.WriteInfo(string.Format("" + clsName + " > [{0},OnClose]", connId));
			else
				Log.WriteInfo(string.Format("" + clsName + " > [{0},OnError] -> OP:{1},CODE:{2}", connId, enOperation, errorCode));
			// return HPSocketSdk.HandleResult.Ok;
			//MySession session = wsServer.GetExtra<MySession>(connId);
			//try
			//{
			//	Player player = (Player)session.player;
			//	if (player.gameid >= 0 && player.tableID >= 0)
			//	{
			//		Table table = GameManager.Instance.leaveTable(player, player.gameid, player.tableID);
			//		if (table != null)
			//		{
			//			//群发通知其他用户离开了
			//			KeyValuePair<int, User>[] list = table.GetAllUser();
			//			Package pack1 = new Package(MainCommand.MC_GAME, SecondCommand.SC_GAME_leave_notice);
			//			pack1.Write(player.pid);
			//			pack1.Write(player.pName);
			//			for (int i = 0; i < list.Length; i++)
			//			{
			//				KeyValuePair<int, User> kvp = list[i];
			//				kvp.Value.Send(pack1);
			//			}
			//		}
			//	}

			//	PlayerManager.Instance.PlayerLeave(player);

			//	if (tcp.State == ServiceState.Stoping)
			//	{
			//		Console.WriteLine(string.Format(" > [{0},玩家离开]", connId));
			//	}
			//}
			//catch (Exception ex)
			//{
			//	Log.WriteError(ex);
			//}
			//if (tcp.RemoveExtra(connId) == false)
			//{
			//	Log.WriteInfo(string.Format(" > [{0},OnClose] -> SetConnectionExtra({0}, null) fail", connId));
			//}



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
	}
}
