using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer.package.subServer
{
	public class UploadWsIPAddressPacket : Package
	{
		public UploadWsIPAddressPacket() { }
		public UploadWsIPAddressPacket(byte[] buffer, int msgLen, MainCommand mainid, SecondCommand secondid) : base(buffer, msgLen, mainid, secondid) { }
		public override Package Clone()
		{
			Package pack = new UploadWsIPAddressPacket(null, 0,
				MainCommand.MC_SUBSERVER, SecondCommand.SC_SUBSERVER_uploadWsIpAddress);
			return pack;
		}
		public override void ReadPackage() { }
		public override void WritePackage() { }
		public override void Excute()
		{
			string subWsAddress = ReadString();
			ushort subWsPort = ReadUShort();

			if (string.IsNullOrWhiteSpace(subWsAddress))
			{
				return;
			}
			if (subWsPort <= 0)
			{
				return;
			}

			SubServerMnger.subServerList.Add(new SubServerModel()
			{
				tcpConnId = session.ConnId,
				tcpAddress = session.IpAddress,
				tcpPort = session.Port,
				wsAddress = subWsAddress,
				wsPort = subWsPort
			});
		}
	}
}
