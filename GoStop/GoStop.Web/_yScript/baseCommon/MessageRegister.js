var MessageRegister = {
	register: () => {
		MessageManager.registerMsgCallback(MainCommand.MC_CLIENT, SecondCommand.SC_CLIENT_login_ret, packageFuntion.loginRetFunc);
	}
};