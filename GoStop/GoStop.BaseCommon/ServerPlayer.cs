using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BaseCommon
{
    public class ServerPlayer : BasePlayer
    {
        public IntPtr connId;
        public ServerClient client;
        public override void Send(Package pack)
        {
            client.Send(pack);

        }
        public void Init(IntPtr con,ServerClient sc)
        {
            connId = con;
            client = sc;
        }

    }
}
