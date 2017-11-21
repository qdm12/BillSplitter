/* var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	isMobile = true;
}
if(isMobile){
    console.log('Mobile detected');
} else {
    console.log('Desktop detected.');
} */

var currentScreen = "bill"; // that depends if user is logged in

function hideAllScreens() {
    $("#identification").hide();
    $("#bill").hide();
    $("#history").hide();
    $("#profile").hide();
    $("#settings").hide();
}

function setNavigationBarClick() {
    $("#billButton").click(function(){
        if (currentScreen != "bill") {
            currentScreen = "bill";
            hideAllScreens();
            $("#bill").show();
        }
    });
    $("#historyButton").click(function(){
        if (currentScreen != "history") {
            currentScreen = "history";
            hideAllScreens();
            $("#history").show();
        }
    });
    $("#profileButton").click(function(){
        if (currentScreen != "profile") {
            currentScreen = "profile";
            hideAllScreens();
            $("#profile").show();
        }
    });
    $("#settingsButton").click(function(){
        if (currentScreen != "settings") {
            currentScreen = "settings";
            hideAllScreens();
            $("#settings").show();
        }
    });
    console.log("Current screen is now", currentScreen);
}

$(document).ready(function() { // Executes first
    console.log('document is ready');
    hideAllScreens();
    $('#' + currentScreen).show();
});

window.onload = function(){ // Executes secondly
    console.log('window is loaded');
    setNavigationBarClick();
};

$(window).resize(function() {
	console.log('window was resized');
});