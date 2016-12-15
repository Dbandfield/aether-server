/* This object is used to update the HTML of the page based on messages received
 * from the server. Message parsing is carried out by a separate object.
 * 
 * Dependencies: Jquery 
 *
 */
 
function HtmlUpdater()
{
	/* ---------------------------------------------------------------------- */
	/* PROPERTIES                                                             */
	/* ---------------------------------------------------------------------- */
	
	/* Arrays of objects containing connection information for each sender
	 * and receiver 
	 */
	this.senders   = [];
	this.receivers = [];
	/* A reference to this object so that the event functions can access this */
	var myself = this;
	/* Does the connection details panel have information in it? */
	this.connDetailsActive = false; 
	/* The currently selected connection. A string identical to its name 
	 * property. Empty string if no connection is selected. 
	 */
	this.connDetailsCur = "";
	/* Type of currently selected connection. "sender", "receiver" or "" for none
     * selected	*/
	this.connDetailType = "";
	
	/* Does the connection selection panel have anything in it? */
	this.connSelectionActive = false;
	
	/* An array of sender names for the connection selection panel to use */
	this.selectionArray = [];
	
	/* A function to run when a new connection is setup */
	this.connSetupFunction = function(r, s){};
	
	/* ---------------------------------------------------------------------- */
	/* FUNCTIONS                                                              */
	/* ---------------------------------------------------------------------- */
	
	/* PUBLIC FUNCTIONS */
	
	/* Description : Update the HTML based on new connection info
	 * Arguments   : An array of receivers and an array of senders
	 * Returns     : True if successful, false otherwise
	 */	
	 this.update = function(s, r)
	 {
		this.senders   = s;
		this.receivers = r;
		
		this.updateLists();
		this.setUpPara();
		this.updateConnDetails();
		this.updateConnSelection();
		 
		return true;
	 }
	 
	/* Description : Provide a function to run when a new connection has been
	 *               set up. The function you provide will be passed two 
	 *               arguments. The first is the name of the receiver involved,
	 *               and the second is the name of the sender involved. Please
	 *               provide a function that will take these two strings as 
	 *               arguments.
	 * Arguments   : A function
	 * Returns     : True if successful, false otherwise
	 */	
	 this.onConnSetup = function(fn)
	 {
		 /* Check if it's a function */
		 if(typeof(fn) != "function")
		 {
			 console.error("Argument supplied is not a function");
			 return false;
		 }
		 
		 this.connSetupFunction = fn;
		 return true;
	 }
	 
	 
	 /* PRIVATE FUNCTIONS */
	 
	 /* Description : Append the connections to the lists
	 *  Arguments   : None
	 *  Returns     : True if successful, false otherwise
	 */	
	 this.updateLists = function()
	 {
		/* clear the lists of connections */
		$(".connection-list").empty();
		
		/* loop through senders */
		for(var i in this.senders)
		{
			/* Create the para element which holds the
			 * name of one of the senders in the 
			 * connection list. */
			var append = "<p>" + 
						 this.senders[i].name +
						 "</p><br>";
			/* append to the list */		 
			$(".sender-list .connection-list").append(append);										

		}
		
		for(var i in this.receivers)
		{
			/* Create the para element which holds the
			 * name of one of the senders in the 
			 * connection list. */
			var append = "<p>" + 
						 this.receivers[i].name +
						 "</p><br>";
			/* append to the list */
			$(".receiver-list .connection-list").append(append);
		}
	 }
	 
	 /* Description : Add on click functionality to entries in the connection
	  *               list. When clicked they will display information about 
	  *               that connection in the connection details box.
	  * Arguments   : None
	  * Returns     : True if successful, false otherwise
	  */	
	this.setUpPara = function()
	{
		/* colour change. I should just add this to pure CSS
		 * later*/
		$(".connection-list > p").mouseenter(function()
		{
			$(this).attr("style", "color:#FF0000");
		});
		/* as above */
		$(".connection-list > p").mouseleave(function()
		{
			$(this).attr("style", "color:#000000");
		});
	
		/* What happends when you click the para */
		$(".receiver-list > .connection-list > p").click(function()
		{
			/* this is where the html will go */
			var textToAppend = "";
			
			/* to indetify the correct connection take the 
			 * innerHTML of this paragraph (which has been set 
			 * to the name of the corresponding connection)
			 */		 
			var search = $(this).html();
			
			/* go through receivers and search for match */
			for(var i in myself.receivers)
			{
				/* if match */
				if(myself.receivers[i].name == search)
				{
					var a = [myself.receivers[i].sender];
					
					myself.setConnDetails(search, "receiver", a);
					
					/* For receivers we also need to add a list 
					 * of receivers to choose from 
					 */
					 
					 myself.selectionArray.length = 0;
					 
					 for(var j in myself.senders)
					 {
						myself.selectionArray.push(myself.senders[j].name);
					 }
					 
					 myself.setConnSelection(myself.selectionArray);
					
					return true;
				}
			}
			
			console.error("Name not found");
			return false;
			

		});
		
		$(".sender-list > .connection-list > p").click(function()
		{
			var textToAppend = "";
			
			var search = $(this).html();

			for(var i in myself.senders)
			{
				if(myself.senders[i].name == search)
				{
					myself.setConnDetails(search, "sender", myself.senders[i].receivers);
					
					/* Senders don't choose connections, so clear the selection
					 * panel.
					 */
					 myself.deactivateConnSelection();
					
					return true;
				}
			}
			
			console.error("Name not found");
			
			/* If we are still here, there were no matches. This
			 * SHOULD NOT happen. If so it is a bug */
			return false;
			

		});
	}
	
	/* Description : Add on click functionality to entries in the connection
	 *               selection list. Clicking on one will set that as the new
	 *               sender for the current connection.
	 * Arguments   : None
	 * Returns     : True if successful, false otherwise
	 */	
	this.setUpConnSelButtons = function()
	{
		/* Set the on click functionaility of all buttons in the connection
		 * selection table 
		 */
		$(".connection-selection button").click(function()
		{
			/* Identify the connection that corresponds to the button */
			for(var i in myself.senders)
			{
				/* if found */
				if($(this).attr("id") == myself.senders[i].name)
				{
					/* Call the function provided */
					myself.connSetupFunction(myself.connDetailsCur.toLowerCase(),
												myself.senders[i].name);
					return true;
				}
			}
			
			/* If we are still here something has gone wrong */
			console.error("Sender not found");
			return false;
		});
	}
	/* Description : Set the details of the connection details panel.
	 * Arguments   : Name(string) of device, type(string) of connection and 
	 *               an array of it's connections (strings)
	 * Returns     : True if successful, false otherwise
	 */	
	this.setConnDetails = function(name, type, conns)
	{
		if(typeof(name) != "string" ||
		   typeof(type) != "string" ||
		   !Array.isArray(conns))
		{
			console.error("Wrong types");
			return false;
		}
		
		var textToAppend = "";
		
		type.toLowerCase();
		
		if(type == "receiver")
		{
			/* Clear the details panel */
			$(".connection-details-info").empty();
			/* The html. Name header, plus list of connections */
			textToAppend += "<h3> " + name + "</h3>";
			textToAppend += "<h4>"
			textToAppend += "Receiver"
			textToAppend += "</h4>";
			textToAppend += "<p> ";
			textToAppend +=	(conns.length > 0 ? conns[0] : "No Connections"); 
			textToAppend += " </p>";	
			/* add to the page */
			$(".connection-details-info").append(textToAppend);		
			
			/* indicate that the panel is now active */
			this.connDetailsActive = true;
			this.connDetailsCur = name;
			this.connDetailType = type;
			
			return true;
		}
		else if(type == "sender")
		{
			/* Clear the details panel */
			$(".connection-details-info").empty();
			/* The html. Name header, plus list of connections */
			textToAppend += "<h3 class=\"name\"> " + name + "</h3>";
			textToAppend += "<h4>"
			textToAppend += "Sender"
			textToAppend += "</h4>";
			textToAppend += "<p> ";
			textToAppend +=	(conns.length > 0 ? conns.toString() : "No Connections"); 
			textToAppend += " </p>";	
			/* add to the page */
			$(".connection-details-info").append(textToAppend);	
			
			/* indicate that the panel is now active */
			this.connDetailsActive = true;
			this.connDetailsCur = name;
			this.connDetailType = type;
			return true;			
		}
		else
		{
			console.error("Wrong type specification");
			return false;
		}
	}
	
	/* Description : Set the details of the connection selection panel.
	 * Arguments   : An array of senders (strings)
	 * Returns     : True if successful, false otherwise
	 */		
	this.setConnSelection = function(nArray)
	{
		if(!Array.isArray(nArray))
		{
			console.error("Not an array");
			return false;
		}
		 var textToAppend = ""; 
		 
		 textToAppend += "<h3> Connection Selection </h3>";
		 
		 textToAppend += "<table class=\"connection-selection\">";
		 
		 /* go through each sender */
		 for(var i in nArray)
		 {
			 if(typeof(nArray[i]) == "string")
			 {
				 textToAppend += "<tr>";
				 textToAppend += "<td>";
				 textToAppend += nArray[i];
				 textToAppend += "</td>";
				 textToAppend += "<td>";
				 textToAppend += "<button type=\"button\" id=\"";
				 textToAppend += nArray[i];
				 textToAppend += "\">";
				 textToAppend += "Connect";
				 textToAppend += "</button>";
				 textToAppend += "</td>";
				 textToAppend += "</tr>";			 
			 }
			 else
			 {
				 console.error("Name array contains non string element.");
				 return false;
			 }

		 }
		 
		 textToAppend += "</table>";
		 
		 $(".connection-details-selection").empty();
		 $(".connection-details-selection").append(textToAppend);
		 
		 /* Set up buttons */
		 this.setUpConnSelButtons();
	}
	
	
	/* Description : Update the connection details panel 
	 * Arguments   : None
	 * Returns     : None
	 */
	this.updateConnDetails = function()
	{
		/* Is the panel active? */
		if(this.connDetailsActive)
		{
			/* Find the selected connection */
			for(var i in this.senders)
			{
				if(this.senders[i].name == this.connDetailsCur)
				{
					/* create array of receivers */
					console.log(this.senders[i].receivers);
					/* Update the details */
					this.setConnDetails(this.connDetailsCur, 
										"sender", 
										this.senders[i].receivers);
					/* We're done! */
					return;
				}
			}
			
			/* if not in senders, try receivers */
			for(var i in this.receivers)
			{
				if(this.receivers[i].name == this.connDetailsCur)
				{
					/* convert sender to array */
					var a = [this.receivers[i].sender];
					/* Update the details */
					this.setConnDetails(this.connDetailsCur, 
										"receiver", 
										a);
					/* We're done! */
					return;
				}
			}
			
			/* If we're still here, the connection was not found. Deactivate the 
			 * connection details panel
			 */
			this.deactivateConnDetails();
			return;
			
		}
		
		return;
		
	}
	
	/* Description : Clear the connection details panel
	 * Arguments   : None
	 * Returns     : None
	 */		
	this.deactivateConnDetails = function()
	{
		var textToAppend = "";
		/* Clear the details panel */
		$(".connection-details-info").empty();
		/* The html. Name header, plus list of connections */
		textToAppend += "<h3> No Connection Selected </h3>";
		textToAppend += "<p> Select a connection from the left hand side to "+
		"view its details</p>";	
		/* add to the page */
		$(".connection-details-info").append(textToAppend);	
		
		/* indicate that the panel is now not active */
		this.connDetailsActive = false;
		this.connDetailsCur = "";
		this.connDetailType = "";
	}
	
	/* Description : Updates the connection selection panel.
	 * Arguments   : None
	 * Returns     : None
	 */		
	this.updateConnSelection = function()
	{
		if(this.connDetailsActive && this.connDetailType == "receiver")
		{
			this.selectionArray.length = 0;
			 for(var j in this.senders)
			 {
				this.selectionArray.push(this.senders[j].name);
			 }
			this.setConnSelection(this.selectionArray);
		}
		else
		{
			this.deactivateConnSelection();
		}
	}
	
	/* Description : Clear the connection selection panel
	 * Arguments   : None
	 * Returns     : None
	 */		
	this.deactivateConnSelection = function()
	{
		var textToAppend = "<h2> Connection Selection </h2>";
		
		$(".connection-details-selection").empty();
		$(".connection-details-selection").append(textToAppend);
		
		/* indicate that the panel is now not active */
		this.connSelectionActive = false;
	}
	
}