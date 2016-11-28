var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 3000;


  
/*app.use(function (req, res) {
  res.send({ msg: "hello" });
});*/

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function connection(ws) {
	
  ws.on('message', function (data, flags) {
	  
    console.log(data);
	
	if(data == 'on')
	{
		wss.clients.forEach(function each(client) {
			client.send(data);
		});
	}
	else if(data == 'off')
	{
		wss.clients.forEach(function each(client) {
			client.send(data);
		});
	}
	
  });
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + port) });