var serverHost = "websys3.stern.nyu.edu";
var serverPort = 7001;
var serverURL = "http://" + serverHost + ":" + serverPort;

var currentScreen = "history"; // that depends if user is logged in
var cred = null;
// Alice credentials
cred = {userID: 1, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzM2MTE1Mn0.ADJM99Kok8zmUeaiu0hCZLtIPvSKEBfGg_uaTKx5zpM"}; // TODO to remove

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
        populateHistory();
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
        var body = {email: EMAIL, password: PASS1, username: USER};
        var http = new XMLHttpRequest();
        http.open("POST", serverURL + "/users", true);
        http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        http.onreadystatechange = function() { // callback function
            if(http.readyState == XMLHttpRequest.DONE) {
                if (http.status == 400) {
                    identificationError(
                        ["#signupEmail", "#signupUsername", "#signupPassword1", "#signupPassword2"],
                        [],
                        http.responseText
                    );
                } else if (http.status == 409) {
                    if (http.responseText.toLowerCase().indexOf("email") != -1) {
                        identificationError(["#signupEmail"], [], http.responseText);
                    } else if (http.responseText.toLowerCase().indexOf("username") != -1) {
                        identificationError(["#signupUsername"], [], http.responseText);
                    } else if (http.responseText.toLowerCase().indexOf("password") != -1) {
                        identificationError(["#signupPassword1", "#signupPassword2"], [], http.responseText);
                    }
                } else if (http.status == 201) {
                    cred = JSON.parse(http.responseText);
                    currentScreen = "bill";
                    $(".screen").hide();
                    $('#' + currentScreen).show();
                    $(navigationBar).show();
                } else {
                    console.log("Unknown status code:", http.status);
                }
            }
        };
        http.send(JSON.stringify(body));
    });

    // Login procedure
    $("#loginSubmit").click(function(){
        var EMAIL = $("#loginEmail").val(),
        PASS = $("#loginPassword").val();
        console.log("EMAIL:", EMAIL);
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
        var body = {email: EMAIL, password: PASS};
        var http = new XMLHttpRequest();
        http.open("POST", serverURL + "/login", true);
        http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        http.onreadystatechange = function() { // callback function
            if(http.readyState == XMLHttpRequest.DONE) {
                if (http.status == 400) {
                    identificationError(
                        ["#loginEmail", "#loginPassword"],
                        [],
                        http.responseText
                    );
                } else if (http.status == 401) {
                    identificationError(
                        ["#loginEmail", "#loginPassword"],
                        ["#loginPassword"],
                        http.responseText
                    );
                } else if (http.status == 200) {
                    cred = JSON.parse(http.responseText);
                    currentScreen = "bill";
                    $(".screen").hide();
                    $('#' + currentScreen).show();
                    $(navigationBar).show();
                } else {
                    console.log("Unknown status code:", http.status);
                }
            }
        };
        http.send(JSON.stringify(body));
    });
}
function timeObjectToHuman(obj) {
    return obj.day+" "+obj.month+" "+obj.year+" at "+obj.hour+":"+obj.min;
}

function populateHistory() {
    var httpBillsIDs = new XMLHttpRequest();
    httpBillsIDs.open("GET", serverURL + "/bills", true);
    httpBillsIDs.setRequestHeader('x-access-token', cred.token);
    httpBillsIDs.onreadystatechange = function() { // callback function
        if(httpBillsIDs.readyState == XMLHttpRequest.DONE) {
            if (httpBillsIDs.status !== 200) {
                alert(httpBillsIDs.status + ": " + httpBillsIDs.responseText);
                return;
            }
            var billIDs = JSON.parse(httpBillsIDs.responseText);
            for(var i = 0; i < billIDs.length; i += 1) {
                var httpBill = new XMLHttpRequest();
                httpBill.open("GET", serverURL + "/bills/" + billIDs[i], true);
                httpBill.setRequestHeader('x-access-token', cred.token);
                httpBill.onreadystatechange = (function(http) { // callback function
                    return function() {
                        if(http.readyState == XMLHttpRequest.DONE) {
                            if (http.status !== 200) {
                                alert(http.status + ": " + http.responseText);
                                return;
                            }
                            var bill = JSON.parse(http.responseText);
                            console.log(bill);
                            var total = 0;
                            var j;
                            for (j = 0; j < bill.items.length; j += 1) {
                                total += bill.items[j].amount;
                            }
                            total *= (1 + bill.tax / 100);
                            total += bill.tip;
                            var participants = "";
                            for (j = 0; j < bill.users.length; j += 1) {
                                participants += bill.users[j].username + ", ";
                            }
                            for (j = 0; j < bill.tempUsers.length; j += 1) {
                                participants += bill.tempUsers[j].username + ", ";
                            }
                            participants = participants.substring(0, participants.length - 2);

                            // Update UI
                            if ($("#history #billOverview"+bill.id).length === 0) { // new bill
                                $("#history").append('<div id="billOverview'+bill.id +'" class="billOverview"></div>');
                                $("#history #billOverview"+bill.id).append('<div class="billOverviewDetails"></div>');
                                $("#history #billOverview"+bill.id).append('<div class="billOverviewShare">Share link</div>');
                                $("#history #billOverview"+bill.id+" .billOverviewDetails").click(function() {
                                    alert("to do");
                                });
                                $("#history #billOverview"+bill.id+" .billOverviewShare").click(function() {
                                    window.prompt("Link to share:", serverURL + "/bills/web/" + bill.link);
                                });
                            }
                            $("#history #billOverview"+bill.id+" .billOverviewDetails").html(
                                '<b>Bill name:</b> ' + bill.name + '<br><b>Restaurant:</b> ' + bill.restaurant +
                                '<br><b>Address:</b> ' + bill.address + '<br><b>Date:</b> ' + timeObjectToHuman(bill.time) +
                                '<br><b>Total:</b> $' + total.toFixed(2) + '<br><b>Participants:</b> ' + participants
                            );
                        }
                    };
                })(httpBill);
                httpBill.send();
            }
        }
    };
    httpBillsIDs.send();
}

$(document).ready(function() { // Executes secondly
    console.log('document is ready');
});

window.onload = function(){ // Executes first
    console.log('window is loaded');
    configureNavigationBar();
    $(".screen").hide();
    $('#' + currentScreen).show();
    if (currentScreen === "identification") {
        configureIdentificationScreen();
    } else if (currentScreen === "history") {
        populateHistory();
    }
};

$(window).resize(function() {
	console.log('window was resized');
});