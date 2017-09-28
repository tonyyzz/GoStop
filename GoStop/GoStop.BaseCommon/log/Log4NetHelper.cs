using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

using System.Reflection;
using log4net;
using log4net.Core;
using log4net.Appender;
using log4net.Layout;
using log4net.Filter;

namespace GoStop.BaseCommon
{
	internal static class Log4NetHelper
	{
		static ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

		private static string _logDir = "./log";
		public static string _gameName = "game";

		private static List<RollingFileAppender> appenderList = null;

		#region 初始化日志配置

		public static void Initialize(string logDir, string gameName)
		{
			_logDir = logDir;
			_gameName = gameName;

			appenderList = new List<RollingFileAppender>();

			appenderList.Add(InitializeAppender(new RollingFileAppender(), _logDir, Level.Debug));
			appenderList.Add(InitializeAppender(new RollingFileAppender(), _logDir, Level.Info));
			appenderList.Add(InitializeAppender(new RollingFileAppender(), _logDir, Level.Warn));
			//appenderList.Add(InitializeAppender(new RollingFileAppender(), _logDir, Level.Trace));
			appenderList.Add(InitializeAppender(new RollingFileAppender(), _logDir, Level.Error));

			// 通用配置
			appenderList.ForEach(a =>
			{
				a.Encoding = Encoding.UTF8;
				a.AppendToFile = true;
				a.MaxSizeRollBackups = -1;
				a.RollingStyle = RollingFileAppender.RollingMode.Composite;
				a.StaticLogFileName = false;
				a.DatePattern = "yyyyMMddHH\".txt\"";
				//a.Layout = new PatternLayout("%date{mm:ss}|%message\r\n");
				a.Layout = new PatternLayout("%message\r\n");
				a.LockingModel = new FileAppender.MinimalLock();
				long size = 1024 * 512;
				a.MaximumFileSize = size.ToString();
				a.ActivateOptions();
			});

			log4net.Config.BasicConfigurator.Configure(appenderList.ToArray());
		}



		private static RollingFileAppender InitializeAppender(RollingFileAppender appender, string filePath, Level filterLevel)
		{
			var prefix = filterLevel.ToString();

			appender.File = Path.Combine(filePath, _gameName, prefix, string.Format("{0}_", prefix));
			appender.AddFilter(new LevelRangeFilter()
			{
				LevelMin = filterLevel,
				LevelMax = filterLevel
			});

			return appender;
		}

		#endregion

		#region 输出经分日志

		public static void WriteInfoLog(params object[] infos)
		{
			var sb = new StringBuilder();

			foreach (var info in infos)
				sb.Append((info != null) ? info.ToString() : string.Empty).Append("|");

			Logger.Info(sb.ToString().Trim('|'));
		}

		#endregion

		#region 输出调试日志

		public static void WriteDebugLog(params object[] infos)
		{
			var sb = new StringBuilder();

			foreach (var info in infos)
				sb.Append((info != null) ? info.ToString() : string.Empty).Append("|");

			Logger.Debug(sb.ToString());
		}

		#endregion

		#region 输出错误日志

		public static void WriteErrorLog(Exception ex)
		{
			WriteErrorLog(string.Format("{0} {1}", ex.Message, ex.StackTrace));
		}

		public static void WriteErrorLog(string msg)
		{
			if (string.IsNullOrEmpty(msg))
				return;

			Logger.Error(msg);

		}
		/// <summary>
		/// 数据追踪日志
		/// </summary>
		/// <param name="msg"></param>
		public static void WriteTraceLog(string msg)
		{
			if (string.IsNullOrEmpty(msg))
				return;

			Logger.Warn(msg);

		}

		#endregion
		/// <summary>
		/// 写日志
		/// </summary>
		/// <param name="type">日志类型 1-游戏日志 2-调试日志 3-错误日志</param>
		/// <param name="msg">日志字符串</param>
		public static void Write(string type, string msg)
		{
			switch (type)
			{
				case "Info":
					Logger.Info(msg);
					break;
				case "Debug":
					Logger.Debug(msg);
					break;
				case "Error":
					Logger.Error(msg);
					break;
			}
		}
	}
}
