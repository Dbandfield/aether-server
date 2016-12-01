/* This is the main app. 
 * It takes connections from clients and lets you 
 * set them up as data senders or receivers */
 
 
/* Functions */
 
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
		
		suffix ++;
		
		
		
		if(unique)
		{
			nameDecided = true;
		}
	}
	console.log("Unique name is: " + newName);
	return newName;
}

 /* Server Setup 
  * We're using express to create the server,
  * http to serve webpages, and ws to handle 
  * websockets */
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

/* Lets create an object to hold messages to be sent */
var msgToSend = 

{
	messageType    : "reading",
	messageContent :
	{
		reading    : ""
	}
};

/* The home page */
app.get("/*", function (req, res) 
{
	console.log("Serving page: " + req.path);

	res.sendFile(__dirname + req.path);

	
  
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

		var msgObject;

		try
		{
			console.log("Attempting to parse JSON");
			msgObject = JSON.parse(data);
		}
		catch(err)
		{
			console.log("JSON parsing failed: ")
			console.log(err);
			return false;
		}
		if(msgObject.hasOwnProperty("messageType"))
		{
			console.log("Message has property \"messageType\"");
			
			if(msgObject.messageType == "config")
			{
				console.log("Message type is \"config\"");
				
				if(msgObject.hasOwnProperty("messageContent"))
				{
					console.log("Message has property \"messageContent\"");
					
					if(typeof(msgObject.messageContent == "object"))
					{
						console.log("Message property \"messageContent\" is of type \"object\"");
						
						if(msgObject.messageContent.hasOwnProperty("name") &&
							msgObject.messageContent.hasOwnProperty("mode"))
						{
							console.log("Message property \"messageContent\" " + 
										"has the properties \"name\" and \"mode\"");
										
							var uniqueName = checkName(msgObject.messageContent.name);
							
							if(msgObject.messageContent.mode == "send")
							{
								console.log("Mode is send");
								console.log("Name is " + uniqueName);
								
								senders.push(
								{
									clientName      : uniqueName,
									clientSocket    : ws,
									clientReading   : "",
									clientReceivers : []
								});
							}
							else if (msgObject.messageContent.mode == "receive")
							{
								console.log("Mode is receive");
								console.log("Name is " + uniqueName);
								
								/* Test code */
								for(var i in senders)
								{
									senders[i].clientReceivers.push(ws);
								}
								/* end test code */
								
								receivers.push(
								{
									clientName   : uniqueName,
									clientSocket : ws,
									clientSender : null
								});
							} 
						} // has name and mode
					} // is object
				} // has message content
			} // message type
			else if(msgObject.messageType == "reading")
			{
				console.log("Message type is \"reading\"");
				
				if(msgObject.hasOwnProperty("messageContent"))
				{
					console.log("Message has property \"messageContent\"");
					
					if(typeof(msgObject.messageContent == "object"))
					{
						console.log("Message property \"messageContent\"" + 
									"is of type \"object\"");
									
						if(msgObject.messageContent.hasOwnProperty("reading"))
						{
							console.log("Message content has property \"reading\"");
							
							 var client = checkClientList(ws, 1);
							 
							 /* if client exists in list */
							 if(client)
							 {
								 console.log("Client is in list");
								 client.clientReading = msgObject.messageContent.reading;
								 
								 console.log("Reading is: " + client.clientReading);
								 
								 msgToSend.messageContent = {reading: ""};
								 msgToSend.messageContent.reading = 
										msgObject.messageContent.reading;
								 /* send message to each of the clients receivers
								  * (if any ) */
								 for(var i in client.clientReceivers)
								 {
									 console.log("Sending reading to receiver " + i);

									 client.clientReceivers[i].send(JSON.stringify(msgToSend));
								 }
							 }
						} // has reading
					} // is object
				} // has message content
			} // message type
		}

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
	});
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + port) });