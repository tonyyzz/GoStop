using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BLL
{
	public class PlayerBLL : BaseBLL
	{
		
		/// <summary>
		/// 获取某个玩家基本信息
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public static Model.PlayerModel QuerySingle(int Id)
		{
			return DAL.PlayerDAL.QuerySingle(Id);
		}
		
	}
}
