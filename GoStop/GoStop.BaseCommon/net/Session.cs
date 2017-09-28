using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BaseCommon
{
	public class Session
	{
		public IntPtr ConnId { get; set; }
		public string IpAddress { get; set; }
		public ushort Port { get; set; }
		public BasePlayer player { get; set; }
	}
}
