using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace System.Collections.Generic
{
	/// <summary>
	/// list帮助类
	/// </summary>
	public static class ListHelper
	{
		/// <summary>
		/// 根据list再分组，得到矩阵
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="source"></param>
		/// <param name="groupCol">每组数据个数</param>
		/// <returns></returns>
		public static IEnumerable<List<T>> GetMatrix<T>(this IEnumerable<T> source, int groupCol)
		{
			for (int i = 0; i < source.Count(); i = i + groupCol)
			{
				yield return source.Skip(i).Take(groupCol).ToList();
			}
		}
		/// <summary>
		/// list随机排序
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="source"></param>
		/// <returns></returns>
		public static List<T> GetRandomList<T>(this List<T> source)
		{
			if (!source.Any())
			{
				return null;
			}
			Random random = new Random();
			List<T> newList = new List<T>();
			foreach (T item in source)
			{
				newList.Insert(random.Next(newList.Count), item);
			}
			return newList;
		}

		/// <summary>
		/// 根据条件筛选，如果func为空，则返回默认原来未经筛选处理的list
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="list"></param>
		/// <param name="func">筛选条件，可空</param>
		/// <returns></returns>
		public static List<T> WhereOrOriginalList<T>(this List<T> list, Func<T, bool> func = null)
		{
			if (func == null)
			{
				return list;
			}
			else
			{
				return list.Where(func).ToList();
			}
		}
	}
}
