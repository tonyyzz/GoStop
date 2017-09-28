using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BaseCommon
{
    /// <summary>
    /// 自定义加密解密算法
    /// </summary>
    public class CustomDE
    {
        //加密
        public static void Encrypt(byte[] byteArray,int offset,int len)
        {
            for (int i = 0; i < len; i++)
                byteArray[i+offset] ^= 0xa7;
            
        }
        //解密
        public static void Decrypt(byte[] byteArray, int offset, int len)
        {
            for (int i = 0; i < len; i++)
                byteArray[i+offset] ^= 0xa7;
           
        }
    }
}
