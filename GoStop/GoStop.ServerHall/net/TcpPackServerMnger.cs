using GoStop.BaseCommon;
using HPSocketCS;
using System;
using System.Linq;
using System.Net;

namespace GoStop.ServerHall
{
	public class TcpPackServerMnger
	{
		private static TcpPackServerMnger Instance = null;
		private TcpPackServerMnger() { }
		private readonly static object obj = new object();
		public static TcpPackServerMnger GetInstance()
		{
			if (Instance == null)
			{
				lock (obj)
				{
					if (Instance == null)
					{
						Instance = new TcpPackServerMnger();
					}
				}
			}
			return Instance;
		}

		private TcpPackServer server = null;
		private const string clsName = "TcpServerManager";

		public TcpPackServerMnger Start()
		{
			server = new TcpPackServer();
			server.PackHeaderFlag = 0x2c;
			//server.IpAddress = IPAddress.Any.ToString();
			//server.Port = port;

			server.OnAccept += new TcpServerEvent.OnAcceptEventHandler(OnAccept);
			server.OnReceive += new TcpServerEvent.OnReceiveEventHandler(OnReceive);
			server.OnClose += new TcpServerEvent.OnCloseEventHandler(OnClose);
			server.OnShutdown += new TcpServerEvent.OnShutdownEventHandler(OnShutdown);

			if (server.Start())
			{
				Log.WriteInfo(string.Format("" + clsName + " Start OK -> ({0}:{1})",
					server.IpAddress, 0));
			}
			else
			{
				Log.WriteError(string.Format("" + clsName + " Start Error -> ({0}:{1})",
					server.ErrorMessage, server.ErrorCode));
			}
			return this;
		}
		private HandleResult OnAccept(IntPtr connId, IntPtr pClient)
		{
			// 客户进入了
			// 获取客户端ip和端口
			string ip = string.Empty;
			ushort port = 0;
			if (server.GetRemoteAddress(connId, ref ip, ref port))
			{
				Log.WriteInfo(string.Format("" + clsName + "- > [{0},OnAccept] -> PASS({1}:{2})",
					connId, ip.ToString(), port));
			}
			else
			{
				Log.WriteInfo(string.Format("" + clsName + " - > [{0},OnAccept] -> Server_GetClientAddress() Error",
					connId));
			}
			//设置附加数据，保存用户连接，用来与客户端通信
			Session session = new Session
			{
				ConnId = connId,
				IpAddress = ip,
				Port = port,
				player = null
			};
			//设置
			if (server.SetExtra(connId, session) == false)
			{
				Log.WriteInfo(string.Format("" + clsName + " - > [{0},OnAccept] -> SetConnectionExtra fail", connId));
			}
			return HandleResult.Ok;
		}
		private HandleResult OnReceive(IntPtr connId, byte[] bytes)
		{
			//接收数据
			try
			{
				var session = server.GetExtra<Session>(connId);
				if (session != null)
				{
					Log.WriteInfo(string.Format("" + clsName + " - > [{0},OnReceive] -> {1}:{2} ({3} bytes)",
						session.ConnId, session.IpAddress, session.Port, bytes.Length));
				}
				else
				{
					Log.WriteInfo(string.Format("" + clsName + " - session = null > [{0},OnReceive] -> ({1} bytes)",
						connId, bytes.Length));
				}
				//处理数据
				//数据解密
				CustomDE.Decrypt(bytes, 0, bytes.Length);
				int len = bytes.Count(); //数据长度
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
				}
				return HandleResult.Ok;
			}
			catch (Exception ex)
			{
				Log.WriteError(ex);
				return HandleResult.Ignore;
			}
		}

		private HandleResult OnClose(IntPtr connId, SocketOperation enOperation, int errorCode)
		{
			if (errorCode == 0)
			{
				Log.WriteInfo(string.Format("" + clsName + "> [{0},OnClose]",
					connId));
			}
			else
			{
				Log.WriteInfo(string.Format("" + clsName + "> [{0},OnClose] -> OP:{1},CODE:{2}",
					connId, enOperation, errorCode));
			}
			var session = server.GetExtra<Session>(connId);
			//if (session != null && session.player != null)
			//{
			//	PlayerModel player = session.player as PlayerModel;
			//	if (player != null)
			//	{
			//		Console.WriteLine(string.Format(@" tcp - -------------玩家【{0}】在【{1}】时下线----------------", player.Id, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")));
			//		player.Offline();//玩家下线
			//	}
			//	session = null;
			//	//移除该玩家与客户端的通信
			//	if (!server.RemoveExtra(connId))
			//	{
			//		Log.WriteInfo(string.Format(" tcp - > [{0},OnClose] -> SetConnectionExtra({0}, null) fail",
			//			connId));
			//	}
			//}
			return HandleResult.Ok;
		}

		private HandleResult OnShutdown()
		{
			// 服务关闭了
			Log.WriteInfo("" + clsName + " - > [OnShutdown]");
			return HandleResult.Ok;
		}
	}
}
