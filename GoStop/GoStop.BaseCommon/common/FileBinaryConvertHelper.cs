using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace System
{
	/// <summary>
	/// 工具类：文件与二进制流间的转换
	/// </summary>
	public static class FileBinaryConvertHelper
	{
		/// <summary>
		/// 将文件转换为byte数组
		/// </summary>
		/// <param name="path">文件地址</param>
		/// <returns>转换后的byte数组</returns>
		public static byte[] File2Bytes(this string path)
		{
			if (!File.Exists(path))
			{
				return new byte[0];
			}
			FileInfo fi = new FileInfo(path);
			byte[] buff = new byte[fi.Length];
			using (FileStream fs = fi.OpenRead())
			{
				fs.Read(buff, 0, Convert.ToInt32(fs.Length));
			}
			return buff;
		}
		/// <summary>
		/// 将byte数组转换为文件并保存到指定地址
		/// </summary>
		/// <param name="buff">byte数组</param>
		/// <param name="savepath">保存地址</param>
		public static void Bytes2File(this byte[] buff, string savepath)
		{
			using (FileStream fs = new FileStream(savepath, FileMode.Create))
			{
				using (BinaryWriter bw = new BinaryWriter(fs))
				{
					bw.Write(buff, 0, buff.Length);
				}
			}
		}
	}
}
