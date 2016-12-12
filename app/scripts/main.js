/* Script for home page */

/* Function definitions */
/* Set up the paragraphs corresponding to different 
 * client connections. Give it a receiver list and sender
 * list.
 */

$(document).ready(function()
{
		/* Our server */
	var url      = 'ws://connectivity-92668.onmodulus.net/';
	var localUrl = 'ws://localhost:3000';
	/* Create a websocket */
	var ws = new WebSocket(localUrl);
	/* Create an object to store client details */
	var clientConfig = 
	
	{	
		messageType     : "config",
		messageContent  : 
		{
			device      : "nodeMCU",
			name        : "netControl",
			mode        : "controller",
			dataType    : ""
		}
	};
	
	/* List of Senders and Receivers */
	var senders   = [];
	var receivers = [];
	
	/* Utility objects from external scripts */
	var messageHandler = new MessageHandler();
	var htmlUpdater    = new HtmlUpdater();
	
	/* When connection is established */
	ws.onopen = function(){
	
		console.log('Connected to ' + url);
		/* Convert client config details to JSON and then
		 * send */
		var clientConfigMsg = JSON.stringify(clientConfig);
		ws.send(clientConfigMsg)
		
	};
	
	/* Upon receiving a message */
	ws.onmessage = function(data, mask)
	{
		/* Process the message */
		if(!messageHandler.processMessage(data.data))
		{
			/* Return false if there was a problem with the message */
			return false;
		}
		
		/* Get lists of senders and receivers */
		senders   = messageHandler.getSenders();
		receivers = messageHandler.getReceivers();
		
		htmlUpdater.update(senders, receivers);
	
	};
});
