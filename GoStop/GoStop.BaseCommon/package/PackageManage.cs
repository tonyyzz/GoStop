using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace GoStop.BaseCommon
{
	/// <summary>
	/// 消息协议包管理
	/// </summary>
	public class PackageManage
	{
		private static PackageManage instance = null;
		private ConcurrentDictionary<int, Package> packDict = new ConcurrentDictionary<int, Package>();
		public PackageManage()
		{

		}
		public static PackageManage Instance
		{
			get
			{
				if (instance == null)
					instance = new PackageManage();
				return instance;
			}
		}
		public void RegisterPackage(short mainID, short secondID, Package pack)
		{
			int key = (int)mainID * 1000 + secondID;
			packDict.TryAdd(key, pack);
		}
		public Package NewPackage(short mainID, short secondID)
		{
			int key = (int)mainID * 1000 + secondID;
			Package pack = null;
			packDict.TryGetValue(key, out pack);
			return pack == null ? null : pack.Clone();
		}

	}
}
