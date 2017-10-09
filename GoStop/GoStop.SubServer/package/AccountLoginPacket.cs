using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer.package.client
{
	public class AccountLoginPacket : Package
	{
		public AccountLoginPacket() { }
		public AccountLoginPacket(byte[] buffer, int msgLen, MainCommand mainid, SecondCommand secondid) : base(buffer, msgLen, mainid, secondid) { }
		public override Package Clone()
		{
			Package pack = new AccountLoginPacket(null, 0,
				MainCommand.MC_ACCOUNT, SecondCommand.SC_ACCOUNT_login);
			return pack;
		}
		public override void ReadPackage() { }
		public override void WritePackage() { }
		public override void Excute()
		{
			Package pack = new Package(MainCommand.MC_ACCOUNT, SecondCommand.SC_ACCOUNT_login_ret);
			pack.Write("sub"); //serverType
			pack.Write("fdgfdg");
			SubWebSocketServerMnger.GetInstance().Send(session.ConnId, pack);
		}
	}
}
