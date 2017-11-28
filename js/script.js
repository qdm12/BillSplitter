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
    $("#bill2").hide();
    $("#history").hide();
    $("#profile").hide();
    $("#settings").hide();
}

function setNavigationBarClick() {
    $("#billButton").click(function(){
        if (currentScreen != "bill") {
            currentScreen = "bill";
            hideAllScreens();
            $("#bill").show({duration:500, easing:"swing"});
        }
    });
    $("#historyButton").click(function(){
        if (currentScreen != "history") {
            currentScreen = "history";
            hideAllScreens();
            $("#history").show({duration:500, easing:"swing"});
        }
    });
    $("#profileButton").click(function(){
        if (currentScreen != "profile") {
            currentScreen = "profile";
            hideAllScreens();
            $("#profile").show({duration:500, easing:"swing"});
        }
    });
    $("#settingsButton").click(function(){
        if (currentScreen != "settings") {
            currentScreen = "settings";
            hideAllScreens({duration:500, easing:"swing"});
            $("#settings").show({duration:500, easing:"swing"});
        }
    });
    console.log("Current screen is now", currentScreen);
}

function bindIdentificationButtons() {
    $("#signupTab").click(function() {
        $("#signupTab").css({
            background: "rgba(0, 255, 200, 0.4)",
        });
        $("#loginTab").css({
            background: "rgba(0, 153, 255, 0.315)",
        });
        $("#login").hide();
        $("#signup").show({duration:500, easing:"swing"});
    });
    $("#loginTab").click(function() {
        $("#loginTab").css({
            background: "rgba(0, 255, 200, 0.4)",
        });
        $("#signupTab").css({
            background: "rgba(0, 153, 255, 0.315)",
        });
        $("#signup").hide({duration:500, easing:"swing"});
        $("#login").show({duration:500, easing:"swing"});
    });
    $("#signupSubmit").click(function(){
        var EMAIL = $("#signupEmail").value,
        USER = $("#signupUsername").value,
        PASS1 = $("#signupPassword1").value,
        PASS2 = $("#signupPassword2").value;
        // TODO check inputs
        PASS1 = "test"

        $.post(
            "http://localhost:8000/users",
            {
                email: EMAIL,
                username: USER,
                password: PASS1,
            },
            function(data, status) {
                console.log('Done');
                alert("Data: " + data + "\nStatus: " + status);
            }
        );
    });
}

function identificationScreen() {
    $(navigation_bar).hide();
    // defaults to signup
    $("#login").hide();
    $("#signupTab").css({
        background: "rgba(0, 255, 200, 0.4)",
    });
    bindIdentificationButtons();
}

$(document).ready(function() { // Executes first
    console.log('document is ready');
    hideAllScreens();
    $('#' + currentScreen).show({duration:500, easing:"swing"});
});

window.onload = function(){ // Executes secondly
    console.log('window is loaded');
    setNavigationBarClick();
    if (currentScreen == "identification") {
        identificationScreen();
    }
};

$(window).resize(function() {
	console.log('window was resized');
});