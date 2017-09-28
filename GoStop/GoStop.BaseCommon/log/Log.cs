using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoStop.BaseCommon
{
	public class Log
	{
		//! level 1绿 2黄 3红
		private static ConsoleColor[] msgColor = new ConsoleColor[] { ConsoleColor.White, ConsoleColor.Green, ConsoleColor.Yellow, ConsoleColor.Red };
		private static bool bDebug = true;
		//初始化  = 目录
		public static void Initialize(string logDir, string gameName, bool debug)
		{
			Log.bDebug = debug;
			Log4NetHelper.Initialize(logDir, gameName);

		}
		public static void ConsoleWrite(string str, int level = 1)
		{
			try
			{
				ConsoleColor tmp = Console.ForegroundColor;
				Console.ForegroundColor = msgColor[level - 1];
				Console.WriteLine(str);
				Console.ForegroundColor = tmp;
			}
			catch
			{
			}
		}
		//异常
		public static void WriteError(Exception ex)
		{
			// 默认写文件
			Log.FileWrite(string.Format("↓↓↓↓↓↓↓↓{0}↓↓↓↓↓↓↓", DateTime.Now), 3);
			Log.FileWrite(ex.ToString(), 3);
			Log.FileWrite(ex.StackTrace, 3);

			if (Log.bDebug)  //开启 控制台 记录错误
			{
				ConsoleWriteError(ex);
			}
		}
		// 异常
		internal static void ConsoleWriteError(Exception ex)
		{
			Log.ConsoleWrite(string.Format("↓↓↓↓↓↓↓↓{0}↓↓↓↓↓↓↓", DateTime.Now), 1);
			Log.ConsoleWrite(ex.ToString(), 4);
			Log.ConsoleWrite(ex.StackTrace, 4);
		}
		//异常
		public static void WriteError(string err)
		{
			// 默认写文件
			Log.FileWrite(err, 3);
			if (Log.bDebug)
			{
				ConsoleWrite(err, 3);
			}
		}
		public static void WriteDebug(string info)
		{
			// 默认写文件
			Log.FileWrite(info, 2);
			if (Log.bDebug)
			{
				ConsoleWrite(info, 2);
			}
		}
		public static void WriteInfo(string info)
		{
			// 默认写文件
			//Log.FileWrite(info, 1);

			ConsoleWrite(info, 1);

		}
		public static void WriteTrace(string info)
		{
			Log.FileWrite(info, 4);
		}
		// 写文件
		public static void FileWrite(string str, int level)
		{
			switch (level)
			{
				case 1:
					Log4NetHelper.WriteInfoLog(str);
					break;
				case 2:
					Log4NetHelper.WriteDebugLog(str);
					break;
				case 3:
					Log4NetHelper.WriteErrorLog(str);
					break;
				case 4:
					Log4NetHelper.WriteTraceLog(str);
					break;
			}

		}
	}
}
