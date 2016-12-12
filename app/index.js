/* This is the main app. 
 * It takes connections from clients and lets you 
 * set them up as data senders or receivers */
 
 
/* Function Definitions */
 
/* Check for client in list. Provide a websocket client
 * object, and a mode. 1 to check senders, and 2 for 
 * receivers. Returns the object from the list. Returns NULL
 * if not found. */
function checkClientList(client, mode)
{
 if(mode == 1)
 {
	 for(var c in senders)
	 {
		 if(senders[c].clientSocket == client)
		 {
			 console.log("Client found in senders list")
			 return senders[c];
		 }

	 }
	 console.log("Client not found in senders list")
	 return null;
 }
 else if (mode == 2)
 {
	 for(var c in receivers)
	 {
		 if(senders[c].clientSocket == client)
		 {
			 console.log("Client found in receivers list");
			 return receivers[c];
		 }

	 }
	 console.log("Client not found in receivers list");
	 return null;
 }
 else
 {
	 return null;
 }

}

/* Check if there already is a configured client with the 
 * same name. If so, append some numbers to the chosen name
 * to make it unique. Returns the original name if it is ok,
 * or the modified name if not */
function checkName(name)
{
	console.log("Checking name availability for " + name);
	var nameDecided = false;
	var suffix = 0;
	if(name == "")
	{
		name = "1";
	}
	var newName = name;
	
	
	while(!nameDecided)
	{
		var unique = true;
	
		/* Check senders */
		for(var i in senders)
		{
			if(senders[i].clientName == newName)
			{
				console.log("Name conflict found for name " + 
								newName);
				unique = false;
				newName = name + suffix;
				console.log("Checking availability of " + 
								newName);
				break;
			}
		}
		// and receivers
		for(var i in receivers)
		{
			if(receivers[i].clientName == newName)
			{
				console.log("Name conflict found for name " + 
								newName);
				unique = false;
				newName = name + suffix;
				console.log("Checking availability of " + 
								newName);
				break;
			}
		}
		
		suffix ++;
		
		
		
		if(unique)
		{
			nameDecided = true;
		}
	}
	console.log("Unique name is: " + newName);
	return newName;
}

/* Checks the object passed to it to see if it is a valid
 * message. A valid message will be in JSON format, and the
 * parsed object will have the properties messageType and
 * message content. If so, returns the message as an object. 
 * If not then it returns "null". This function only checks 
 * properties that should be common to all message types. 
 * Further checks WILL have to be made based on what is
 * expected of specific message types (eg. message content
 * is not guaranteed to have any properties by this function,
 * because those properties depend on what type of message 
 * it is).
 */

function isValidMessage(m)
{
	var parsed = null;
	/* Try to parse the message into a JS object. If this 
	 * fails it means the message was not JSON */
	try
	{
		console.log("Attempting to parse JSON");
		parsed = JSON.parse(m);
	}
	catch(err)
	{
		console.log("JSON parsing failed: ")
		console.log(err);
		return null;
	}
	
	/* Check it has the correct properties. Note: further 
	 * checks will have to be made based on the specific 
	 * message type.
	 */
	if(parsed.hasOwnProperty("messageType"))
	{
		console.log("Message has property \"messageType\"");
			
		if(parsed.hasOwnProperty("messageContent"))
		{
			console.log("Message has property \"messageContent\"");
			
			if(typeof(parsed.messageContent == "object"))
			{
				console.log("Message property \"messageContent\" is of type object");
				
				/* Success */
				return parsed;
			}
		}
	}
	
	/* Not valid */
	return null;
	
}

/* Pass a configure message object and the socket it came from
 * to this function to check 
 * it and then put the cient into the right catgeory. 
 * You must first check the message validity generally
 * before calling this function. Returns true if successful
 * and false otherwise.
 */
function configureClient(m, socket)
{
	/* Check for name and mode properties */
	if(m.messageContent.hasOwnProperty("name") &&
		m.messageContent.hasOwnProperty("mode"))
	{
		console.log("Message property \"messageContent\" " + 
					"has the properties \"name\" and \"mode\"");
					
		var uniqueName = checkName(m.messageContent.name);
		
		/* Send? */
		if(m.messageContent.mode == "send")
		{
			console.log("Mode is send");
			console.log("Name is " + uniqueName);
			
			senders.push(
			{
				clientName      : uniqueName,
				clientSocket    : socket,
				clientReading   : "",
				clientReceivers : []
			});			
			
			return true;
		}
		/* Or receive? */
		else if (m.messageContent.mode == "receive")
		{
			console.log("Mode is receive");
			console.log("Name is " + uniqueName);
			
			receivers.push(
			{
				clientName   : uniqueName,
				clientSocket : socket,
				clientSender : 
				{
					name: "",
					socket: null
				}
			});
			
			return true;
		} 
		/* Or controller? */
		else if (m.messageContent.mode == "controller")
		{
			console.log("Mode is controller");
			console.log("Name is " + uniqueName);
			
			controllers.push(
			{
				clientName   : uniqueName,
				clientSocket : socket
			});
			
			return true;
		}
	} 
	
	/* If we haven't returned true yet, then the message 
	 * object wasn't correctly formatted. Return false 
	 */
	return false;
}

