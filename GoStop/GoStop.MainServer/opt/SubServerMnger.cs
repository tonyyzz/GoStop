using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.MainServer
{
	public static class SubServerMnger
	{
		public static List<SubServerModel> subServerList = new List<SubServerModel>();
	}

	public class SubServerModel
	{
		public IntPtr tcpConnId { get; set; }
		public string tcpAddress { get; set; }
		public ushort tcpPort { get; set; }
		public string wsAddress { get; set; }
		public ushort wsPort { get; set; }
	}
}
