//# import module
var nodestatic = require('node-static');

//# init module
var fileServer = new(nodestatic.Server)('./static', {cache:1});

/**
 * res._pending strcuture:
 * res._pending = {}
 * res._pending.file = true | false;
 * res._pending.filepath
 * res._pending.headers = {};
 * res._pending.status = http status
 * res._pending.write = []
 */

function extend(res) {
	res._pending = res._pending || {};
	res._pending.headers = res._pending.headers || {};
	res._pending.write = res._pending.write || [];
}

//# send static file
exports.sendFile = function(res, path, onerror) {
	extend(res);
	res._pending.file = true;
	res._pending.filepath = path;
	res._pending.status = 200;
}

exports.sendBinaryImage = function(res, img, imgext) {
	if (imgext[0] == ".")
		imgext = imgext.substring(1).toLowerCase();

	if (imgext === "jpg" || imgext === "jpe") imgext = "jpeg";
	if (imgext === "tif") imgext = "tiff";

	extend(res);
	res._pending.headers["Content-Type"] = "image/" + imgext;
	res._pending.write.push(img.toString('utf8'));
	res._pending.status = 200;
}


exports.sendText = function(res, data) {
	extend(res);
	res._pending.headers["Content-Type"] = "text/plain";
	res._pending.write.push(String(data));
	res._pending.status = 200;
}

exports.sendJson = function(res, data) {
	extend(res);
	res._pending.headers["Content-Type"] = "application/json";
	if (typeof data == 'object')
		res._pending.write.push(JSON.stringify(data));
	else
		res._pending.write.push(String(data));
	res._pending.status = 200;
}

exports.sendHTML = function(res, html) {
	extend(res);
	res._pending.headers["Content-Type"] = "text/html";
	res._pending.write.push(String(html));
	res._pending.status = 200;
}

exports.send500 = function (req, res) {
	extend(res);
	res._pending.file = true;
	res._pending.filepath = './generic/500.html';
	res._pending.status = 500;
}


exports.send400 = function (req, res) {
	extend(res);
	res._pending.file = true;
	res._pending.filepath = './generic/400.html';
	res._pending.status = 400;
}

exports.redirect = function (res, url) {
	extend(res);
	res._pending.headers["Location"] = url;
	res._pending.status = 302;
}

exports.add_header = function(res, header) {
	extend(res);
	res._pending.headers[header.key]= header.value;
}

exports.end = function(req, res) {
	extend(res);

	if (res._pending.file) {
		fileServer.serveFile(res._pending.filepath, res._pending.status, res._pending.headers, req, res);
	} else {
		if (res._pending.status && res._pending.headers)
			res.writeHead(res._pending.status, res._pending.headers);
		if (res._pending.write)
			res.write(res._pending.write.join(" "));
		res.end();
	}
}