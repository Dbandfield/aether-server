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
				unique = false;
				newName = name + suffix;
				break;
			}
		}
		// and receivers
		for(var i in receivers)
		{
			if(receivers[i].clientName == newName)
			{
				unique = false;
				newName = name + suffix;
				break;
			}
		}
		
		suffix ++;
		
		
		
		if(unique)
		{
			nameDecided = true;
		}
	}
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
			
		if(parsed.hasOwnProperty("messageContent"))
		{
			
			if(typeof(parsed.messageContent == "object"))
			{
				
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
					
		var uniqueName = checkName(m.messageContent.name);
		
		/* Send? */
		if(m.messageContent.mode == "send")
		{
			
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
		
		 var client = checkClientList(socket, 1);
		 
		 /* if client exists in list */
		 if(client)
		 {
			 client.clientReading = m.messageContent.reading;
			 
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

				client.clientReceivers[i].socket.send(JSON.stringify(msgToSend));
			}
			
			if(j) console.log("No Receivers available");
			return true;
		 }
	}
	
	return false;
}	

/* Update connections based on new information */
function updateConnections(r, s)
{
	/* Check args */
	if(typeof(r) != "string" ||
	   typeof(s) != "string")
	{
		console.error("Wrong types");
		return false;
	}
	
	/* look for receiver */
	for(var i in receivers)
	{
		if(receivers[i].clientName == r)
		{
			/* Look for sender */
			for(var j in senders)
			{
				if(senders[j].clientName == s)
				{
					/* First, if the receiver already is connected to a sender,
					 * remove the receiver from that sender's list 
					 */
					if(receivers[i].clientSender.name != "")
					{
						for(var k in senders)
						{
							if(senders[k].clientName == receivers[i].clientSender.name)
							{
								for(var ii in senders[k].clientReceivers)
								{
									if(senders[k].clientReceivers[ii].name == 
										receivers[i].clientName)
										{
											senders[k].clientReceivers.splice(ii, 1);
										}
								}
							}
						}
					}
					receivers[i].clientSender.name = senders[j].clientName;
					receivers[i].clientSender.socket = senders[j].clientSocket;
					senders[j].clientReceivers.push({name   : receivers[i].clientName,
													 socket : receivers[i].clientSocket});
					return true;
				}
			}
			console.error("Sender " + s + " not found");
			return false;
		}
	}
	console.error("Receiver " + r + " not found");
	return false;
	
	   
}

/* Updates controllers with latest connection information */
function updateControllers()
{
	for(var i in controllers)
	{
		msg = 	{
					messageType    : "connUpdate",
					messageContent : 
					{
						senderList     : [],
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
	/* On receiving a message from a client */
	ws.on('message', function (data, flags) 
	{
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

				}
				else
				{
					console.error("Configuration not " +
								"successful");
				}
			}
			else if(msgObject.messageType == "reading")
			{
				/* Process reading */
				if(processReading(msgObject, ws))
				{
				}
				else
				{
					console.error("Read not " +
								"successful");
				}				
			}
			else if(msgObject.messageType == "new connection")
			{
				updateConnections(msgObject.messageContent.receiver,
									msgObject.messageContent.sender);
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
				/* Remove this from connected connections. */
				for(var j in senders[i].clientReceivers)
				{
					for(var k in receivers)
					{
						if(senders[i].clientReceivers[j].name == 
							receivers[k].clientName)
							{
								receivers[k].clientSender.name = "";
								receivers[k].clientSender.socket = null;
							}
					}
				}
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
				if(receivers[i].clientSender.name != "")
				{
					for(var j in senders)
					{
						for(var k in senders[j].clientReceivers)
						{
							if(senders[j].clientReceivers[k].name ==
							   receivers[i].clientName)
							   {
								   senders[j].clientReceivers.splice(k, 1);
							   }
						}
					}
				}
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