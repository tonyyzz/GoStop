using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BLL
{
	public class BaseBLL
	{
		/// <summary>
		/// 初始化指定表
		/// </summary>
		/// <returns></returns>
		public static bool TruncateTable<T>(T model) where T : class, new()
		{
			return DAL.BaseDAL.TruncateTable(model);
		}
		/// <summary>
		/// 统一插入方法（使用注意：model类名必须以‘Model’结尾，并且model属性名称和个数必须与数据库表字段名称和个数一致。如果不一致，那就使用别的方法吧 T^T）
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="model"></param>
		/// <returns></returns>
		public static int Insert<T>(T model) where T : class
		{
			return DAL.BaseDAL.Insert(model);
		}
		/// <summary>
		/// 统一插入方法，只判断是否插入成功（使用注意：model类名必须以‘Model’结尾，并且model属性名称和个数必须与数据库表字段名称和个数一致。如果不一致，请使用其中的一个重载方法 T^T）
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="model"></param>
		/// <returns>自增主键Id</returns>
		public static bool InsertSuccess<T>(T model) where T : class
		{
			return DAL.BaseDAL.InsertSuccess(model);
		}
		/// <summary>
		/// 统一插入方法（使用注意：model类名必须以‘Model’结尾，fieldStrs为指明要插入的表字段字符串集合，字段集合可以包含所有，也可以是一部分）
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="model"></param>
		/// <param name="fieldStrs">要插入的字段字符串集合，以半角逗号‘,’分割</param>
		/// <returns></returns>
		public static int Insert<T>(T model, string fieldStrs) where T : class
		{
			return DAL.BaseDAL.Insert(model, fieldStrs);
		}
		/// <summary>
		/// 统一插入方法，只判断是否插入成功（使用注意：model类名必须以‘Model’结尾，fieldStrs为指明要插入的表字段字符串集合，字段集合可以包含所有，也可以是一部分）
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="model"></param>
		/// <param name="fieldStrs">要插入的字段字符串集合，以半角逗号‘,’分割</param>
		/// <returns>自增主键Id</returns>
		public static bool InsertSuccess<T>(T model, string fieldStrs) where T : class
		{
			return DAL.BaseDAL.InsertSuccess(model, fieldStrs);
		}

		/// <summary>
		/// 批量插入
		/// </summary>
		/// <param name="list"></param>
		/// <returns></returns>
		public static bool BatchInsert<T>(List<T> list) where T : class, new()
		{
			return DAL.BaseDAL.BatchInsert(list);
		}

	}
}
