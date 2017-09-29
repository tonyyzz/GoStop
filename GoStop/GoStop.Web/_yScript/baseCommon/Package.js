//var ByteBuffer = require('byte');

class Package {
	constructor(mainID, secondID) {
		if (!mainID || !secondID) {
			this.mainID = 0;
			this.secondID = 0;
			this.byteOffset = 0;
			this.dv = new DataView(new ArrayBuffer(512));
		} else {
			this.mainID = mainID;
			this.secondID = secondID;
			this.byteOffset = 0;
			this.dv = new DataView(new ArrayBuffer(512));
			//this.writeInt(21);//包的长度
			this.writeShort(mainID);
			this.writeShort(secondID);
		}
	}

	InitFromNet(buff) {
		var tmp = new Uint8Array(buff);
		for (let i = 0; i < tmp.byteLength; i++) {
			tmp[i] ^= 0xa7;
		}
		this.dv = new DataView(new ArrayBuffer(tmp.byteLength));
		for (let i = 0; i < tmp.byteLength; i++) {
			this.dv.setUint8(i, tmp[i], true);
		}
		//var tmp = new Uint8Array(buff);
		//var tmp_1 = ByteBuffer.wrap(tmp,0,tmp.byteLength);
		//this.bytes = ByteBuffer.allocate(buff.byteLength);
		//this.bytes.order(ByteBuffer.LITTLE_ENDIAN);


		//this.bytes.put(tmp_1,0,tmp.byteLength);


		var len = this.readInt();

		this.mainID = this.readShort();
		this.secondID = this.readShort();
		tmp = null;

	};
	//返回字节
	getbytes() {
		//var len = this.bytes._offset;
		//this.writeHeadLen(len);//重写数据长度
		return this.dv.buffer;
	};
	getbytesLen() {
		return this.byteOffset;
	};
	//读取函数
	readShort() {
		var value = this.dv.getInt16(this.byteOffset, true);
		this.byteOffset += 2;
		return value;
	};
	readInt() {
		var value = this.dv.getInt32(this.byteOffset, true);
		this.byteOffset += 4;
		return value;
	};
	readFloat() {
		var value = this.dv.getFloat32(this.byteOffset, true);
		this.byteOffset += 4;

		return value;
	};
	readByte() {
		var value = this.dv.getInt8(this.byteOffset, true);
		this.byteOffset += 1;

		return value;
	};
	readString() {
		var len = this.dv.getInt32(this.byteOffset, true);
		this.byteOffset += 4;

		var arr = new Array(len);
		for (var i = 0; i < len; i++) {
			arr[i] = this.dv.getUint8(this.byteOffset + i);
		}
		var value = this.bytesToString(arr);

		this.byteOffset += len;
		arr = null;
		return value;
	};

	///写入函数
	writeShort(value) {
		this.dv.setInt16(this.byteOffset, value, true);
		this.byteOffset += 2;
	};
	writeInt(value) {
		this.dv.setInt32(this.byteOffset, value, true);
		this.byteOffset += 4;
	}

	writeHeadLen(value) {
		this.dv.setInt32(0, value, true);

	}

	writeFloat(value) {
		this.dv.setFloat32(this.byteOffset, value, true);
		this.byteOffset += 4;
	}
	writeString(value) {
		var strBuff = this.stringToBytes(value);//将字符串转成byte数组
		var len = strBuff.length;

		this.dv.setInt32(this.byteOffset, len, true);//字符串长度
		this.byteOffset += 4;
		for (var i = 0; i < len; i++) {
			this.dv.setUint8(this.byteOffset + i, strBuff[i]);
		}
		this.byteOffset += len;

		strBuff = null;

	}
	stringToBytes(str) {
		var re = [];
		var c;
		var len = str.length;
		for (var i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if (c >= 0x010000 && c <= 0x10FFFF) {
				re.push(((c >> 18) & 0x07) | 0xF0);
				re.push(((c >> 12) & 0x3F) | 0x80);
				re.push(((c >> 6) & 0x3F) | 0x80);
				re.push((c & 0x3F) | 0x80);
			} else if (c >= 0x000800 && c <= 0x00FFFF) {
				re.push(((c >> 12) & 0x0F) | 0xE0);
				re.push(((c >> 6) & 0x3F) | 0x80);
				re.push((c & 0x3F) | 0x80);
			} else if (c >= 0x000080 && c <= 0x0007FF) {
				re.push(((c >> 6) & 0x1F) | 0xC0);
				re.push((c & 0x3F) | 0x80);
			} else {
				re.push(c & 0xFF);
			}
		}
		return re;

	}
	bytesToString(arr) {
		if (typeof arr === 'string') {
			return arr;
		}
		var str = '';
		for (var i = 0; i < arr.length; i++) {
			var one = arr[i].toString(2),
				v = one.match(/^1+?(?=0)/);
			if (v && one.length === 8) {
				var bytesLength = v[0].length;
				var store = arr[i].toString(2).slice(7 - bytesLength);
				for (var st = 1; st < bytesLength; st++) {
					store += arr[st + i].toString(2).slice(2);
				}
				str += String.fromCharCode(parseInt(store, 2));
				i += bytesLength - 1;
			} else {
				str += String.fromCharCode(arr[i]);
			}
		}
		return str;
	}

}
