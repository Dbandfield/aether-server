/* This object is used to handle messages.
 * It checks for message validity and processes
 * the data. */

module.exports = function MessageHandler()
{
	/* -------------------------------------------------- */
	/* OBJECT PROPERTIES                                  */
	/* -------------------------------------------------- */

	/* The Received Message. It should come in a specific
	 * JSON format */
	this.rMessage = "";
	/* If the received message is valid it will be converted
	 * to an object and stored in here */
	this.oMessage = null;
	/* Variables holding data that's ready to use. Access with
	 * the getters.
	 */
	this.senders   = [];
	this.receivers = [];



	/* -------------------------------------------------- */
	/* OBJECT FUNCTIONS                                   */
	/* -------------------------------------------------- */

	/* PUBLIC FUNCTIONS */

	/* Description : This is the main function for processing
	 *               messages.
	 * Arguments   : Provide it with a string that has been
	 *               received from the server using websockets.
	 * Returns     : True if the message was valid and was
	 *               successfully processed. False otherwise.
	 */
	this.processMessage = function(msg)
	{
		try
		{
			var tempMessage = JSON.parse(msg);
			console.log(tempMessage);
		}
		catch(err)
		{
			console.error("The string provided is not JSON");
			console.error(err);
			return false;
		}

		if(!this.isValidMessage(tempMessage))
		{
			console.error("The JSON provided was improperly formatted")
			return false;
		}

		/* If the message is good, write over the previous message data */
		this.oMessage = tempMessage;

		this.senders   = this.oMessage.messageContent.senderList;
		this.receivers = this.oMessage.messageContent.receiverList;

		return true;
	};

	/* Description : Returns the array of senders
	 * Arguments   : None
	 *
	 * Returns     : The array of senders
	 *
	 */
	this.getSenders = function()
	{
		return this.senders;
	}
	/* Description : Returns the array of receivers
	 * Arguments   : None
	 * Returns     : The array of receivers, or false if it is empty.
	 *
	 */
	this.getReceivers = function()
	{
		return this.receivers;
	}


	/* PRIVATE FUNCTIONS */

	/* Description : Checks whether the
	 *               argument string is correctly formatted.
	 *				 See readme for the correct formatting.
	 *  Arguments  : The JSON from the server, processed as
	 *               an object.
	 *
	 *  Returns    : True if valid. False otherwise.
	 *
	 */
	 this.isValidMessage = function(msg)
	 {
		/* Has message type property? */
		if(!msg.hasOwnProperty("messageType"))
		{
			console.error("Message does not have message type property");
			return false;
		}

		/* Is connection update? */
		if(msg.messageType != "connUpdate")
		{
			console.error("Message type is not connection update");
			return false;
		}

		/* Has message content? */
		if(!msg.hasOwnProperty("messageContent"))
		{
			console.error("Message does not have message content property");
			return false;
		}

		/* is an object? */
		if(typeof(msg.messageContent) != "object")
		{
			console.error("Message content is not an object");
			return false;
		}

		/* has sender list and receiver list? */
		if(!(msg.messageContent.hasOwnProperty("senderList") &&
		   msg.messageContent.hasOwnProperty("receiverList")))
		{
			console.error("Message content does not have a sender list and a receiver list");
			return false;
		}

		/* are the lists of type array? */
		if(!(Array.isArray(msg.messageContent.senderList) &&
			Array.isArray(msg.messageContent.receiverList)))
		{
			console.error("Sender list and receiver list are not arrays");
			return false;
		}

		/* go through the array and check if everything
		 * is an object */
		for(var i in msg.messageContent.senderList)
		{
			if(typeof(msg.messageContent.senderList[i]) != "object")
			{
				console.error("Element " + i + " in senderList is not an object");
				return false;
			}

			/* Check if the object has the expected properties: name and receivers */
			if(!(msg.messageContent.senderList[i].hasOwnProperty("name") &&
				msg.messageContent.senderList[i].hasOwnProperty("mode") &&
				msg.messageContent.senderList[i].hasOwnProperty("dataType") &&
				msg.messageContent.senderList[i].hasOwnProperty("connections")))
			{
				console.error("Object " + i + " in senderList does not have expected" +
				" properties");
				console.log(msg.messageContent.senderList[i]);
				return false;
			}

			/* check name is string */
			if(typeof(msg.messageContent.senderList[i].name) != "string")
			{
				console.error("Name is not string");
				return false;
			}

			/* check mode is string */
			if(typeof(msg.messageContent.senderList[i].mode) != "string")
			{
				console.error("Mode is not string");
				return false;
			}

			/* check dataType is string */
			if(typeof(msg.messageContent.senderList[i].dataType) != "string")
			{
				console.error("DataType is not string");
				return false;
			}

			/* check list of receivers is array */
			if(!(Array.isArray(msg.messageContent.senderList[i].connections)))
			{
				console.error("Connections is not an array");
				return false;
			}

			/* check if elements of array are objects */
			for(var j in msg.messageContent.senderList[i].connections)
			{
				if(typeof(msg.messageContent.senderList[i].connections[j])!= "object")
				{
					console.error("Element " + j + " is not an object");
					return false;
				}
			}

			/* Check if objects in receivers array have correct attributes */
			for(var j of msg.messageContent.senderList[i].connections)
			{
				if(!(j.hasOwnProperty("name") &&
					j.hasOwnProperty("mode") &&
					j.hasOwnProperty("dataType")))
				{
					console.error("Object " + i + " in senderList does not have expected" +
					" connections properties");
					return false;
				}
			}

			/* Check type of those attributes */
			for(var j of msg.messageContent.senderList[i].connections)
			{
				/* check name is string */
				if(typeof(j.name) != "string")
				{
					console.error("receiver list Name is not string");
					return false;
				}

				/* check mode is string */
				if(typeof(j.mode) != "string")
				{
					console.error("receiver list Mode is not string");
					return false;
				}

				/* check dataType is string */
				if(typeof(j.dataType) != "string")
				{
					console.error("receiver list DataType is not string");
					return false;
				}
			}
		}

		/* go through the other array and check if everything
		 * is an object */
		for(var i of msg.messageContent.receiverList)
		{
			if(typeof(i) != "object")
			{
				console.error("Element in receiverList is not an object");
				return false;
			}

			/* Check if the object has the expected properties: name and receivers */
			if(!(i.hasOwnProperty("name") &&
				i.hasOwnProperty("mode") &&
				i.hasOwnProperty("dataType") &&
				i.hasOwnProperty("connections")))
			{
				console.error("Object in receiverList does not have expected" +
				" properties");
				return false;
			}

			/* check name is string */
			if(typeof(i.name) != "string")
			{
				console.error("Name is not string");
				return false;
			}

			/* check mode is string */
			if(typeof(i.mode) != "string")
			{
				console.error("Mode is not string");
				return false;
			}

			/* check dataType is string */
			if(typeof(i.dataType) != "string")
			{
				console.error("DataType is not string");
				return false;
			}
			/* check sender is object */
			if(!Array.isArray(i.connections))
			{
				console.error("Connections is not an array");
				return false;
			}

			for(var j of i.connections)
			{
				/* Check properties of sender object */
				if(!(j.hasOwnProperty("name") &&
					j.hasOwnProperty("mode") &&
					j.hasOwnProperty("dataType")))
				{
					console.error("Object in receiverList does not have expected" +
					" properties");
					return false;
				}

				/* Check types of sender object properties */
				/* check name is string */
				if(typeof(j.name) != "string")
				{
					console.error("Name is not string");
					return false;
				}

				/* check mode is string */
				if(typeof(j.mode) != "string")
				{
					console.error("Mode is not string");
					return false;
				}

				/* check dataType is string */
				if(typeof(j.dataType) != "string")
				{
					console.error("DataType is not string");
					return false;
				}
			}

		}

		/* If the function hasn't returned anything at this point, it is valid. Return true */
		return true;
	 }
}
