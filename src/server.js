module.exports = function(options) {

	"use strict";

	const
		http = require("http"),
		express = require("express"),
		path = require('path'),
                morgan = require('morgan'),
		index = require("./routes/index"),
		photos = require('./routes/photos')(options.webServer),
		slideshow = require('./routes/slideshow'),
                api = require('./routes/API')(options.webServer);

	let app = express();
	app.set('views', path.join(__dirname, 'views'));
    	app.set('view engine', 'jade');
	// uncomment after placing your favicon in /public
  	//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

	let server = http.createServer(app);

//	app.use(/.*map$/, function(req, res) {
//		res.writeHead(404);
//		res.end();
//	});

	const logger = morgan("combined")
	app.use(logger); // https://www.npmjs.com/package/morgan

	app.use(express.static(options.webServer.wwwFolder));
	app.use('/uploads', express.static(options.webServer.uploadFolder));
	
	app.use('/', index);
    app.use('/photos', photos);
    app.use('/API', api);
    app.use('/slideshow', slideshow);

	return {
		start: function() {

			return new Promise(function startPromise(resolve, reject) {
				server.listen(options.webServer.port, function serverListen(err) {

					server.options = options.webServer;

					if (err) {
						err.options = server.options;
						// global.logger.error(err);
						reject(err);
						return;
					}

					console.log(`http server started on port ${server.options.port}`); // TODO: Move this part into the logger
					resolve(server.options);

				});
			});

		},
		stop: function() {

			return new Promise(function stopPromise(resolve, reject) {
				server.close(function serverClose(err) {

					if (err) {
						err.options = server.options;
						// global.logger.error(err);
						reject(err);
						return;
					}

					console.log(`http server stopped on port ${server.options.port}`); // TODO: Move this part into the logger
					resolve(server.options);

				});
			});
		}
	}
};
