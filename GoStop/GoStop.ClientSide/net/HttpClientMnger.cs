using GoStop.BaseCommon;
using HPSocketCS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.ClientSide.net
{
	public class HttpClientMnger
	{
		private static HttpClientMnger Instance = null;
		private HttpClientMnger() { }
		private readonly static object obj = new object();
		public static HttpClientMnger GetInstance()
		{
			if (Instance == null)
			{
				lock (obj)
				{
					if (Instance == null)
					{
						Instance = new HttpClientMnger();
					}
				}
			}
			return Instance;
		}

		private HttpClient httpClient = null;
		private string address = "127.0.0.1";
		private ushort port = 50006;

		public void Connect()
		{
			httpClient = new HttpClient();

			httpClient.OnConnect += HttpClient_OnConnect;
			httpClient.OnHandShake += HttpClient_OnHandShake;
			httpClient.OnBody += HttpClient_OnBody;
			httpClient.OnHeadersComplete += HttpClient_OnHeadersComplete;
			httpClient.OnMessageComplete += HttpClient_OnMessageComplete;
			httpClient.OnParseError += HttpClient_OnParseError;
			httpClient.OnReceive += HttpClient_OnReceive;
			httpClient.OnUpgrade += HttpClient_OnUpgrade;
			httpClient.OnClose += HttpClient_OnClose;
			httpClient.OnChunkComplete += HttpClient_OnChunkComplete;
			httpClient.OnChunkHeader += HttpClient_OnChunkHeader;
			httpClient.OnHeader += HttpClient_OnHeader;
			httpClient.OnMessageBegin += HttpClient_OnMessageBegin;
			httpClient.OnPointerDataBody += HttpClient_OnPointerDataBody;
			httpClient.OnPointerDataReceive += HttpClient_OnPointerDataReceive;
			//httpClient.OnPrepareConnect += HttpClient_OnPrepareConnect;
			httpClient.OnStatusLine += HttpClient_OnStatusLine;

			var flag = httpClient.Connect(address, port);
			if (flag)
			{
				Log.ConsoleWrite(string.Format(@"连接【{0}:{1}】成功！", address, port));
			}
			else
			{
				Log.ConsoleWrite(string.Format(@"连接【{0}:{1}】失败！", address, port));

			}
		}

		private HttpParseResult HttpClient_OnStatusLine(IntPtr connId, ushort statusCode, string desc)
		{
			Log.ConsoleWrite("--------------HttpClient_OnStatusLine");
			return HttpParseResult.Ok;
		}

		private HandleResult HttpClient_OnPrepareConnect(TcpClient sender, IntPtr socket)
		{
			Log.ConsoleWrite("--------------HttpClient_OnPrepareConnect");
			return HandleResult.Ok;
		}

		private HandleResult HttpClient_OnPointerDataReceive(TcpClient sender, IntPtr pData, int length)
		{
			Log.ConsoleWrite("--------------HttpClient_OnPointerDataReceive");
			return HandleResult.Ok;
		}

		private HttpParseResult HttpClient_OnPointerDataBody(IntPtr connId, IntPtr pData, int length)
		{
			Log.ConsoleWrite("--------------HttpClient_OnPointerDataBody");
			return HttpParseResult.Ok;
		}

		private HttpParseResult HttpClient_OnMessageBegin(IntPtr connId)
		{
			Log.ConsoleWrite("--------------HttpClient_OnMessageBegin");
			return HttpParseResult.Ok;
		}

		private HttpParseResult HttpClient_OnHeader(IntPtr connId, string name, string value)
		{
			Log.ConsoleWrite("--------------HttpClient_OnHeader");
			return HttpParseResult.Ok;
		}

		private HttpParseResult HttpClient_OnChunkHeader(IntPtr connId, int length)
		{
			Log.ConsoleWrite("--------------HttpClient_OnChunkHeader");
			return HttpParseResult.Ok;
		}

		private HttpParseResult HttpClient_OnChunkComplete(IntPtr connId)
		{
			Log.ConsoleWrite("--------------HttpClient_OnChunkComplete");
			return HttpParseResult.Ok;
		}

		private HandleResult HttpClient_OnClose(TcpClient sender, SocketOperation enOperation, int errorCode)
		{
			Log.ConsoleWrite("--------------HttpClient_OnClose");
			Log.ConsoleWrite(enOperation.ToString());
			switch (enOperation)
			{
				case SocketOperation.Unknown:
					{

					}
					break;
				case SocketOperation.Acccept:
					{

					}
					break;
				case SocketOperation.Connnect:
					{
						Log.ConsoleWrite("连接失败");
					}
					break;
				case SocketOperation.Send:
					{

					}
					break;
				case SocketOperation.Receive:
					{

					}
					break;
				case SocketOperation.Close:
					{

					}
					break;
				default:
					break;
			}
			return HandleResult.Ok;
		}

		private HttpParseResult HttpClient_OnUpgrade(IntPtr connId, HttpUpgradeType upgradeType)
		{
			Log.ConsoleWrite("--------------HttpClient_OnUpgrade");
			return HttpParseResult.Ok;
		}

		private HandleResult HttpClient_OnReceive(TcpClient sender, byte[] bytes)
		{
			Log.ConsoleWrite("--------------HttpClient_OnReceive");
			return HandleResult.Ok;
		}

		private HttpParseResult HttpClient_OnParseError(IntPtr connId, int errorCode, string errorDesc)
		{
			Log.ConsoleWrite("--------------HttpClient_OnParseError");
			return HttpParseResult.Ok;
		}

		private HttpParseResult HttpClient_OnMessageComplete(IntPtr connId)
		{
			Log.ConsoleWrite("--------------HttpClient_OnMessageComplete");
			return HttpParseResult.Ok;
		}

		private HttpParseResultEx HttpClient_OnHeadersComplete(IntPtr connId)
		{
			Log.ConsoleWrite("--------------HttpClient_OnHeadersComplete");
			return HttpParseResultEx.Ok;
		}

		private HttpParseResult HttpClient_OnBody(IntPtr connId, byte[] bytes)
		{
			Log.ConsoleWrite("--------------HttpClient_OnBody");
			return HttpParseResult.Ok;
		}

		private HandleResult HttpClient_OnHandShake(TcpClient sender)
		{
			Log.ConsoleWrite("--------------HttpClient_OnHandShake");
			return HandleResult.Ok;
		}

		private HandleResult HttpClient_OnConnect(TcpClient sender)
		{
			Log.ConsoleWrite("--------------HttpClient_OnConnect");
			var buffer = Encoding.UTF8.GetBytes("测试数据");
			//sender.Send(buffer, buffer.Length);
			//httpClient.Send(buffer, buffer.Length);
			return HandleResult.Ok;
		}

		public void Send()
		{
			var buffer = Encoding.UTF8.GetBytes("测试数据");
			//sender.Send(buffer, buffer.Length);
			httpClient.Send(buffer, buffer.Length);
		}
	}
}
