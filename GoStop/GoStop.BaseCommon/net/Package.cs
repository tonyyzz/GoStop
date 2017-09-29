using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;


namespace GoStop.BaseCommon
{
	//! 消息头
	[StructLayout(LayoutKind.Sequential, Pack = 1)]
	public struct MsgHead
	{
		//! 消息长度
		public int msgLen;
		//! 消息主id
		public short msgmainid;
		//! 消息副id
		public short msgsecondid;

	};

	public class Package
	{
		//! 消息头
		public MsgHead m_MsgHead;
		//! 消息数据
		protected AutoBuffer m_Buffer = new AutoBuffer(1024 * 4);
		//! 读消息位置
		protected int m_iPosition;

		protected Session session = null;

		public Package()
		{

		}
		//! 发包实例化
		public Package(MainCommand mainid, SecondCommand secondid)
		{
			m_MsgHead.msgLen = 4;
			m_MsgHead.msgmainid = (short)mainid;
			m_MsgHead.msgsecondid = (short)secondid;

			m_iPosition = 0;
			Write(m_MsgHead.msgLen);
			Write(m_MsgHead.msgmainid);
			Write(m_MsgHead.msgsecondid);

		}

		//! 接收包实例化
		public Package(byte[] buffer, int msgLen, MainCommand mainid, SecondCommand secondid)
		{
			if (buffer != null && buffer.Length > 0)
				m_Buffer.WriteBuffer(buffer, 0, buffer.Length);
			m_iPosition = 0;

			if (buffer != null)
			{
				m_MsgHead.msgLen = ReadInt();
				m_MsgHead.msgmainid = ReadShort();
				m_MsgHead.msgsecondid = ReadShort();
			}


		}
		public void SetSession(Session _session)
		{
			session = _session;
		}
		public void ReadHead()
		{
			if (m_Buffer.GetDataCount() > 0)
			{
				m_iPosition = 0;
				m_MsgHead.msgmainid = ReadShort();
				m_MsgHead.msgsecondid = ReadShort();
				m_MsgHead.msgLen = m_Buffer.GetDataCount() - 4;
				//m_iPosition = 4;
			}
		}
		public virtual void ReadPackage()
		{

		}
		public virtual void WritePackage()
		{

		}
		public virtual Package Clone()
		{
			return null;
		}
		public virtual void Excute()
		{
			string str = ReadString();
			Console.WriteLine("执行包体逻辑:" + str);
		}
		public ushort getLen()
		{
			ushort len = (ushort)m_Buffer.GetDataCount();
			return len;
		}

		public void Write(int value)
		{
			m_Buffer.Write(value);

		}

		public void Write(short value)
		{
			m_Buffer.Write(value);

		}


		public void Write(long value)
		{
			m_Buffer.Write((uint)(value >> 32));


			m_Buffer.Write((uint)value);

		}

		public void Write(string value)
		{
			if (string.IsNullOrEmpty(value))
				value = string.Empty;

			m_Buffer.Write(value);

		}

		public void Write(byte value)
		{
			m_Buffer.Write(value);

		}

		public void Write(byte[] value)
		{
			m_Buffer.Write(value);

		}
		public void Write(byte[] value, int len)
		{
			m_Buffer.WriteBuffer(value, 0, len);
		}

		public void Write(uint value)
		{
			m_Buffer.Write(value);

		}

		public int ReadInt()
		{
			m_iPosition += sizeof(int);
			return BitConverter.ToInt32(m_Buffer.m_Buffer, m_iPosition - sizeof(int));
		}

		public uint ReadUInt()
		{
			m_iPosition += sizeof(uint);
			return BitConverter.ToUInt32(m_Buffer.m_Buffer, m_iPosition - sizeof(uint));
		}

		public short ReadShort()
		{
			m_iPosition += sizeof(short);
			return BitConverter.ToInt16(m_Buffer.m_Buffer, m_iPosition - sizeof(short));
		}

		public long ReadLong()
		{
			uint hight = BitConverter.ToUInt32(m_Buffer.m_Buffer, m_iPosition);
			m_iPosition += sizeof(int);
			uint low = BitConverter.ToUInt32(m_Buffer.m_Buffer, m_iPosition);
			m_iPosition += sizeof(int);

			return ((long)hight << 32) + (long)low;
		}

		public string ReadString()
		{
			int length = ReadInt();

			m_iPosition += length;
			return Encoding.UTF8.GetString(m_Buffer.m_Buffer, m_iPosition - length, length).Trim(new char[1]);
		}

		public int[] ReadIntArr(int len)
		{
			string str = this.ReadString();
			if (string.IsNullOrEmpty(str))
				return new int[len];
			else
				return str.Split('#').Select(i => int.Parse(i)).ToArray();
		}

		public float[] ReadFloatArr(int len)
		{
			string str = this.ReadString();
			if (string.IsNullOrEmpty(str))
				return new float[len];
			else
				return str.Split('#').Select(i => float.Parse(i)).ToArray();
		}

		public List<int> ReadIntLst()
		{
			string str = this.ReadString().Trim('#');
			if (string.IsNullOrEmpty(str))
				return new List<int>();
			else
				return str.Split('#').Select(i => int.Parse(i)).ToList();
		}



		public byte ReadByte()
		{
			m_iPosition += sizeof(byte);
			return m_Buffer.m_Buffer[m_iPosition - sizeof(byte)];
		}

		public byte[] ReadByteArray()
		{
			ushort length = ReadUShort();
			m_iPosition += length;

			byte[] arr = new byte[length];
			Array.Copy(arr, 0, m_Buffer.m_Buffer, m_iPosition - length, length);

			return arr;
		}

		public byte[] GetBuffer()
		{
			int len = getLen();
			byte[] bytes = BitConverter.GetBytes(len);
			Array.Copy(bytes, 0, m_Buffer.m_Buffer, 0, bytes.Length);////设置包的大小
			return m_Buffer.m_Buffer;
		}




		//得到接收数据的16进制
		public string getHexStr()
		{
			byte[] bytes = this.GetBuffer();
			StringBuilder sb = new StringBuilder();
			if (bytes != null)
			{
				for (int i = 0; i < bytes.Length; i++)
				{
					sb.Append(bytes[i].ToString("X2"));
				}
			}
			return sb.ToString();
		}

		protected ushort ReadUShort()
		{
			m_iPosition += sizeof(ushort);
			return BitConverter.ToUInt16(m_Buffer.m_Buffer, m_iPosition - sizeof(ushort));
		}
	}
}
