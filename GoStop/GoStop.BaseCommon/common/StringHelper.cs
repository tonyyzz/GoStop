using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace System
{
	public static class StringHelper
	{
		/// <summary>
		/// 去除字符串前后空格，并且如果中间有多个相邻空格，只保留一个
		/// </summary>
		/// <param name="str"></param>
		/// <returns></returns>
		public static string GetRemoveExcessSpaceStr(this string str)
		{
			return Regex.Replace(str.Trim(), @"\s+", " ");
		}
	}
}
