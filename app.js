const PORT = process.env.OPENSHIFT_IOJS_PORT || 8080;
const IP = process.env.OPENSHIFT_IOJS_IP || '127.0.0.1';

var SteamUser = require('steam-user');
var Express = require('express');

var app = new Express();
app.listen(PORT, IP);

app.get('/', function(req, res) {
	res.redirect("https://github.com/DoctorMcKay/steam-pics-api");
});
