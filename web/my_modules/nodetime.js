var enabled = gconfig.nodetime && gconfig.nodetime.enabled;
var nodetime;

exports.start = function() {
	if (!enabled) return;

	console.log("starting nodetime profiler");
	nodetime = require('nodetime');
	nodetime.profile({
		accountKey: gconfig.nodetime.key,
		appName: gconfig.nodetime.app_name,
		debug: gconfig.nodetime.debug
	});
}

exports.destroy = function() {
	if (nodetime)
		nodetime.destroy();
}

exports.metric = {
	login: function() {
		// if (!enabled) return;
		// nodetime.metric("App Statistics", "Logins", 1, "# of logins", "inc");
	}
}