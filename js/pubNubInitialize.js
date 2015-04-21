// Initialize pubnub
var pubnub = PUBNUB.init({
  publish_key   : "pub-c-53bd279e-0efc-4539-ad9a-dba3d7866792",
  subscribe_key : "sub-c-4d90db16-e50a-11e4-8370-0619f8945a4f"
});

var loading = true;
$("#output").html("Ansluter till chatten..");

pubnub.subscribe({
	'channel'   : 'tasty-chat',
	connect: function(){
        $("#output").html("Ansluten!<br/>----------------------");
        loading = false;
    },
    error: function (error) {
      // Handle error here
      $("#output").html("Kunde inte ansluta till chatten :(");
      console.log(JSON.stringify(error));
    },
	callback  : function(message) {
		$("#output").html($("#output").html() + '<br />' + message);
        console.log("Fick meddelande: " + JSON.stringify(message));
    }
});

$(function(){
    $("#input").keyup(function(e){
        if (e.keyCode === 13) {
            sendMessageWithPos();
        }
    });
});

var welcomeOnConnect = function() {
    $("#output").html($("#output").html() + "Ansluten till chatten..");
};

var sendMessages = function(){
	if($("#input").val()!=""){
	    console.log("Skickar: " + $("#input").val());
	    // send messages
	    pubnub.publish({
	        channel : 'tasty-chat',
	        message : $("#input").val(),
	        callback: function(){
	            console.log("Skickade: " + $("#input").val())
	            $("#input").val("");
			},
	        error: function(e){
	        	console.log("Något gick snett: "+e);
	        }
	        // 'pos'     : pos
	    });
	}
};

var recieveHistory = function(){
	console.log("Hämtar historik..")
    // check history
	$("#output").html("");
	pubnub.history({
		count : 10,
		channel : 'tasty-chat',
		callback : function (message) {
			$("#output").append(message[0].join("<br />"))
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

var locationMessage = function(position) {
	if($("#input").val()!=""){
		console.log("Skickar: " + $("#input").val());
		console.log("Från position: lon " + position.coords.longitude + " lat " + position.coords.latitude)
	    // send messages
		pubnub.publish({
			channel : 'tasty-chat',
			message : $("#input").val()+" från "+position.coords.longitude+" "+position.coords.latitude,
			// pos     : position,
			callback: function(){
				console.log("Skickade: " + $("#input").val())
				$("#input").val("");
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