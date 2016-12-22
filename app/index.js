/* This is the main app. 
 * It takes connections from clients and lets you 
 * set them up as data senders or receivers */
 
 

/* Main */

/* Server Setup 
 * We're using express to create the server,
 * http to serve webpages, and ws to handle 
 * websockets 
 */
var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 3000;
  
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