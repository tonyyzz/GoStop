using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using GoStop.BaseCommon;

namespace GameServer
{
    /// <summary>
    /// 牌桌线程
    /// </summary>
    class TableThread
    {
        //private Dictionary<int, Table> tableDict = new Dictionary<int, Table>();
        private ConcurrentQueue<Package> queue = new ConcurrentQueue<Package>();
        private Thread thread = null;
        private int id;
        public TableThread()
        {
            thread = new Thread(new ThreadStart(ThreadFunc));
        }
        public void Start()
        {
            if (thread != null)
                thread.Start();
        }

        public int ThreadId
        {
            get
            {
                return id;
            }
            set
            {
                id = value;
            }
        }
        /// <summary>
        /// Packet 入处理队列
        /// </summary>
        /// <param name="pack"></param>
        public void Enqueue(Package pack)
        {
            queue.Enqueue(pack);
        }
        //public void AddTable(Table table)
        //{
        //    tableDict.Add(table.id, table);
        //}

        public void ThreadFunc()
        {
            do
            {
                Package pack = null;
                if (queue.TryDequeue(out pack))
                {//获取
                    try
                    {
                        pack.Excute();//执行包体
                    }
                    catch (Exception ex)
                    {
                        Log.WriteError(ex);
                    }
                    pack = null;
                }
                Thread.Sleep(1);
            } while (true);
        }
    }
}
