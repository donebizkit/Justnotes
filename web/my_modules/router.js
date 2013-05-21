//# import module
var url = require('url'),
	qs = require('querystring')
	async = require('async');
var dll = require('./dll.js'),
	reshelper = require('./reshelper.js'),
	cookie = require('./cookie.js');

// holds routing paths
var routes = [];

// homebrew routing routine
exports.Route = function(req, res)
{
	var jurl = url.parse(req.url, true);
	var path = parse_path(jurl.pathname);
	var i, route;
	for (i = path.length; i > 0; i--)
	{
		route = req.method + path.slice(0, i).join("");
		if (typeof routes[route] === "function")
		{
			//console.log("> " + route + " " + req.url)
			routes[route](req, res, path, jurl.query);
			break;
		}
	}
	if (i == 0)
	{
		route = req.method + "/*";
		if (typeof routes[route] === "function")
		{
			//console.log("> " + route + " " + req.url)
			routes[route](req, res, path, jurl.query);
		}
		else
		{
			reshelper.send400(req, res);
			reshelper.end(req, res);
		}
	}
}

routes["GET/"] = function(req, res, path, query) {
	cookie.set_auxiliary(res, "GA", gconfig.ga || false);
	reshelper.sendFile(res, '/html/index.html');
	reshelper.end(req, res);
}

routes["POST/"] = function(req, res, path, query) {
	read_post_data(req, function(err, data) {
		if (err){
			glog.error("Error reading post data [POST /]", err);
			return reshelper.end(req, res);
		}

		var q = qs.parse(data);

		if (q.hid === "login" || q.hid === "signup") {
			if (
				!q.e || !q.p ||
				!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(q.e) ||
				q.p.length === 0
			) {
				cookie.clear(res);
			 	return reshelper.end(req, res);
			}
		}

		if (q.hid === "login") {
			async.waterfall([
				function(callback) {
					dll.executeReader(
						"SELECT user_id FROM USERS WHERE email = ? AND password = ?",
						[q.e, q.p],
						function(err, rows, columns)
						{
							if (err) return callback(err);
							if (rows.length === 1)
								return callback(null, rows[0].user_id);
							else
								return callback(null, undefined);
						}
					)
				}
			],
			function(err, user_id) {
				if (err) {
					glog.error("An error Occured", err, query)
					cookie.clear(res);
					reshelper.redirect(res, "/");
					return reshelper.end(req, res);
				}

				if (user_id === undefined) {
					cookie.clear(res);
					reshelper.redirect(res, "/#" + ghf.to_b64({id:1, e:q.e, p:q.p}));
					return reshelper.end(req, res);
				} else {
					cookie.set(res, {user_id: user_id}, "1 week");
					reshelper.redirect(res, "/home");
					return reshelper.end(req, res);
				}
			})
		} else if (q.hid === "signup") {
			async.waterfall([
				function(callback) {
					dll.executeReader(
						"INSERT INTO USERS (email, password) VALUES (?, ?)",
						[q.e, q.p],
						function(err, rows)
						{
							if (err) return callback(err);

							return callback(null, rows.insertId);

						}
					)
				},

				function(user_id, callback) {
					dll.executeReader(
						"INSERT INTO NOTES (user_id, config, creation_date) SELECT ?, config, NOW() FROM DEFAULT_NOTE",
						user_id,
						function(err, rows)
						{
							if (err) return callback(err);

							return callback(null, user_id);
						}
					)
				}
			],
			function(err, user_id) {
				if (err) {
					if (err.code === "ER_DUP_ENTRY") {
						cookie.clear(res);
						reshelper.redirect(res, "/#" + ghf.to_b64({id:2, e:q.e, p:q.p}));
						return reshelper.end(req, res);
					} else {
						glog.error("An error Occured", err, query)
						cookie.clear(res);
						reshelper.redirect(res);
						return reshelper.end(req, res);
					}
				}

				cookie.set(res, {user_id: user_id}, "1 week");
				reshelper.redirect(res, "/home");
				return reshelper.end(req, res);
			})
		} else if (q.hid === "play") {
			cookie.set(res, {user_id: 0}, null);
			reshelper.redirect(res, "/play");
			return reshelper.end(req, res);
		}
		else
			return reshelper.end(req, res);
	})
}

routes["GET/home"] = function(req, res, path, query) {
	if (!req.cookie || req.cookie.user_id === 0) {
		reshelper.redirect(res, "/");
		return reshelper.end(req, res);
	}
	cookie.set_auxiliary(res, "GA", gconfig.ga || false);
	// extend cookie
	cookie.set(res, {user_id: req.cookie.user_id}, "1 week");
	reshelper.sendFile(res, '/html/home.html');
	return reshelper.end(req, res);
}

routes["GET/play"] = function(req, res, path, query) {
	if (!req.cookie || req.cookie.user_id != 0) {
		reshelper.redirect(res, "/");
		return reshelper.end(req, res);
	}
	cookie.set_auxiliary(res, "GA", gconfig.ga || false);
	reshelper.sendFile(res, '/html/home.html');
	return reshelper.end(req, res);
}

