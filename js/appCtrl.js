// Initialize pubnub
var pubnub = PUBNUB.init({
  publish_key   : "pub-c-53bd279e-0efc-4539-ad9a-dba3d7866792",
  subscribe_key : "sub-c-4d90db16-e50a-11e4-8370-0619f8945a4f"
});

var uuid = pubnub.uuid();
var userCardinalDirection = "";
var messageCount = 0;
var connectedToAChannel = false;


$("#output").html("Ansluter till chatten..");

var subscribeToChannel = function(direction){
	pubnub.subscribe({
		channel   : 'erdick-chat-'+direction,
		connect: function(){
			$("#output").html("");
	    	recieveHistory(direction);
	    },
	    error: function (error) {
	      // Handle error here
	      $("#output").html("Kunde inte ansluta till chatten :(");
	      console.log(JSON.stringify(error));
	    },
		callback  : function(message) {
			subscribeCallback(message);
		}
	});
};

var subscribeCallback = function(message){
    console.log("Fick meddelande: " + JSON.stringify(message));
    connectedToAChannel = true;
	messageCount++;
	if(message.uuid===uuid){ // own message
		$("#output").html($("#output").html() + '<div class="message user"><p class="messageText">' + message.data + '</p>');
	}else{
    	if(messageCount%2===1){ // someone elses message
    		$("#output").html($("#output").html() + '<div class="message"><p class="messageText">' + message.data + '</p>');
    	} else{
    		$("#output").html($("#output").html() + '<div class="message two"><p class="messageText">' + message.data + '</p>');
    	}
    }
	scrollToBottom();
};

var scrollToBottom = function(){
	var objDiv = document.getElementById("output");
	objDiv.scrollTop = objDiv.scrollHeight; // scroll chat to bottom when new message arrives
}

var unsubscribeToChannel = function(channel){
	pubnub.unsubscribe({
		channel: "erdick-chat-"+channel
	})
}

$(function(){
    $("#input").keyup(function(e){
        if (e.keyCode === 13) {
            directionMessage();
        }
    });
});

var recieveHistory = function(channel){
	console.log("Hämtar historik..")
	$("#output").html("<div id='welcomeMessage'>Ansluten till "+channel+"!</div>");
	// check history
	pubnub.history({
		count : 3,
		channel : 'erdick-chat-'+channel,
		reverse: false,
		callback : function (messages) {
			console.log(messages);
			for (message in messages[0]){
				messageCount++;
				if(message.uuid===uuid){ // own message
					$("#output").html($("#output").html() + '<div class="message user"><p class="messageText">' + messages[0][message].data + '</p></div>');
				}else{
					if(messageCount%2===1){ // someone elses message
			    		$("#output").html($("#output").html() + '<div class="message"><p class="messageText">' + messages[0][message].data + '</p></div>');
			    	} else{
			    		$("#output").html($("#output").html() + '<div class="message two"><p class="messageText">' + messages[0][message].data + '</p></div>');
			    	}
			    }
			}
			scrollToBottom();
		}
	});
}

var sendMessageWithPos = function() {
    if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(locationMessage, showError);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

var directionMessage = function(position) {
	if($("#input").val()!=""){
		console.log("Skickar: " + $("#input").val());
		console.log("Tittar åt: "+currentChannel);
	    // send messages
		pubnub.publish({
			channel : 'erdick-chat-'+currentChannel,
			message : {
	        	data: $("#input").val(),
	        	uuid: uuid,
	        	currentChannel: currentChannel
        	},
			callback: function(){
				console.log("Skickade: " + $("#input").val())
				// $("#output").html($("#output").html() + "Skickade: " + $("#input").val() + " till " + currentChannel);
				$("#input").val("");
				scrollToBottom();
			},
	        error: function(e){
	        	console.log("Något gick snett: "+e);
	        }
		});
	};
}

var showError = function(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

var getObjectSize = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

init();

var currentChannel = "N";

var whereAmILooking = function(dir){
	if(!dir){
		console.log("Enheten har inte stöd för kompassen.");
		$("#output").html("<div id='welcomeMessage'>Har inget stöd..</div>");
		subscribeToChannel("N");
	} else{
		console.log(dir);
		if (dir>315 || dir<45){ // Tittar mot norr
			if(!connectedToAChannel){
				subscribeToChannel("N");
			}
			if(currentChannel!="N"){
				$("#output").html($("#output").html() + "<div id='welcomeMessage'>Försöker ansluta till N</div>");
				subscribeToChannel("N");
				unsubscribeToChannel(currentChannel);
				
			}
			currentChannel="N";
			return "N";
		} else if (45<dir && dir<135){ // Tittar mot väst
			if(!connectedToAChannel){
				subscribeToChannel("W");
			}
			if(currentChannel!="W"){
				$("#output").html($("#output").html() + "<div id='welcomeMessage'>Försöker ansluta till W</div>");
				subscribeToChannel("W");
				unsubscribeToChannel(currentChannel);
			}
			currentChannel="W";
			return "W";
		} else if (135<dir && dir<225){ // Tittar mot söder
			if(!connectedToAChannel){
				subscribeToChannel("S");
			}
			if(currentChannel!="S"){
				$("#output").html($("#output").html() + "<div id='welcomeMessage'>Försöker ansluta till S</div>");
				subscribeToChannel("S");
				unsubscribeToChannel(currentChannel);
			}
			currentChannel="S";
			return "S";
		} else if (225<dir && dir<315){ // Tittar mot öst
			if(!connectedToAChannel){
				subscribeToChannel("E");
			}
			if(currentChannel!="E"){
				$("#output").html($("#output").html() + "<div id='welcomeMessage'>Försöker ansluta till E</div>");
				subscribeToChannel("E");
				unsubscribeToChannel(currentChannel);
			}
			currentChannel="E";
			return "E";
		}
	}
}

function init() {
  if (window.DeviceOrientationEvent) {
    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {      
      deviceOrientationHandler(eventData.alpha); // call our orientation event handler
      }, false);
  }
}

function deviceOrientationHandler(alpha) {
  document.getElementById("heading").innerHTML = Math.round(alpha)+currentChannel;
  
  // Apply the transform to the image
  // var logo = document.getElementById("compass");
  // logo.style.webkitTransform = "rotate("+ alpha +"deg)";
  // logo.style.MozTransform = "rotate("+ alpha +"deg)";
  // logo.style.transform = "rotate("+ alpha +"deg)";
  userCardinalDirection = whereAmILooking(alpha);
}