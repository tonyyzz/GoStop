using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;

namespace GoStop.BaseCommon
{
	public class csvConfig
	{
		/// <summary>
		/// 通用csv安装配置方法
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="filepath"></param>
		/// <param name="list"></param>
		public static void Install<T>(string filepath, out List<T> list) where T : new()
		{
			list = new List<T>();
			using (DataTable dt = ReadCsv(filepath))
			{
				foreach (DataRow dr in dt.Rows)
				{
					T model = new T();
					var properties = model.GetType().GetProperties().ToList();
					foreach (DataColumn dc in dt.Columns)
					{
						foreach (var prop in properties)
						{
							if (dc.ColumnName == prop.Name)
							{
								prop.SetValue(model, dr[prop.Name]);
							}
						}
					}
					list.Add(model);
				}
			}
		}
		/// <summary>
		/// 读取CSV
		/// </summary>
		/// <param name="filepath"></param>
		/// <returns></returns>
		private static DataTable ReadCsv(string filepath)
		{
			if (filepath == "") return null;
			filepath = Directory.GetCurrentDirectory() + "/" + filepath;

			DataTable dt = new DataTable("NewTable");
			DataRow row;

			string[] lines = File.ReadAllLines(filepath, Encoding.UTF8);
			string[] head = lines[0].Split(',');
			int cnt = head.Length;
			for (int i = 0; i < cnt; i++)
				dt.Columns.Add(head[i]);

			for (int i = 1; i < lines.Length; i++)
			{
				if (string.IsNullOrWhiteSpace(lines[i]) || lines[i][0] == ',')
					continue;

				try
				{
					row = dt.NewRow();
					row.ItemArray = GetRow(lines[i], cnt);
					dt.Rows.Add(row);
				}
				catch { }
			}

			return dt;
		}

		private static string[] GetRow(string line, int cnt)
		{
			line.Replace("\"\"", "\"");
			string[] strs = line.Split(',');
			if (strs.Length == cnt)
				return strs;

			List<string> lst = new List<string>();
			int n = 0, begin = 0;
			bool flag = false;

			for (int i = 0; i < strs.Length; i++)
			{
				if (strs[i].IndexOf("\"") == -1
					|| (!flag && strs[i][0] != '\"'))
				{
					lst.Add(strs[i]);
					continue;
				}

				n = 0;
				foreach (char ch in strs[i])
				{
					if (ch == '\"')
						n++;
				}
				if (n % 2 == 0)
				{
					lst.Add(strs[i]);
					continue;
				}

				flag = true;
				begin = i;
				i++;
				for (i = begin + 1; i < strs.Length; i++)
				{
					foreach (char ch in strs[i])
					{
						if (ch == '\"')
							n++;
					}

					if (strs[i][strs[i].Length - 1] == '\"' && n % 2 == 0)
					{
						StringBuilder sb = new StringBuilder();
						for (; begin <= i; begin++)
						{
							sb.Append(strs[begin]);
							if (begin != i)
								sb.Append(",");
						}
						lst.Add(sb.ToString());
						break;
					}
				}
			}
			return lst.ToArray();
		}
	}
}
