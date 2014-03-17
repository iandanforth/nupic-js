// A very basic web server in node.js
// Stolen from: Node.js for Front-End Developers by Garann Means (p. 9-10) 

// Dependencies.
var path = require("path");
var connect = require("connect");
// Constants.
var PORT = 8000;
var SERVER_URL = "127.0.0.1";
var VALID_EXTENSIONS = [
	".html", ".js", ".css", ".txt", ".jpg", ".gif", ".png", ".ico", ".json"
];
// Connect application.
var app;

function isValidExtension(extension) {
	return VALID_EXTENSIONS.indexOf(ext) > -1;
}

function filterExtensions(req, res, next) {
	var filename = req.url || "index.html";
	var ext = path.extname(filename);
	if (isValidExtension) {
		// Pass control to next middleware.
		next();
	} else {
		res.statusCode = 404;
		res.end("File not found.");
	}
}

app = connect()
	// Ignore requests for files outside valid extensions.
	.use(filterExtensions)
	// Server all files from 'static' directory.
	.use(connect.static(__dirname + '/static'));

console.log("Starting web server at " + SERVER_URL + ":" + PORT);
app.listen(PORT, SERVER_URL);