routes["POST/home"] = function(req, res, path, query) {
	read_post_data(req, function(err, data) {
		if (err){
			glog.error("Error reading post data [POST /home]", err);
			return reshelper.end(req, res);
		}

		var q = qs.parse(data);

		if (q.key === "1") {
			cookie.clear(res);
			reshelper.redirect(res, "/");
			return reshelper.end(req, res);
		}

		return reshelper.end(req, res);
	})
}

routes["GET/editor"] = function(req, res, path, query) {
	reshelper.sendFile(res, '/html/test/editor.html');
	return reshelper.end(req, res);
}

routes["GET/ajax/data"] = function(req, res, path, query)
{
	if (query.req === "get_notes")
	{
		if (!req.cookie) {
			reshelper.sendJson(res, {unauthorized: false});
			return reshelper.end(req, res);
		}

		dll.executeReader(
			"SELECT note_id, update_date, config FROM NOTES WHERE user_id = ? AND deleted = (0) ORDER BY update_date DESC",
			[req.cookie.user_id],
			function(err, rows, columns)
			{
				if (err) {
					glog.error("An error Occured", err, query)
					return reshelper.end(req, res);
				}

				reshelper.sendJson(res, rows)
				return reshelper.end(req, res);
			}
		);
	}
}

routes["POST/ajax/data"] = function(req, res, path, query)
{
	if (query.req === "save")
	{
		if (req.cookie.user_id === 0)
			return reshelper.end(req, res);

		read_post_data(req, function(err, data) {
			if (err){
				glog.error("Error reading post data [POST /ajax/data?req=save]", err);
				return reshelper.end(req, res);
			}

			data = JSON.parse(data);

			if (data.note_id !== undefined) {
				dll.executeReader(
					"UPDATE NOTES SET config = ?, update_date = CURRENT_TIMESTAMP WHERE note_id = ? and user_id = ?",
					[JSON.stringify(data.config), data.note_id, req.cookie.user_id],
					function(err, response)
					{
						if (err)
						{
							glog.error("An error Occured", err, query)
							return reshelper.end(req, res);
						}

						return reshelper.end(req, res);
					}
				);
			}
			else {
				dll.executeReader(
					"INSERT INTO NOTES (config, user_id, creation_date) VALUES (?, ?, NOW())",
					[JSON.stringify(data.config), req.cookie.user_id],
					function(err, response)
					{
						if (err)
						{
							glog.error("An error Occured", err, query)
							return reshelper.end(req, res);
						}

						reshelper.sendJson(res, {id: response.insertId})
						return reshelper.end(req, res);
					}
				);
			}
		})
	}

	else if (query.req === "delete")
	{
		if (req.cookie.user_id === 0)
			return reshelper.end(req, res);

		read_post_data(req, function(err, data) {
			if (err){
				glog.error("Error reading post data [POST /ajax/data?req=delete]", err);
				return reshelper.end(req, res);
			}

			data = JSON.parse(data);

			dll.executeReader(
				"UPDATE NOTES SET deleted = (1), deletion_date = CURRENT_TIMESTAMP WHERE note_id = ? AND user_id = ?",
				[data.note_id, req.cookie.user_id],
				function(err, response)
				{
					if (err)
					{
						glog.error("An error Occured", err, query)
						return reshelper.end(req, res);
					}

					return reshelper.end(req, res);
				}
			);
		})
	}

	else
		return reshelper.end(req, res);
}

routes["GET/res"] = function(req, res, path, query)
{
	reshelper.sendFile(res, path.splice(1).join(""), function(err){
		if (err) {
			glog.error('Unable to send resource', err, {filepath: path.join("/") });
			return reshelper.end(req, res);
		}
	});
	return reshelper.end(req, res);
}

routes["GET/favicon.ico"] = function(req, res){
	return reshelper.end(req, res);
}


function read_post_data(req, callback)
{
	var data = '';
	var aborted = false;
    req.on('data', function (chunk) {
		/* check request length to avoid fludding */
		if(chunk.length > 5000 || data.length > 5000) {
            data = '';
			aborted = true;
			callback(new Error('Post data too big. ' + chunk.length + '. ' + data.length));
			return;
        }
		data += chunk;
    });

    req.on('end', function () {
		if (!aborted)
		{
			callback(null, data);
			return;
		}
    });
};

function parse_path(path)
{
	var path_parts = [];
	var start = 0;
	var next;

	if (!path || path === "")
		path = "/";
	else if (path[0] != "/")
		path = "/" + path;
	while(true)
	{
		next = path.indexOf("/", start+1);
		if (next > 0)
		{
			path_parts.push(path.substring(start, next));
			start = next;
		}
		else
		{
			path_parts.push(path.substring(start));
			break;
		}
	}

	return path_parts;
}