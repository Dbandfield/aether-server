/* This is the main app.
 * It takes connections from clients and lets you
 * set them up as data senders or receivers */

/* --- COMPILATION --- */

/* First we compile the client side scripts into "bundle.js"
 * We are using Browserify to bundle the files, and
 * Babel to compile the React/JSX code
 */



  /* --- END COMPILATION --- */

/* Server Setup
 * We're using express to create the server,
 * http to serve webpages, and ws to handle
 * websockets
 */
var

    server          = require('http').createServer(), // Creates server
    url             = require('url'),                 // Handles URLs
    WebSocketServer = require('ws').Server,           // Server side websockets
    wss             = new WebSocketServer({ server: server }),
    express         = require('express'),             // For rendering HTML
    app             = express(),
    port            = process.env.PORT || 3000;       // ***Modulus server*** || Local

/* My libs */
var AetherConnectionHandler = require('./lib/aether-connection-handler');
var aCH = new AetherConnectionHandler();

/* Serve Requested Page */
app.get("/*", function (req, res)
{

	res.sendFile(__dirname + req.path, function (err)
	{
		if (err)
		{
			console.log(err);
			res.status(err.status).end();
		}
		else
		{
		}
	});

});

/* On client connection */
wss.on('connection', function connection(ws)
{
	function defaultFunction(data, flags)
	{
		aCH.processMessage(data, ws);
	}
	/* On receiving a message from a client */
	ws.on('message', defaultFunction);

	ws.on('close', function(req, res)
	{
		aCH.closeConnection(ws);
	});
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + port) });

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});
