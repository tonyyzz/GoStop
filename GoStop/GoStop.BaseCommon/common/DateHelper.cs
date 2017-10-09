using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace System
{
	public static class DateHelper
	{
		public static int GetTotalSecondsInt()
		{
			return Convert.ToInt32((DateTime.Now - new DateTime(DateTime.Now.Year, 1, 1)).TotalSeconds);
		}

		/// <summary>
		/// 转化成特定格式的时间字符串（yyyy-MM-dd HH:mm:ss）
		/// </summary>
		/// <param name="time"></param>
		/// <returns></returns>
		public static string ToStr(this DateTime time)
		{
			return time.ToString("yyyy-MM-dd HH:mm:ss");
		}
	}
}
