/* nodeMCU button script 
 * Upon pressing the button, a message is sent to the
 * server indicating that the button has been pressed 
 */
 
 /* We're using jQuery. Wait until document has loaded. */
$(document).ready(function()
{
	/* Width of canvas element */
	var canWidth = 700;
	/* Height of canvas element */
	var canHeight = 700;
	
	function findPos(obj) 
	{
		var curleft = 0, curtop = 0;
		
		if (obj.offsetParent) 
		{
			do 
			{
				
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
				
			} while (obj = obj.offsetParent);
			
			return { x: curleft, y: curtop };
		}
		return undefined;
	}

	
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
			name        : "positionS",
			mode        : "send",
			dataType    : "text"
		}
	};
	
	/* A var to store the user's message */
	var tMessage = "p0,0";
		
	
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
	
	var posSquare = document.getElementById('pos-square');
	var context = posSquare.getContext('2d');
	context.fillStyle = "rgb(50, 50, 50)";
	
	$("#pos-square").mousemove(function(evt)
	{
		var pos = findPos(this);
		var x = evt.pageX - pos.x;
		var y = evt.pageY - pos.y;
		var xAdjusted = Math.floor((x / canWidth) * 1000);
		var yAdjusted = Math.floor((y / canHeight) * 1000);

		tMessage = "p" + xAdjusted + "," + yAdjusted;
		
		var iDat = context.createImageData(canWidth, canHeight);
		
		/* Default colour of image */
		for(var i = 0 ; i < iDat.data.length; i += 4)
		{
			iDat.data[i+0] = 50;
			iDat.data[i+1] = 50;
			iDat.data[i+2] = 50;
			iDat.data[i+3] = 255;
		}
		
		var red = 50;
		var green = 50;
		var blue = 50;
		var alpha = 255;
		var difference = 0;
		
		for(var i = 0; i < canHeight; i ++)
		{
			for(var j = 0; j < canWidth; j ++)
			{

				difference = Math.abs((x - (j))) + Math.abs((y - (i)));
				//console.log(difference);
				if(difference < 5)
				{
					red = 255;
					blue = 0;
					green = 0;
				}
				else
				{
					red = 50;
					green = 50;
					blue = 50;
				}
				var arrPos = (i * canWidth * 4) + (j * 4);
				iDat.data[arrPos] = red;
				iDat.data[arrPos+1] = green;
				iDat.data[arrPos+2] = blue;
				iDat.data[arrPos+3] = alpha;
			}
		}
		
		context.putImageData(iDat, 0, 0);
		
	});
	
	$("#pos-square").click(function()
	{
		ws.send(tMessage);
	});

	
});