const PORT = process.env.OPENSHIFT_IOJS_PORT || 8080;
const IP = process.env.OPENSHIFT_IOJS_IP || '127.0.0.1';

var SteamUser = require('steam-user');
var Express = require('express');

var user = new SteamUser();
user.logOn(); // Log onto Steam anonymously

var app = new Express();
app.listen(PORT, IP);

app.use(checkLogOn);

app.get('/', function(req, res) {
	res.redirect("https://github.com/DoctorMcKay/steam-pics-api");
});

app.get('/changes/:changenumber', function(req, res) {
	var changenumber = parseInt(req.params.changenumber, 10);
	if(isNaN(changenumber)) {
		sendJsonResponse(req, res, "Invalid changenumber", 400);
		return;
	}
	
	var timedOut = false;
	
	var timeout = setTimeout(function() {
		sendJsonResponse(req, res, "Steam request timed out", 504);
		timedOut = true;
	}, 15000); // 15 seconds
	
	user.getProductChanges(changenumber, function(currentChangenumber, apps, packages) {
		if(timedOut) {
			return;
		}
		
		var appData = {};
		var packageData = {};
		
		apps.forEach(function(app) {
			appData[app.appid] = app.change_number;
		});
		
		packages.forEach(function(pkg) {
			packageData[pkg.packageid] = pkg.change_number;
		});
		
		sendJsonResponse(req, res, {"success": 1, "current_changenumber": currentChangenumber, "apps": appData, "packages": packageData});
		clearTimeout(timeout);
	});
});

app.get('/info', function(req, res) {
	if(!req.query || (!req.query.apps && !req.query.packages)) {
		sendJsonResponse(req, res, "No apps or packages specified");
	}
});

function checkParams(req, res, params) {
	for(var i = 0; i < params.length; i++) {
		if(!req.query || typeof req.query[params[i]] === 'undefined') {
			sendJsonResponse(req, res, "Missing required parameter '" + params[i] + "'", 400);
			return false;
		}
	}
	
	return true;
}

function checkLogOn(req, res, next) {
	if(req.url != '/' && !user.steamID) {
		sendJsonResponse(req, res, "Not logged onto Steam", 503);
	} else {
		next();
	}
}

function sendJsonResponse(req, res, response, statusCode) {
	if(typeof response === 'string') {
		response = {"success": 0, "error": response};
	}
	
	if(typeof statusCode === 'number') {
		res.status(statusCode);
	}
	
	res.set('Content-Type', 'application/json');
	res.send(JSON.stringify(response, null, req.query && req.query.prettyprint ? "\t" : null));
}
