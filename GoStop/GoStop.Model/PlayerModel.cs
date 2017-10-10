using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.Model
{
	public partial class PlayerModel
	{
		/// <summary>
		/// 
		/// </summary>
		public PlayerModel()
		{
			Id = 0;
			Name = "";
			HeadImg = "";
			Level = 0;
			Money = 0;
		}
		/// <summary>
		/// 玩家Id
		/// </summary>
		public int Id { get; set; }
		/// <summary>
		/// 玩家名称
		/// </summary>
		public string Name { get; set; }
		/// <summary>
		/// 玩家头像
		/// </summary>
		public string HeadImg { get; set; }
		/// <summary>
		/// 玩家等级
		/// </summary>
		public int Level { get; set; }
		/// <summary>
		/// 玩家金币
		/// </summary>
		public int Money { get; set; }
	}
	public partial class PlayerModel : BaseCommon.BasePlayer
	{
		/// <summary>
		/// 连接ID
		/// </summary>
		public IntPtr conID = IntPtr.Zero;
		/// <summary>
		/// 玩家是否在线
		/// </summary>
		public bool online = false;
		public string wsAddress = "";
		public ushort wsPort = 0;
	}
}
