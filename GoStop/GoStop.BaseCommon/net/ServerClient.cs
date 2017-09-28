using HPSocketCS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
/// <summary>
/// 服务器之间通讯的 网络客户端
/// </summary>
namespace GoStop.BaseCommon
{
	public class ServerClient
	{
		TcpPackAgent client = new TcpPackAgent();
		IntPtr connID = IntPtr.Zero;
		string server_ip;
		ushort server_port;
		Session session = null;
		public ServerClient(ushort packHeaderFlag = 0x2a)
		{

			// 设置client事件
			//client.OnPrepareConnect += new TcpClientEvent.OnPrepareConnectEventHandler(OnPrepareConnect);
			client.OnConnect += new TcpAgentEvent.OnConnectEventHandler(OnConnect);
			//client.OnSend += new TcpClientEvent.OnSendEventHandler(OnSend);
			client.OnReceive += new TcpAgentEvent.OnReceiveEventHandler(OnReceive);
			client.OnClose += new TcpAgentEvent.OnCloseEventHandler(OnClose);

			// 设置包头标识,与对端设置保证一致性
			client.PackHeaderFlag = packHeaderFlag;
			// 设置最大封包大小
			client.MaxPackSize = 4096;
			client.WorkerThreadCount = 2;

			client.Start("0.0.0.0", true);

		}
		public void Stop()
		{
			client.Stop();
		}

		public void Connect(string ip, ushort port)
		{
			server_ip = ip;
			server_port = port;
			connID = client.Connect(ip, port);
			/*if (connID!=IntPtr.Zero)
			{

				Log.WriteInfo(string.Format("$Client Start OK -> ({0}:{1})", ip, port));
			}
			else
			{
				Log.WriteInfo(string.Format("$Client Start Error -> {0}({1})", client.ErrorMessage, client.ErrorCode));
			}*/
		}

		public IntPtr GetConnID()
		{
			return connID;
		}
		public void Send(Package pack)
		{
			client.Send(connID, pack.GetBuffer(), pack.getLen());
		}
		public void Close()
		{
			client.Disconnect(connID);
		}
		HandleResult OnPrepareConnect(TcpClient sender, IntPtr socket)
		{
			return HandleResult.Ok;
		}

		HandleResult OnConnect(IntPtr connId)
		{
			// 已连接 到达一次
			if (session == null)
			{
				session = new Session();
				session.player = new ServerPlayer();
			}
			session.ConnId = connId;
			((ServerPlayer)session.player).Init(connId, this);
			//Log.WriteInfo(string.Format(" > [{0},OnConnect]", connId.ToInt64()));

			return HandleResult.Ok;
		}

		HandleResult OnSend(TcpClient sender, byte[] bytes)
		{
			// 客户端发数据了
			//Log.WriteInfo(string.Format(" > [{0},OnSend] -> ({1} bytes)", sender.ConnectionId, bytes.Length));

			return HandleResult.Ok;
		}

		HandleResult OnReceive(IntPtr connId, byte[] bytes)
		{
			// 数据到达了

			//Log.WriteInfo(string.Format(" > [{0},OnReceive] -> ({1} bytes)", connId, bytes.Length));
			try
			{
				int msgLen = BitConverter.ToInt32(bytes, 0);
				short msgmainid = BitConverter.ToInt16(bytes, sizeof(int));
				short msgsecondid = BitConverter.ToInt16(bytes, sizeof(int) + sizeof(short));
				Package package = PackageManage.Instance.NewPackage(msgmainid, msgsecondid);
				if (package != null)
				{
					package.Write(bytes, bytes.Length);//写入包数据
					package.ReadHead();//读取包头

					package.SetSession(session);
					try
					{
						package.Excute();
					}
					catch (Exception ex)
					{
						Log.WriteError(ex);
					}
				}
				else
				{
					Log.WriteError(string.Format("实例化Package失败 mainid={0},secondid={1},msglen={2}", msgmainid, msgsecondid, msgLen));
				}
			}
			catch (Exception ex)
			{
				Log.WriteError(ex);
			}
			return HandleResult.Ok;
		}

		HandleResult OnClose(IntPtr connId, SocketOperation enOperation, int errorCode)
		{
			/*if (errorCode == 0)
				// 连接关闭了
				Log.WriteInfo(string.Format(" > [{0},OnClose]", connId));
			else
				// 出错了
				Log.WriteInfo(string.Format(" > [{0},OnClose ERROR] -> OP:{1},CODE:{2}", connId, enOperation, errorCode));
			*/
			Connect(server_ip, server_port);

			return HandleResult.Ok;
		}


	}
}
