using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;

namespace GoStop.DAL
{
	public class PlayerDAL : BaseDAL
	{

		
		/// <summary>
		/// 获取某个玩家基本信息
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public static Model.PlayerModel QuerySingle(int Id)
		{
			using (var Conn = GetConn())
			{
				Conn.Open();
				string sql = "select * from player where Id=@Id";
				return Conn.QueryFirstOrDefault<Model.PlayerModel>(sql, new { Id = Id });
			}
		}
		
		

	}
}
