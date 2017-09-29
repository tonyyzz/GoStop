var packageFuntion = {
	loginRetFunc(target, pack) {
		console.log(pack);
		var str = pack.readString();
		console.log(str);
		var df = pack.readInt();
		console.log(df);
	}
}