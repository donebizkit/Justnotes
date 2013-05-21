//# import local modules
var forever = require('forever-monitor');

var child = new (forever.Monitor)('app.js', {
	options: ["forever"]
});

child.on('start', function () {
	console.log('forever.start');
});

child.on('stop', function () {
	console.log('forever.stop');
});

child.on('restart', function () {
	console.log('forever.restart');
});

child.on('exit', function () {
	console.log('forever.exit');
});

child.start();