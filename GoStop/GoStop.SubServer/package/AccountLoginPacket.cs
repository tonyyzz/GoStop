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
			int pid = ReadInt();//玩家Id

			if (pid <= 0)
			{
				return;
			}

			Model.PlayerModel player = PlayerManager.playerOnlineList.FirstOrDefault(m => m.Id == pid);
			if (player == null)
			{
				player = BLL.PlayerBLL.QuerySingle(pid);
			}
			if (player == null)
			{
				Console.WriteLine("不存在该玩家：{0}", pid);
				return;
			}


			//if (player != null && player.online)
			//{
			//	//该玩家已经在线，请更换其他账号
			//	Console.WriteLine(" SubWebSocketServer - 玩家【{0}】已经在登录中，请稍后再试！", player.Id);
			//	Package pack2 = new Package(MainCommand.MC_ERROR, SecondCommand.SC_ERROR_hall);
			//	pack2.Write((int)Error.login_isIn);
			//	SubWebSocketServerMnger.GetInstance().Send(session.ConnId, pack2);
			//	return;
			//}


			session.player = player;
			player.Online(session);
			Console.WriteLine(string.Format(@" SubWebSocketServer - -------------玩家【{0}】在【{1}】时上线了----------------", player.Id, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")));


			Package pack = new Package(MainCommand.MC_ACCOUNT, SecondCommand.SC_ACCOUNT_login_ret);
			pack.Write("sub"); //serverType
			pack.Write(player.Id);
			pack.Write(player.Name);
			pack.Write(player.Money);
			pack.Write(player.Level);
			player.SendMsg(pack);
		}
	}
}
