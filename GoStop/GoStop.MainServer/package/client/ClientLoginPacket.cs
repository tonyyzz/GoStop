using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer.package.client
{
	public class ClientLoginPacket : Package
	{
		public ClientLoginPacket() { }
		public ClientLoginPacket(byte[] buffer, int msgLen, MainCommand mainid, SecondCommand secondid) : base(buffer, msgLen, mainid, secondid) { }
		public override Package Clone()
		{
			Package pack = new ClientLoginPacket(null, 0,
				MainCommand.MC_CLIENT, SecondCommand.SC_CLIENT_login);
			return pack;
		}
		public override void ReadPackage() { }
		public override void WritePackage() { }
		public override void Excute()
		{
			string d = ReadString();
			Package pack = new Package(MainCommand.MC_CLIENT, SecondCommand.SC_CLIENT_login_ret);
			pack.Write("cccccc");
			pack.Write(666);
			MainWebSocketServerMnger.GetInstance().Send(session.ConnId, pack);

		}

	}
}
