$("#output").html("Ansluter...");

// Initialize pubnub
var pubnub = PUBNUB.init({
  publish_key   : "pub-c-53bd279e-0efc-4539-ad9a-dba3d7866792",
  subscribe_key : "sub-c-4d90db16-e50a-11e4-8370-0619f8945a4f"
});

var uuid = pubnub.uuid();
var messageCount = 0;
var connectedToAChannel = false;
var currentChannel;

var subscribeToChannel = function(channel){
	pubnub.subscribe({
		channel : channel,
		connect: function(){
			$("#output").html("");
	    	recieveHistory(channel);
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
		channel: channel
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
		channel : channel,
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
			channel : currentChannel,
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

function toFixed( number, precision ) {
    var multiplier = Math.pow( 10, precision );
    return Math.round( number * multiplier ) / multiplier;
}

function geohash( coord, resolution ) { 
	var rez = Math.pow( 10, resolution || 0 ); 
	return toFixed(((coord * rez) / rez), 4);
};

function onSuccess(position) {
	var zoom = 4;
	var channel = geohash( position.coords.latitude, zoom ) + '' + geohash( position.coords.longitude, zoom );
	subscribeToChannel(channel);
	if(currentChannel === undefined){
		currentChannel = channel;
		subscribeToChannel(channel);
	} else if(currentChannel != channel){
		unsubscribeToChannel(currentChannel);
		subscribeToChannel(channel);
		currentChannel = channel;
	}
	// $("#debug").html($("#debug").html()+"Channel: "+channel+"<br/>");
	// $("#debug").html($("#debug").html()+"Latitude: "+position.coords.latitude+" <br/>Longitude: "+position.coords.longitude+"<br/>");
}

function onError(error) {
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 10000, enableHighAccuracy: true });