var MessageRegister = {
	register: () => {
		MessageManager.registerMsgCallback(MainCommand.MC_ACCOUNT, SecondCommand.SC_ACCOUNT_login_ret, packageFuntion.accountLoginRetFunc);
	}
};