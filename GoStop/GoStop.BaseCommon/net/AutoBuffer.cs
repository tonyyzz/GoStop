using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BaseCommon
{
	//! 智能buff
	public class AutoBuffer
	{
		//! 内存数组
		public byte[] m_Buffer;

		//! 已经写入大小
		private int m_iDataCount;

		public AutoBuffer(int size)
		{
			m_iDataCount = 0;
			m_Buffer = new byte[size];
		}

		//! 得到已写入字节大小
		public int GetDataCount()
		{
			return m_iDataCount;
		}

		//! 得到剩余大小
		public int GetReserveCount()
		{
			return m_Buffer.Length - m_iDataCount;
		}

		//! 从头清理指定大小数据
		public void Clear(int count)
		{
			if (count < 0)
			{
				m_iDataCount = 0;
				return;
			}

			if (count >= m_iDataCount)
			{
				m_iDataCount = 0;
			}
			else
			{
				for (int i = 0; i < m_iDataCount - count; i++) //否则后面的数据往前移
				{
					m_Buffer[i] = m_Buffer[count + i];
				}
				m_iDataCount -= count;
			}
		}

		//! 往缓冲区写数据
		public void WriteBuffer(byte[] buffer, int offset, int count, bool back = true/*是否写入尾部*/)
		{
			//! 空间足够
			if (GetReserveCount() >= count)
			{
				if (back)
					Array.Copy(buffer, offset, m_Buffer, m_iDataCount, count);
				else
				{
					Array.Copy(m_Buffer, 0, m_Buffer, count, m_iDataCount);
					Array.Copy(buffer, 0, m_Buffer, 0, count);
				}
				m_iDataCount += count;
			}
			//! 空间不足,需要申请
			else
			{
				int totalSize = m_iDataCount + count;
				byte[] tmpBuffer = new byte[totalSize];
				Array.Copy(m_Buffer, 0, tmpBuffer, 0, m_iDataCount);
				Array.Copy(buffer, offset, tmpBuffer, m_iDataCount, count);
				m_iDataCount += count;
				m_Buffer = tmpBuffer;
			}
		}

		//! 往缓冲区写数据
		public void WriteBuffer(byte[] buffer, bool back = true/*是否写入尾部*/)
		{
			WriteBuffer(buffer, 0, buffer.Length, back);
		}

		public void Write(byte[] value)
		{
			Write((ushort)value.Length);

			WriteBuffer(value);
		}

		public void Write(byte value)
		{
			byte[] tmpBuffer = new byte[] { value };

			WriteBuffer(tmpBuffer);
		}

		public void Write(ushort value)
		{
			//value = NetFunction.hton(value);

			byte[] tmpBuffer = BitConverter.GetBytes(value);

			WriteBuffer(tmpBuffer);
		}

		public void Write(short value)
		{
			//value = NetFunction.hton(value);

			byte[] tmpBuffer = BitConverter.GetBytes(value);

			WriteBuffer(tmpBuffer);
		}

		public void Write(int value)
		{
			//value = NetFunction.hton(value);

			byte[] tmpBuffer = BitConverter.GetBytes(value);

			WriteBuffer(tmpBuffer);
		}

		public void Write(uint value)
		{
			//value = NetFunction.hton(value);

			byte[] tmpBuffer = BitConverter.GetBytes(value);

			WriteBuffer(tmpBuffer);
		}

		public void Write(long value)
		{
			//value = NetFunction.hton(value);

			byte[] tmpBuffer = BitConverter.GetBytes(value);

			WriteBuffer(tmpBuffer);
		}

		public void Write(string value)
		{
			//! 转成utf-8
			byte[] tmpBuffer = Encoding.UTF8.GetBytes(value);

			Write(tmpBuffer.Length);

			WriteBuffer(tmpBuffer);
		}
	}
}
