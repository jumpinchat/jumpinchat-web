/**
 * Created by vivaldi on 05/10/2014.
 */

'use strict';

/*
 * Modified from https://github.com/elliotf/mocha-mongoose
 */
var mongoose	= require('mongoose');
var log = require('log4js').getLogger("test.util");

before(function (done) {

	function reconnect() {
		mongoose.connect('mongodb://localhost/tctest', function (err) {
			if (err) {
				throw err;
			}
		});
	}

	switch (mongoose.connection.readyState) {
		case 0:
			reconnect();
			break;
		case 1:
			done();
			break;
	}

	mongoose.connection.on('connected', function () {
		//log.info("UTIL", "Connected to DB", mongoose.connection.readyState);
		(function clearDB() {
			for (var i in mongoose.connection.collections) {
				mongoose.connection.collections[i].remove();
			}
		})();
		done();
	});
});

afterEach(function (done) {
	return done();
});