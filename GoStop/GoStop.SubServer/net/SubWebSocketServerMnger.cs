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
					wsServer.IpAddress, wsServer.Port));
			}
			else
			{
				Log.WriteError(string.Format("" + clsName + " Start Error -> ({0}:{1})",
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
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> PASS({1}:{2})", connId, ip.ToString(), port));
			}
			else
			{
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> Server_GetClientAddress() Error", connId));
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
				Log.WriteInfo(string.Format(" > [{0},OnAccept] -> SetConnectionExtra fail", connId));
				return HandleResult.Ignore;
			}

			return HandleResult.Ok;
		}
		private HandleResult OnWSMessageBody(IntPtr connId, byte[] bytes)
		{
			Log.ConsoleWrite("--------------OnWSMessageBody");
			var state = wsServer.GetWSMessageState(connId);
			if (state != null)
			{
				// 原样返回给客户端
				wsServer.SendWSMessage(connId, state, bytes);
			}
			return HandleResult.Ok;
		}

		private HandleResult OnClose(IntPtr connId, SocketOperation enOperation, int errorCode)
		{
			Log.ConsoleWrite("--------------OnClose");
			//客户端关闭连接
			if (errorCode == 0)
				Log.WriteInfo(string.Format(" > [{0},OnClose]", connId));
			else
				Log.WriteInfo(string.Format(" > [{0},OnError] -> OP:{1},CODE:{2}", connId, enOperation, errorCode));
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

		//private HandleResult WsServer_OnSend(IntPtr connId, byte[] bytes)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnSend");
		//	string str = Encoding.UTF8.GetString(bytes);
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnPrepareListen(IntPtr soListen)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnPrepareListen");
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnPointerDataReceive(IntPtr connId, IntPtr pData, int length)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnPointerDataReceive");
		//	return HandleResult.Ok;
		//}

		//private HttpParseResult WsServer_OnPointerDataBody(IntPtr connId, IntPtr pData, int length)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnPointerDataBody");
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResult WsServer_OnMessageBegin(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnMessageBegin");
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResult WsServer_OnHeader(IntPtr connId, string name, string value)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnHeader");
		//	return HttpParseResult.Ok;
		//}

		//private HandleResult WsServer_OnClose(IntPtr connId, SocketOperation enOperation, int errorCode)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnClose");
		//	return HandleResult.Ok;
		//}

		//private HttpParseResult WsServer_OnChunkHeader(IntPtr connId, int length)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnChunkHeader");
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResult WsServer_OnChunkComplete(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnChunkComplete");
		//	return HttpParseResult.Ok;
		//}

		//private HandleResult WsServer_OnAccept(IntPtr connId, IntPtr pClient)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnAccept");
		//	string ip = string.Empty;
		//	ushort port = 0;
		//	if (wsServer.GetRemoteAddress(connId, ref ip, ref port))
		//	{
		//		Log.WriteInfo(string.Format("" + clsName + "- > [{0},OnAccept] -> PASS({1}:{2})",
		//			connId, ip.ToString(), port));
		//	}
		//	else
		//	{
		//		Log.WriteInfo(string.Format("" + clsName + " - > [{0},OnAccept] -> Server_GetAddress() Error",
		//			connId));
		//		return HandleResult.Error;
		//	}
		//	//设置附加数据，保存用户连接，用来与客户端通信
		//	Session session = new Session
		//	{
		//		ConnId = connId,
		//		IpAddress = ip,
		//		Port = port,
		//		player = null
		//	};
		//	//设置
		//	if (!wsServer.SetExtra(connId, session))
		//	{
		//		Log.WriteInfo(string.Format("" + clsName + "- > [{0},OnAccept] -> SetConnectionExtra fail", connId));
		//		return HandleResult.Error;
		//	}
		//	Console.WriteLine("处理WsServer_OnAccept完成");
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnHandShake(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnHandShake");
		//	var data = Encoding.UTF8.GetBytes("测试数据");
		//	var state = wsServer.GetWSMessageState(connId);
		//	if (state != null)
		//	{
		//		// 原样返回给客户端
		//		wsServer.SendWSMessage(connId, state, data);
		//	}
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnReceive(IntPtr connId, byte[] bytes)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnReceive");
		//	return HandleResult.Ok;
		//}

		//private HttpParseResult WsServer_OnUpgrade(IntPtr connId, HttpUpgradeType upgradeType)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnUpgrade");
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResult WsServer_OnParseError(IntPtr connId, int errorCode, string errorDesc)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnParseError");
		//	Log.ConsoleWrite(errorCode.ToString());
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResultEx WsServer_OnHeadersComplete(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnHeadersComplete");
		//	return HttpParseResultEx.Ok;
		//}

		//private HttpParseResult WsServer_OnMessageComplete(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnMessageComplete");
		//	return HttpParseResult.Ok;
		//}

		//private HttpParseResult WsServer_OnBody(IntPtr connId, byte[] bytes)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnBody");
		//	return HttpParseResult.Ok;
		//}

		//private HandleResult WsServer_OnPointerWSMessageBody(IntPtr connId, IntPtr pData, int length)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnPointerWSMessageBody");
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnWSMessageBody(IntPtr connId, byte[] data)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnWSMessageBody");
		//	// 如果是文本,应该用utf8编码
		//	string str = Encoding.UTF8.GetString(data);
		//	Console.WriteLine("OnWSMessageBody() -> {0}", str);

		//	//// 获取客户端的state
		//	//var state = wsServer.GetWSMessageState(connId);
		//	//if (state != null)
		//	//{
		//	//	// 原样返回给客户端
		//	//	wsServer.SendWSMessage(connId, state, data);
		//	//}
		//	return HandleResult.Ok;
		//}
		//private HandleResult WsServer_OnWSMessageComplete(IntPtr connId)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnWSMessageComplete");
		//	var buffer = Encoding.UTF8.GetBytes("测试数据");
		//	wsServer.Send(connId, buffer, buffer.Length);
		//	return HandleResult.Ok;
		//}
		//private HandleResult WsServer_OnWSMessageHeader(IntPtr connId, bool final, byte reserved, byte operationCode, byte[] mask, ulong bodyLength)
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnWSMessageHeader");
		//	var state = wsServer.GetWSMessageState(connId);
		//	//WSOpcode.Close为客户端主动断开连接
		//	if (state != null && state.OperationCode == WSOpcode.Close)
		//	{
		//		wsServer.Disconnect(connId);
		//	}
		//	return HandleResult.Ok;
		//}

		//private HandleResult WsServer_OnShutdown()
		//{
		//	Log.ConsoleWrite("--------------WsServer_OnShutdown");
		//	return HandleResult.Ok;
		//}
	}
}
