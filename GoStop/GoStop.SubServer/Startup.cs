using GoStop.BaseCommon;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GoStop.SubServer
{
	public class Startup
	{
		public static void Run()
		{
			Log.ConsoleWrite("------------【GoStop子服务器正在启动...】-------------------");

			PackageConfig.Register();

			string tcpPackAddress = "127.0.0.1";
			ushort TcpPackPort = 50007;
			TcpPackClientMnger.GetInstance().Connect(tcpPackAddress, TcpPackPort);



			int count = 10000;

			#region 初始化Player

			//BLL.BaseBLL.TruncateTable(new Model.PlayerModel());
			//ThreadPool.QueueUserWorkItem(o =>
			//{
			//	Console.WriteLine(string.Format(@"Stopwatch开始初始化player表...开始时间：{0}", DateTime.Now.ToStr()));
			//	Stopwatch stopwatch = new Stopwatch();
			//	stopwatch.Start();
			//	List<Model.PlayerModel> pList = new List<Model.PlayerModel>();
			//	//int count = Convert.ToInt32(Math.Pow(10, 5));

			//	//十万用户插入所花时间为5.4779秒
			//	//一百万用户插入所花时间为36.4614秒
			//	//一千万用户插入所花时间为352.1608秒

			//	int groupCol = Convert.ToInt32(Math.Pow(10, 5)) / 2;

			//	for (int i = 1; i <= count; i++)
			//	{
			//		DateTime timeNow = DateTime.Now;
			//		Model.PlayerModel playerModel = new Model.PlayerModel()
			//		{
			//			Name = "name" + i,
			//			HeadImg = "http://img2.niutuku.com/1312/0850/0850-niutuku.com-30110.jpg",
			//			Level = 1,
			//			Money = 1000000,
			//		};
			//		pList.Add(playerModel);
			//	}
			//	var groupLi = pList.GetMatrix(groupCol).ToList();
			//	foreach (var itemLi in groupLi)
			//	{
			//		BLL.BaseBLL.BatchInsert(itemLi);
			//	}

			//	stopwatch.Stop();
			//	Console.WriteLine(string.Format(@"Stopwatch初始化player表完成...结束时间：{0}", DateTime.Now.ToStr()));
			//	Console.WriteLine(string.Format("player：持续时间为：{0}秒", Math.Round(stopwatch.Elapsed.TotalSeconds, 4)));
			//});

			#endregion
		}
	}
}
