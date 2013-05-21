exports.get_time = function()
{
    var dd = new Date();
    var hh = dd.getHours(); hh = hh < 10 ? '0' + hh : hh;
    var mm = dd.getMinutes(); mm = mm < 10 ? '0' + mm : mm;
    var ss = dd.getSeconds(); ss = ss < 10 ? '0' + ss : ss;

	return hh + ":" + mm + ":" + ss;
};

exports.get_date = function()
{
	var date = new Date();
	var dd = date.getDate(); dd = dd < 10 ? '0' + dd : dd;
	var MM = date.getMonth() + 1; MM = MM < 10 ? '0' + MM : MM;
	var yyyy = date.getFullYear();

	return '' + yyyy + MM + dd;
}

exports.get_datetime = function(dashed)
{
	var date = new Date();
	var dd = date.getDate(); dd = dd < 10 ? '0' + dd : dd;
	var MM = date.getMonth() + 1; MM = MM < 10 ? '0' + MM : MM;
	var yyyy = date.getFullYear();
    var hh = date.getHours(); hh = hh < 10 ? '0' + hh : hh;
    var mm = date.getMinutes(); mm = mm < 10 ? '0' + mm : mm;
    var ss = date.getSeconds(); ss = ss < 10 ? '0' + ss : ss;

    if(dashed === true)
    	return '' + yyyy + '-' + MM + '-' + dd + '-' + hh + '-' + mm + '-' + ss
    else
		return '' + yyyy + MM + dd + '-' + hh + ":" + mm + ":" + ss
}

exports.get_uptime = function(uptime) {
	var totalSec = process.uptime();
	var days = parseInt( totalSec / 86400 ) % 24;
	var hours = parseInt( totalSec / 3600 ) % 24;
	var minutes = parseInt( totalSec / 60 ) % 60;
	var seconds = totalSec % 60;

	return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
}

exports.to_char_code = function(c)
{
	if (c.length != 1)
		throw new Exception('util.toCharCode() : more than one character');
	return c.charCodeAt(0);
}

exports.replace_at = function(str, index, char) {
   return str.substr(0, index) + char + str.substr(index+char.length);
}

exports.dumpobj = function(o, compact)
{
	if(compact === undefined) compact = false;

	var results = [];
	for (var name in o) {
	    if (o.hasOwnProperty(name)) {
			if (compact)
	        	results.push("o[" + name + "] = " + o[name].toString().replace(new RegExp('\n', 'g'), ''));
			else
				results.push("o[" + name + "] = " + o[name]);
	    }
	    else {
	        results.push(name); // toString or something else
	    }
	}
	if (compact)
		return results.join(' | ');
	else
		return results.join('\n');
}

exports.html_escape = function(str) {
    return str
    		.replace(/\!/g, "&#33;")
            .replace(/\'/g, "&#39;")
            .replace(/\(/g, "&#40;")
            .replace(/\)/g, "&#41;")
            .replace(/\*/g, "&#42;");
}

exports.to_b64 = function(o) {
	if (typeof o === "object") {
		return new Buffer(JSON.stringify(o)).toString("base64");
	}
	else
		return new Buffer(String(o)).toString("base64");
}