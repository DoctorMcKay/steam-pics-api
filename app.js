const PORT = process.env.OPENSHIFT_IOJS_PORT || 8080;
const IP = process.env.OPENSHIFT_IOJS_IP || '127.0.0.1';

var SteamUser = require('steam-user');
var Express = require('express');

var user = new SteamUser();
user.logOn(); // Log onto Steam anonymously

var app = new Express();
app.listen(PORT, IP);

app.get('/', function(req, res) {
	res.redirect("https://github.com/DoctorMcKay/steam-pics-api");
});

app.get('/changes/:changenumber', function(req, res) {
	if(!checkLogOn(req, res)) {
		return;
	}
	
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
		
		// Remove null needs_token properties
		apps.concat(packages).forEach(function(item) {
			if(!item.needs_token) {
				delete item.needs_token;
			}
		});
		
		sendJsonResponse(req, res, {"success": 1, "current_changenumber": currentChangenumber, "apps": apps, "packages": packages});
		clearTimeout(timeout);
	});
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

function checkLogOn(req, res) {
	if(!user.steamID) {
		sendJsonResponse(req, res, "Not logged onto Steam", 503);
		return false;
	}
	
	return true;
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
