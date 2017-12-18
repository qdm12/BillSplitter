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

function configureNavigationBar() {
    console.log("Current screen is now", currentScreen);
    $("#billButton").click(function(){
        if (currentScreen != "bill") {
            currentScreen = "bill";
            $(".screen").hide();
            $("#bill").show();
        }
    });
    $("#historyButton").click(function(){
        if (currentScreen != "history") {
            currentScreen = "history";
            $(".screen").hide();
            $("#history").show();
        }
    });
    $("#profileButton").click(function(){
        if (currentScreen != "profile") {
            currentScreen = "profile";
            $(".screen").hide();
            $("#profile").show();
        }
    });
    $("#settingsButton").click(function(){
        if (currentScreen != "settings") {
            currentScreen = "settings";
            $(".screen").hide();
            $("#settings").show();
        }
    });
}

function identificationError(highlightIds, resetIds, error) {
    var i;
    for (i = 0; i < highlightIds.length; i++) {
        $(highlightIds[i]).addClass("error");
        setTimeout(function () {
            $(highlightIds[i]).removeClass("error");
        }, 2000);
    }
    for (i = 0; i < resetIds.length; i++) {
        $(resetIds[i]).val("");
    }
    $("#identificationError").html(error);
    $("#identificationError").show({duration:200, easing:"swing"});

    setTimeout(function () {
        $("#identificationError").hide({duration:500, easing:"swing"});
    }, 4000);
}

function configureIdentificationScreen() {
    $(navigationBar).hide();
    $("#identificationError").hide();
    // defaults to signup
    $("#login").hide();
    $("#signupTab").css({
        background: "rgba(0, 255, 200, 0.4)",
    });

    // binds tabs
    $("#signupTab").click(function() {
        $("#signupTab").css({
            background: "rgba(0, 255, 200, 0.4)",
        });
        $("#loginTab").css({
            background: "rgba(0, 153, 255, 0.315)",
        });
        $("#identificationError").hide();
        $("#login").hide({duration:500, easing:"swing"});
        $("#signup").show({duration:500, easing:"swing"});
    });
    $("#loginTab").click(function() {
        $("#loginTab").css({
            background: "rgba(0, 255, 200, 0.4)",
        });
        $("#signupTab").css({
            background: "rgba(0, 153, 255, 0.315)",
        });
        $("#identificationError").hide();
        $("#signup").hide({duration:500, easing:"swing"});
        $("#login").show({duration:500, easing:"swing"});
    });

    // Signup procedure
    $("#signupSubmit").click(function(){
        $("#identificationError").hide({duration:250, easing:"swing"});
        var EMAIL = $("#signupEmail").val(),
        USER = $("#signupUsername").val(),
        PASS1 = $("#signupPassword1").val(),
        PASS2 = $("#signupPassword2").val();
        if (!validator.isEmail(EMAIL)) {
            identificationError(["#signupEmail"], [], "Email entered is invalid");
            return;
        }
        if (USER.length < 4) {
            identificationError(["#signupUsername"], [], "Username has to be longer than 3 characters");
            return;
        } else if (USER.length > 40) {
            identificationError(["#signupUsername"], [], "Username has to be shorter than 40 characters");
            return;
        } else if (!validator.isAscii(USER)) {
            identificationError(["#signupUsername"], [], "Username can't contain such special character(s)");
            return;
        }
        if (PASS1.length < 5) {
            identificationError(
                ["#signupPassword1", "#signupPassword2"],
                ["#signupPassword1", "#signupPassword2"],
                "Password has to be longer than 4 characters"
            );

            return;
        } else if (PASS2.length > 100) {
            identificationError(
                ["#signupPassword1", "#signupPassword2"],
                ["#signupPassword1", "#signupPassword2"],
                "Password has to be shorter than 100 characters"
            );
            return;
        } else if (PASS1 != PASS2) {
            identificationError(
                ["#signupPassword1", "#signupPassword2"],
                ["#signupPassword1", "#signupPassword2"],
                "Passwords do not match"
            );
            return;
        }
        $.post(
            "http://localhost:8000/users",
            {
                email: EMAIL,
                username: USER,
                password: PASS1,
            },
            function(data, status) {
                if (status == 400) {
                    identificationError(
                        ["#signupEmail", "#signupUsername", "#signupPassword1", "#signupPassword2"],
                        [],
                        data
                    );
                } else if (status == 409) {
                    if (data.toLowerCase().indexOf("email") != -1) {
                        identificationError(["#signupEmail"], [], data);
                    } else if (data.toLowerCase().indexOf("username") != -1) {
                        identificationError(["#signupUsername"], [], data);
                    } else if (data.toLowerCase().indexOf("password") != -1) {
                        identificationError(["#signupPassword1", "#signupPassword2"], [], data);
                    }
                } else if (status == 201) {
                    var token = data;
                } else {
                    console.log("Unknown status code:", status);
                }
            }
        );
    });

    // Login procedure
    $("#loginSubmit").click(function(){
        var EMAIL = $("#loginEmail").value,
        PASS = $("#loginPassword").value;
        EMAIL = validator.trim(EMAIL);
        PASS = validator.trim(PASS);
        if (!validator.isEmail(EMAIL)) {
            identificationError(["#loginEmail"], [], "Email entered is invalid");
            return;
        }
        if (PASS.length > 100) {
            identificationError(
                ["#loginPassword"],
                ["#loginPassword"],
                "Password has to be shorter than 100 characters"
            );
            return;
        }
        $.post(
            "http://localhost:8000/users/" + EMAIL,
            {
                password: PASS,
            },
            function(data, status) {
                if (status == 400) {
                    identificationError(
                        ["#loginEmail", "#loginPassword"],
                        [],
                        data
                    );
                } else if (status == 401) {
                    identificationError(
                        ["#loginEmail", "#loginPassword"],
                        ["#loginPassword"],
                        data
                    );
                } else if (status == 200) {
                    var token = data;
                } else {
                    console.log("Unknown status code:", status);
                }
            }
        );
    });
}

$(document).ready(function() { // Executes secondly
    console.log('document is ready');
});

window.onload = function(){ // Executes first
    console.log('window is loaded');
    configureNavigationBar();
    $(".screen").hide();
    $('#' + currentScreen).show();
    if (currentScreen == "identification") {
        configureIdentificationScreen();
    }
};

$(window).resize(function() {
	console.log('window was resized');
});