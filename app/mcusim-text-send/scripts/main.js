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
	
	$("#submit-message").click(function()
	{
		console.log("Sending message");
		tMessage = $("#text-message").val();
		$("#text-message").val("");
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
});