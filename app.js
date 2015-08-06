'use strict';
let http = require('http');
let env = process.env;
let port = env.OPENSHIFT_IOJS_PORT || 1337;
let ip = env.OPENSHIFT_IOJS_IP || '127.0.0.1';

http.createServer(function(req, res) {
    let body = `Welcome to io.js on OpenShift!
  Everything seems to be in order.
  Running io.js`;
    for (let v in process.versions) {
      body += `\n- ${v}: ${process.versions[v]}`;
    }

    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end(body);
}).listen(port, ip);
