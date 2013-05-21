var crypto = require("crypto");
var reshelper = require('./reshelper.js');

exports.parse = function(req) {
	req.cookie = undefined;
	if (req.headers.cookie) {
		var cookie = /SID=([^ ,;]*)/.exec(req.headers.cookie);
		if (cookie) {
			try {
				req.cookie = JSON.parse(exports.decrypt(cookie[1]));
			} catch (err) {
				console.log("An error Occured while setting cookie %s", cookie[1])
			}
		}
	}
}

exports.set = function(res, data, lifetime) {
	if (!data)
		exports.clear(res);
	else {
		var sid = exports.encrypt(JSON.stringify(data));
		if (sid) {
			var cookie = "SID=" + sid + ";";
			if (lifetime)
				cookie += " Expires=" + date_cookie_string(lifetime);
			reshelper.add_header(res, {
				key: "Set-Cookie",
				value: cookie
			})
		}
		else
			exports.clear(res);
	}
}

exports.set_auxiliary = function(res, cookie_name, data) {
	reshelper.add_header(res, {
		key: "Set-Cookie",
		value: cookie_name + "=" + data + ";"
	})
}

exports.clear = function(res) {
	reshelper.add_header(res, {
		key: "Set-Cookie",
		value: "SID=; Expires=" + date_cookie_string()
	})
}

exports.encrypt = function(text) {
	try {
		var cipher = crypto.createCipher('aes-256-cbc', '0!AkWZe0sFoJ!9')
		var crypted = cipher.update(text, 'utf8', 'hex')
		crypted += cipher.final('hex');
	  	return crypted;
	} catch (err) {
		console.log("An error Occured while Encripting", text);
		return undefined;
	}
}

exports.decrypt = function(text) {
	try {
		var decipher = crypto.createDecipher('aes-256-cbc','0!AkWZe0sFoJ!9')
	 	var dec = decipher.update(text, 'hex', 'utf8')
	 	dec += decipher.final('utf8');
	 	return dec;
	} catch (err) {
		console.log("An error Occured while Decripting", text);
		return undefined;
	}
}

function date_cookie_string(lifetime) {
	var d,wdy,mon,expiration;
	if (lifetime === "1 week")
		expiration=(+new Date)+(7 * 24 * 60 * 60)*1000;
	else if (lifetime)
		expiration=(+new Date)+lifetime*1000;
	else
		expiration = 0;
	d=new Date(expiration);
	wdy=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return wdy[d.getUTCDay()]+', '+pad(d.getUTCDate())+'-'+mon[d.getUTCMonth()]+'-'+d.getUTCFullYear()
	+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+' GMT'
}
function pad(n){return n>9 ? ''+n : '0'+n}