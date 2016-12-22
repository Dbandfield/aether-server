/* nodeMCU button script 
 * Upon pressing the button, a message is sent to the
 * server indicating that the button has been pressed 
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
			name        : "button1",
			mode        : "send",
			dataType    : "pulse"
		}
	};
		
	
	/* When connection is established */
	ws.onopen = function(){
	
		console.log('Connected to ' + url);
		/* Convert client config details to JSON and then
		 * send */
		var clientConfigMsg = JSON.stringify(clientConfig);
		ws.send(clientConfigMsg)
		
	};
	
	ws.onmessage = function(data, mask)
	{
	
		console.log(data);
	};
	
	/* When the button is pressed, change the image */
	
	$("#button-img").mousedown(function(){
		
		$(this).attr("src", "images/button-closed.jpg");
		
	});
	
	/* When it is released change it back, and also
		send a message to the server */
		
	$("#button-img").mouseup(function(){
	
		$(this).attr("src", "images/button-open.jpg");
		ws.send("pulse");
		
	});
	
});