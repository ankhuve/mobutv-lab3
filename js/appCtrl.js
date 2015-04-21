// Get elements
var input = $("#input");
var buttonSend = $("#buttonSend");
var buttonHistory = $("#buttonHistory");
var output = $("#output");

// Initialize pubnub
var pubnub = PUBNUB.init({
  publish_key   : "pub-c-53bd279e-0efc-4539-ad9a-dba3d7866792",
  subscribe_key : "sub-c-4d90db16-e50a-11e4-8370-0619f8945a4f"
});

pubnub.subscribe({
	'channel'   : 'tasty-chat',
	connect: console.log("Ansluten till chatten."),
	'callback'  : function(message) {
		output.html(output.html() + '<br />' + message);
	}
});

var sendMessageWithPos = function() {
    if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(locationMessage, showError);
        // navigator.geolocation.getCurrentPosition(setPosition, showError);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

var locationMessage = function(position) {
	console.log("Skickar: " + $("#input").val());
	console.log("Från position: lon " + position.coords.longitude + " lat " + position.coords.latitude)
    // send messages
	pubnub.publish({
		'channel' : 'tasty-chat',
		'message' : $("#input").val(),
		'pos'     : position
	});
};


// Get location of device
// var pos = getLocation();






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

var sendMessages = function(){
	console.log("Skickar: " + $("#input").val());
    // send messages
      pubnub.publish({
        'channel' : 'tasty-chat',
        'message' : $("#input").val()
        // 'pos'     : pos
      });
    };

var recieveHistory = function(){
	console.log("Hämtar historik..")
    // check history
	output.html("");
	pubnub.history({
		count : 10,
		channel : 'tasty-chat',
		callback : function (message) {
			output.append(message[0].join("<br />"))
		}
	});
}