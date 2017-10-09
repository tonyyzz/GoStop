using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.SubServer
{
	public static class PlayerManager
	{
		/// <summary>
		/// 存储在线用户集合
		/// </summary>
		public volatile static List<Model.PlayerModel> playerOnlineList = new List<Model.PlayerModel>();

		/// <summary>
		/// 玩家上线
		/// </summary>
		/// <param name="player"></param>
		/// <param name="cid"></param>
		public static void Online(this Model.PlayerModel player, Session session)
		{
			player.online = true;
			player.conID = session.ConnId;
			//player.IpAddress = session.IpAddress;
			//player.TcpPort = session.Port;
			//player.LastLoginTime = DateTime.Now;

			playerOnlineList.RemoveAll(m => m.Id == player.Id);
			playerOnlineList.Add(player);

		}
		public static void SendMsg(this Model.PlayerModel player, Package pack)
		{
			SubWebSocketServerMnger.GetInstance().Send(player.conID, pack);
		}
	}
}
