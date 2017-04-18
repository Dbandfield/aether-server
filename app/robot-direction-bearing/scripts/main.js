/* nodeMCU button script 
 * Upon pressing the button, a message is sent to the
 * server indicating that the button has been pressed 
 */
 
 /* We're using jQuery. Wait until document has loaded. */
$(document).ready(function()
{
	
	/* Our server */
	//var url = 'ws://connectivity-92668.onmodulus.net/';
	//var localUrl = 'ws://localhost:3000';
	/* Create a websocket */
	var ws = new WebSocket(url);
	/* Create an object to store client details */
	var clientConfig = 
	
	{	
		messageType     : "config",
		messageContent  : 
		{
			device      : "nodeMCU",
			name        : "textS",
			mode        : "send",
			dataType    : "text"
		}
	};
	
	/* A var to store the user's message */
	var tMessage = "";
		
	
	/* When connection is established */
	ws.onopen = function()
	{
	
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
	
	$("#forward").click(function()
	{
		console.log("Sending message");
		tMessage = "p30,0";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#back").click(function()
	{
		console.log("Sending message");
		tMessage = "p30,180";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#left").click(function()
	{
		console.log("Sending message");
		tMessage = "p30,270";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#right").click(function()
	{
		console.log("Sending message");
		tMessage = "p30,90";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
});