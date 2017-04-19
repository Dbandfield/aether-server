/* This is the main app.
 * It takes connections from clients and lets you
 * set them up as data senders or receivers */

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

app.post('/contact', function (req, res)
{
  var mailOpts, smtpTrans;
  //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
  smtpTrans = nodemailer.createTransport('SMTP',
  {
      service: 'Gmail',
      auth:
      {
          user: "iot.aether@gmail.com",
          pass: "originalaether70"
      }
  });
  //Mail options
  mailOpts = {
      from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      to: 'iot.aether@gmail.com',
      subject: 'Website contact form',
      text: req.body.message
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
      //Email not sent
      if (error) {
          res.render('contact', { title: 'Contact', msg: 'Error occured, message not sent.', err: true, page: 'contact' })
      }
      //Yay!! Email sent
      else {
          res.render('contact', { title: 'Contact', msg: 'Message sent! Thank you.', err: false, page: 'contact' })
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
