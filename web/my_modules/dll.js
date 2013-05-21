//# import module
var mysql = require('mysql');

var pool = mysql.createPool({
  host     : gconfig.connection.host,
  user     : gconfig.connection.user,
  password : gconfig.connection.password,
  database : gconfig.connection.database,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 1
});

exports.executeReader = function(query, parameters, callback)
{
	pool.getConnection(function(err, connection) {
		if (err) return callback(err);

		connection.query(query, parameters, function(err, rows, fields) {
			connection.end();
			return callback(err, rows, fields);
		});
	});
}

exports.executeNonQuery = function(query, parameters, callback)
{
	pool.getConnection(function(err, connection) {
		if (err) return callback(err);
		connection.query(query, parameters, function(err, result) {
			connection.end();
			return callback(err, result);
		});
	});
}