/* Takes a message and the websocket it came from. If the 
 * message is valid, this will process the reading and update
 * those who a receiving from this socket. Returns true if
 * successful, and false otherwise. */
function processReading(m, socket)
{
	if(m.messageContent.hasOwnProperty("reading"))
	{
		console.log("Message content has property \"reading\"");
		
		 var client = checkClientList(socket, 1);
		 
		 /* if client exists in list */
		 if(client)
		 {
			 console.log("Client is in list");
			 client.clientReading = m.messageContent.reading;
			 
			 console.log("Reading is: " + client.clientReading);
			 	/* Lets create an object to hold messages to be sent */
			var msgToSend = 

			{
				messageType    : "reading",
				messageContent :
				{
					reading    : m.messageContent.reading
				}
			};
			
			/* send message to each of the clients receivers
			* (if any ) */
			var j = 0;
			
			for(var i in client.clientReceivers)
			{
				console.log("Sending reading to receiver " + i);

				client.clientReceivers[i].send(JSON.stringify(msgToSend));
			}
			
			if(j) console.log("No Receivers available");
			return true;
		 }
	}
	
	return false;
}	

/* Updates controllers with latest connection information */
function updateControllers()
{
	for(var i in controllers)
	{
		/* This c.l will quickly fill up the console. For
		 * testing only */
		console.log("Updating controller " + i);
		msg = 	{
					messageType    : "connUpdate",
					messageContent : 
					{
						senderList    : [],
						receiverList   : []
					} 
				};
		for(var j in senders)
		{
			msg.messageContent.senderList.push(
			{
				name: senders[j].clientName,
				receivers: []
			});
			
			for(var k in senders[j].clientReceivers)
			{
				msg.messageContent.senderList[j].receivers.push(senders[j].clientReceivers[k].name);
			}
		}
		
		for(var j in receivers)
		{
			msg.messageContent.receiverList.push(
			{
				name: receivers[j].clientName,
				sender: receivers[j].clientSender.name
			});
		}
		
		controllers[i].clientSocket.send(JSON.stringify(msg));
	}	
}

/* Function Definitions End */

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

/* lets create a list of senders */
var senders = [];

/* and a list of receivers */
var receivers = [];

/* and a list of controllers. These are the pages where
 * people can control connections from */
var controllers = [];

/* Serve Requested Page */
app.get("/*", function (req, res) 
{
	console.log("Serving page: " + req.path);

	res.sendFile(__dirname + req.path, function (err) 
	{
		if (err) 
		{
			console.log(err);
			res.status(err.status).end();
		}
		else 
		{
			console.log('Sent:', __dirname + req.path);
		}	
	});
  
});

/* On client connection */
wss.on('connection', function connection(ws) 
{
	console.log("Connection established.")
	//console.log("Client: ") 
	//console.log(ws); // Too verbose
	/* On receiving a message from a client */
	ws.on('message', function (data, flags) 
	{
		console.log("Message received.");
		console.log("Message: ");
		console.log(data);
		
		/* get parsed object, if message was valid */
		var msgObject = isValidMessage(data);
		
		/* if successful */
		if(msgObject)
		{
			if(msgObject.messageType == "config")
			{
				/* Configure client */
				if(configureClient(msgObject, ws))
				{
					console.log("Configuration Successful");

				}
				else
				{
					console.log("Configuration not " +
								"successful");
				}
			}
			else if(msgObject.messageType == "reading")
			{
				/* Process reading */
				if(processReading(msgObject, ws))
				{
					console.log("Read Successful");
				}
				else
				{
					console.log("Read not " +
								"successful");
				}				
			}
		}
		
		/* Update the controllers */
		updateControllers();

	});
	
	ws.on('close', function(req, res)
	{
		for(var i in senders)
		{
			if(senders[i].clientSocket == ws)
			{
				console.log("Removing " + senders[i].clientName +
								" from senders list");
				senders.splice(i, 1);
				break;
			}
		}
		for(var i in receivers)
		{
			if(receivers[i].clientSocket == ws)
			{
				console.log("Removing " + receivers[i].clientName +
								" from receivers list");
				receivers.splice(i, 1);
				break;
			}
		}
		for(var i in controllers)
		{
			if(controllers[i].clientSocket == ws)
			{
				console.log("Removing " + controllers[i].clientName +
								" from receivers list");
				controllers.splice(i, 1);
				break;
			}
		}
		
		/* Update the controllers */
		updateControllers();
	});
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + port) });