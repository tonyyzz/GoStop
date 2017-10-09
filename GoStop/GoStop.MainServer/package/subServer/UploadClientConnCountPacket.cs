using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer.package.subServer
{
	public class UploadClientConnCountPacket : Package
	{
		public UploadClientConnCountPacket() { }
		public UploadClientConnCountPacket(byte[] buffer, int msgLen, MainCommand mainid, SecondCommand secondid) : base(buffer, msgLen, mainid, secondid) { }
		public override Package Clone()
		{
			Package pack = new UploadClientConnCountPacket(null, 0,
				MainCommand.MC_SUBSERVER, SecondCommand.SC_SUBSERVER_uploadClientConnCount);
			return pack;
		}
		public override void ReadPackage() { }
		public override void WritePackage() { }
		public override void Excute()
		{
			string subWsAddress = ReadString();
			int subWsPort = ReadInt();
			var connCount = ReadLong();

			if (connCount < 0)
			{
				return;
			}
			if (string.IsNullOrWhiteSpace(subWsAddress))
			{
				return;
			}
			if (subWsPort < 0)
			{
				return;
			}

			var subServerInfo = SubServerMnger.subServerList.FirstOrDefault(m => m.wsAddress == subWsAddress && m.wsPort == subWsPort);
			if (subServerInfo != null)
			{
				subServerInfo.wsConnCount = connCount;
			}
		}
	}
}