var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	isMobile = true;
}

function hideScreen(id) {
	$("#" + id).removeClass("screen")
	$("#" + id).addClass("hidden")
}

function showScreen(id) {
	$("#" + id).removeClass("hidden")
	$("#" + id).addClass("screen")
}

$(document).ready( function() { /* executes first */
	console.log('document is ready');
	//showScreen("bill");
	//hideScreen("bill");
    if(isMobile){
        console.log('Mobile detected');
    } else {
		console.log('Desktop detected.');
	}
});

window.onload = function(){ /* executes secondly */
	console.log('window is loaded');
};

$(window).resize(function() {
	console.log('window was resized');
});