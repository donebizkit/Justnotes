//# import modules
var winston = require('winston');

winston.add(winston.transports.File, {
	filename:  '../logs/' + ghf.get_datetime(true) + '.log', timestamp: function(){ return ghf.get_datetime() }
});

exports.info = function(message, metadata)
{
	console.log("");
	console.log(ghf.get_datetime(), ghf.get_uptime());

	winston.info(message, metadata);
}

exports.error = function(message, err, metadata)
{
	console.log("");
	console.log(ghf.get_datetime(), ghf.get_uptime());

	var cerr = getCuratedError(message, err, metadata);
	winston.error(cerr.message, cerr.metadata);
}

function getCuratedError(message, err, metadata)
{
	if (typeof message != 'string' || message === "" || err === undefined)
		throw new Error('log.exports.error > Empty Message or Undefined Error Object');

	metadata = metadata || {};
	if (err != null)
	{
		metadata.ErrorObject = gutil.inspect(err, true, null);
		if (err.stack)
			metadata.ErrorStack = err.stack;
	}

	return { 'message': message, 'metadata': metadata };
}