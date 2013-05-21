//# import config file globally
gconfig = require('../config.js');

//# start nodetime profiler. nodetime must be the first module.
gnodetime = require('./my_modules/nodetime.js');
gnodetime.start();

//# import global modules
gutil = require('util');
ghf = require('./my_modules/helperfunc.js');
glog = require('./my_modules/log.js');

//# import local modules
var http = require('http');
var router = require('./my_modules/router.js'),
	cookie = require('./my_modules/cookie.js');

glog.info('app.js Started.', {time: ghf.get_datetime()});

process.on('uncaughtException', function(err) {
	glog.error('process.uncaughtException', err);
	gnodetime.destroy(); // TODO investigate how to do this from forever and handle all exit cases
	glog.info('app.js Ended.');
	process.exit(-1);
});

process.on('exit', function(){
	glog.info('app.js Ended.');
});

process.on('SIGINT', function(){
	glog.info('app.js SIGINT received.');
	glog.info('app.js Ended.');
	process.exit(0);
});

//# start server
http.createServer(function(req, res){
	cookie.parse(req);
	router.Route(req, res);
}).listen(gconfig.port);
glog.info('app.js .listen(' + gconfig.port + ')');