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
			name        : "Robot Controls",
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
	
	$("#start").click(function()
	{
		console.log("Sending message");
		tMessage = "s1";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#stop").click(function()
	{
		console.log("Sending message");
		tMessage = "s0";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#l15").click(function()
	{
		console.log("Sending message");
		tMessage = "al15";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#l30").click(function()
	{
		console.log("Sending message");
		tMessage = "al30";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#l90").click(function()
	{
		console.log("Sending message");
		tMessage = "al90";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#l180").click(function()
	{
		console.log("Sending message");
		tMessage = "al180";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#r15").click(function()
	{
		console.log("Sending message");
		tMessage = "ar15";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#r30").click(function()
	{
		console.log("Sending message");
		tMessage = "ar30";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#r90").click(function()
	{
		console.log("Sending message");
		tMessage = "ar90";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
	$("#r180").click(function()
	{
		console.log("Sending message");
		tMessage = "ar180";
		console.log(tMessage);
		ws.send(tMessage);
		
	});
	
});