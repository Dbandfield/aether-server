/* nodeMCU led script 
 * Turns the "led" on when a message received from the
 * server 
 */
 
 /* We're using jQuery. Wait until document has loaded. */
$(document).ready(function(){
	
	/* Our server */
	var url = 'ws://connectivity-92668.onmodulus.net/';
	var localUrl = 'ws://localhost:3000';
	/* Create a websocket */
	var ws = new WebSocket(url);
	/* Create an object to store client details */
	var clientConfig = 
	
	{	
		messageType     : "config",
		messageContent  : 
		{
			device      : "nodeMCU",
			name        : "led1",
			mode        : "receive",
			dataType    : "pulse"
		}
	};
	
	var ledOn = false;
	
	
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
		
		console.log(data.data);
		/* Create an object */
		try
		{
			var msgObject = JSON.parse(data.data);
		}
		catch(err)
		{
			console.log(err);
			return false;
		}

		if(msgObject.hasOwnProperty("messageType"))
		{
			if(msgObject.messageType == "reading")
			{
				if(msgObject.hasOwnProperty("messageContent"))
				{
					if(msgObject.messageContent.hasOwnProperty("reading"))
					{
						if(msgObject.messageContent.reading == "pulse")
						{
							/* Turn led to alternate state */
							ledOn = !ledOn;
							
							/* Change image appropriately */
							if(ledOn)
							{
								$("#led-img").attr("src", 
												   "images/led-on.jpg");
							}
							else
							{
								$("#led-img").attr("src", 
												   "images/led-off.jpg");
							}
						}
					}
				}
			}
		}
						
			
		
		
	};
	
});