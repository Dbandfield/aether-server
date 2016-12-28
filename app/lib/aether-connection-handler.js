/* This object stores Aether connections and handles their interactions.
   Error messages are prefixed with [ACH] */

module.exports = exports = function AetherConnections()
{
	/* To maintain a reference to this object. The this keyword changes meaning
	 * when passed to a callback function 
	 */
	myself = this;
	
	/*----- OBJECT PROPERTIES -----*/
	/* A list of senders, receivers and controllers */
	this.senders     = [];
	this.receivers   = [];	
	this.controllers = [];
	
	/*----- OBJECT METHODS -----*/
	
	/*----- Public -----*/
	
	/* Description: Processes a received message.
	   Arguments:   A Received Message, and the socket it came from.
	   Returns:     Nothing
     */	
	this.processMessage = function(msg, socket)
	{
		/* try parsing the message */
		var parsedMessage = this.parseMessage(msg);
		
		/* Parsed correctly? */
		if(parsedMessage)
		{
			/* If it is a configuration message */
			if(parsedMessage.messageType == "config")
			{
				this.configureClient(parsedMessage, socket);
				this.updateControllers();
			}
			/* if it is a new connection between a sender and a receiver */
			else if(parsedMessage.messageType == "new connection")
			{
				this.updateConnections(parsedMessage.messageContent.receiver,
									   parsedMessage.messageContent.sender);
				this.updateControllers();
			}
			else
			{
				/* Unrecognised message type */
				console.error("[ACH] Unrecognised message format");
			}
		}
		else
		{
			console.error("[ACH] Message not parsed");
		}
	}
	/* Description: When the connection is closed, update everything.
	   Arguments:   The socket that was closed
	   Returns:     Nothing
     */		
	this.closeConnection = function(socket)
	{
		for(var i in this.senders)
		{
			if(this.senders[i].clientSocket == socket)
			{
				/* Remove this from connected connections. */
				for(var j in this.senders[i].clientReceivers)
				{
					for(var k in this.receivers)
					{
						if(this.senders[i].clientReceivers[j].name == 
							this.receivers[k].clientName)
							{
								this.receivers[k].clientSender.name = "";
								this.receivers[k].clientSender.socket = null;
							}
					}
				}
				this.senders.splice(i, 1);
				break;
			}
		}
		for(var i in this.receivers)
		{
			if(this.receivers[i].clientSocket == socket)
			{
				if(this.receivers[i].clientSender.name != "")
				{
					for(var j in this.senders)
					{
						for(var k in this.senders[j].clientReceivers)
						{
							if(this.senders[j].clientReceivers[k].name ==
							   this.receivers[i].clientName)
							   {
								   this.senders[j].clientReceivers.splice(k, 1);
							   }
						}
					}
				}
				this.receivers.splice(i, 1);
				break;
			}
		}
		for(var i in this.controllers)
		{
			if(this.controllers[i].clientSocket == socket)
			{
				console.log("Removing " + this.controllers[i].clientName +
								" from receivers list");
				this.controllers.splice(i, 1);
				break;
			}
		}
		
		/* Update the controllers */
		this.updateControllers();		
	}
	
	/*----- Private -----*/
	
	/* Description: Provide the function with a recieved message. It will 
	                attempt to convert into a JSON.
	   Arguments:   A Received Message.
	   Returns:     A Parsed message as javascript object, or NULL if parsing 
	                failed 
     */
	this.parseMessage = function(msg)
	{
		var parsed = null;
		/* Try to parse the message into a JS object. If this 
		 * fails it means the message was not JSON */
		try
		{
			parsed = JSON.parse(msg);
		}
		catch(err)
		{
			console.log("[ACH] JSON parsing failed: ")
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
		console.error("[ACH] Message has incorrect properties");
		return null;
	}
	
	/* Description: Configures the client with the message provided
	   Arguments:   A configure message
	   Returns:     true if successful, false otherwise
     */
	this.configureClient = function(msg, socket)
	{
		/* Check for name and mode properties */
		if(msg.messageContent.hasOwnProperty("name") &&
			msg.messageContent.hasOwnProperty("mode"))
		{
			/* Check for name uniqueness */
			var uniqueName = this.checkName(msg.messageContent.name);
			
			/* Send? */
			if(msg.messageContent.mode == "send")
			{
				/* add to the array */
				this.senders.push(
				{
					clientName      : uniqueName,
					clientSocket    : socket,
					clientReading   : "",
					clientReceivers : []
				});

				/* Because the client is now registered, we can give the socket
				 * a new onMessage function. We are only listening for new data,
				 * and for efficiency's sake are not checking it is of the right
				 * type.
				 */
				function senderFunction(data, flags)
				{
					/* Look for this socket in senders */
					for(var c in myself.senders)
					{
						if(myself.senders[c].clientSocket == socket)
						{
							for(var r in myself.senders[c].clientReceivers)
							{
								myself.senders[c]
								      .clientReceivers[c]
									  .socket.send(data);
							}
							
							console.log("Socket " + socket);
							console.log("was sent " + data);
						}
					}
				}
				socket.removeAllListeners();
				socket.on('message', senderFunction);
				socket.on('close', function(){myself.closeConnection(socket)});
				/*Success!*/
				return true;
			}
			/* Or receive? */
			else if (msg.messageContent.mode == "receive")
			{
				
				this.receivers.push(
				{
					clientName   : uniqueName,
					clientSocket : socket,
					clientSender : 
					{
						name: "",
						socket: null
					}
				});
				/* Because the client is now registered, we can give the socket
				 * a new onMessage function. (Nothing in it for now, because 
				 * there are no messages we need to process from receivers)
				 */
				 socket.removeAllListeners();
				socket.on('message', function(data, flags){});
				socket.on('close', function(){myself.closeConnection(socket)});
				
				/* Success!*/
				return true;
			} 
			/* Or controller? */
			else if (msg.messageContent.mode == "controller")
			{
				
				this.controllers.push(
				{
					clientName   : uniqueName,
					clientSocket : socket
				});
				/* Success!*/
				return true;
			}
			/* Or unrecognised ? */
			else
			{
				console.error("[ACH] Unrecognised type in config message");
			}
		} 
		
		/* If we haven't returned true yet, then the message 
		 * object wasn't correctly formatted. Return false 
		 */
		 console.error("[ACH] Unable to configure client");
		return false;
	}
	
	/* Description: Checks the name to see if it is unique
	   Arguments:   A name
	   Returns:     The orginal name, or if it wasn't unique, a new unique name
     */	
	this.checkName = function(name)
	{
		/* Haven't decided on uniqness yet */
		var nameDecided = false;
		/* If not unique, name is made unique by appending numbers */
		var suffix = 0;
		/* If no name is provided give it a default*/
		var newName;
		if(name == "")
		{
			newName = "1";
		}
		else
		{
			newName = name;
		}		
		
		while(!nameDecided)
		{
			var unique = true;
		
			/* Check senders */
			for(var i in this.senders)
			{
				
				if(this.senders[i].clientName == newName)
				{
					unique = false;
					newName = name + suffix;
					break;
				}
			}
			// and receivers
			for(var i in this.receivers)
			{
				/* If name already exists, indicate so */
				if(this.receivers[i].clientName == newName)
				{
					unique = false;
					newName = name + suffix;
					break;
				}
			}
			
			/* get a new suffix */
			suffix ++;
			
			if(unique)
			{
				nameDecided = true;
			}
		}
		/* Success!*/
		return newName;
	}
	
	/* Description: Updates the connections to connect receiver "r" with sender
					"s"
	   Arguments:   The name of a receiver and the name of a sender
	   Returns:     True if successful, false otherwise
     */	
	this.updateConnections = function(r, s)
	{
		/* Check args */
		if(typeof(r) != "string" ||
		   typeof(s) != "string")
		{
			console.error("[ACH] Wrong types supplied to updateConnections");
			return false;
		}
		
		/* look for receiver */
		for(var i in this.receivers)
		{
			if(this.receivers[i].clientName == r)
			{
				/* Look for sender */
				for(var j in this.senders)
				{
					if(this.senders[j].clientName == s)
					{
						/* First, if the receiver already is connected to a sender,
						 * remove the receiver from that sender's list 
						 */
						if(this.receivers[i].clientSender.name != "")
						{
							for(var k in this.senders)
							{
								if(this.senders[k].clientName == 
										this.receivers[i].clientSender.name)
								{
									for(var ii in this.senders[k].clientReceivers)
									{
										if(this.senders[k].clientReceivers[ii].name == 
											this.receivers[i].clientName)
											{
												this.senders[k].clientReceivers.splice(ii, 1);
											}
									}
								}
							}
						}
						/* Set the references to eachother */
						this.receivers[i].clientSender.name = this.senders[j].clientName;
						this.receivers[i].clientSender.socket = this.senders[j].clientSocket;
						this.senders[j].clientReceivers.push({name : this.receivers[i].clientName,
														 socket : this.receivers[i].clientSocket});
						return true;
					}
				}
				console.error("[ACH] Sender " + s + " not found");
				return false;
			}
		}
		console.error("[ACH] Receiver " + r + " not found");
		return false;
		
		   
	}
	
	/* Description: Updates the controllers with the latest connection 
					information.
	   Arguments:   none
	   Returns:     none
     */	
	this.updateControllers = function()
	{
		/* Prepare a message */
		msg = 	{
					messageType    : "connUpdate",
					messageContent : 
					{
						senderList     : [],
						receiverList   : []
					} 
				};
		/* Populate the message with senders */
		for(var j in this.senders)
		{
			msg.messageContent.senderList.push(
			{
				name: this.senders[j].clientName,
				receivers: []
			});
			
			for(var k in this.senders[j].clientReceivers)
			{
				msg.messageContent
				   .senderList[j]
				   .receivers
				   .push(this.senders[j].clientReceivers[k].name);
			}
		}
		/* Populate the message with receivers */
		for(var j in this.receivers)
		{
			msg.messageContent.receiverList.push(
			{
				name: this.receivers[j].clientName,
				sender: this.receivers[j].clientSender.name
			});
		}
		/* Finally go through each controller and send the message */
		for(var i in this.controllers)
		{
			this.controllers[i].clientSocket.send(JSON.stringify(msg));
		}	
	}
}