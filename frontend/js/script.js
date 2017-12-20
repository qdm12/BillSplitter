var serverHost = "websys3.stern.nyu.edu";
var serverPort = 7001;
var serverURL = "http://" + serverHost + ":" + serverPort;

var currentScreen = "history"; // TODO that depends if user is logged in TODO
var cred = null;
// Alice credentials TODO
cred = {userID: 1, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzM2MTE1Mn0.ADJM99Kok8zmUeaiu0hCZLtIPvSKEBfGg_uaTKx5zpM"};


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
    var http = new XMLHttpRequest();
    http.open("GET", serverURL + "/bills", true);
    http.setRequestHeader('x-access-token', cred.token);
    http.onreadystatechange = function() { // callback function
        if(http.readyState == XMLHttpRequest.DONE) {
            if (http.status !== 200) {
                alert(http.status + ": " + http.responseText);
                return;
            }
            var billIDs = JSON.parse(http.responseText);
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
                                    $(".screen").hide();
                                    currentScreen = "dynamicBill";
                                    $("#dynamicBill").show();
                                    var billID = $("button").closest("div").prop("id");
                                    loadBillDynamic(bill.id);
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
    http.send();
}

function updateDatabase(dropZone, UIDraggable, callback) { // TODO give bill
    var i;
    var users = [], tempUsers = [];
    for(i = 0; i < bill.users.length; i += 1) {
        users.push({id: bill.users[i].id});
    }
    for(i = 0; i < bill.tempUsers.length; i += 1) {
        tempUsers.push({id: bill.tempUsers[i].id});
    }
    var body = {
        bill: {
            name: bill.name,
            done: bill.done,
            users: users,
            tempUsers: tempUsers,
            consumers: bill.consumers
        }
    };
    var http = new XMLHttpRequest();
    http.open("PUT", serverURL + "/bills/" + bill.id, true);
    http.setRequestHeader('x-access-token', cred.token);
    http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    http.onreadystatechange = function() { // callback function
        if(http.readyState == XMLHttpRequest.DONE) {
            if (http.status !== 200) {
                alert(http.status + ": " + http.responseText);
                return;
            }
            console.log("Database updated");
            if (callback) {
                callback(dropZone, UIDraggable);
            }
        }
    }
    http.send(JSON.stringify(body));
}

function loadBillDynamic(billID) {
    var http = new XMLHttpRequest();
    http.open("GET", serverURL + "/bills/" + billID, true);
    http.setRequestHeader('x-access-token', cred.token);
    http.onreadystatechange = function() { // callback function
      if(http.readyState == XMLHttpRequest.DONE) {
        if (http.status !== 200) {
          alert(http.status + ": " + http.responseText);
          return;
        }
        bill = JSON.parse(http.responseText);
        $("#dynamicBill #description #billname").text(bill.name);
        $("#dynamicBill #description #restaurant").text(bill.restaurant);
        $("#dynamicBill #description #address").text(bill.address);
        $("#dynamicBill #description #time").text(timeObjectToHuman(bill.time));
        $("#dynamicBill #description #tip").text("Tip: $" + bill.tip);
        $("#dynamicBill #description #tax").text("Tax: " + bill.tax + "%");
        if (bill.done) {
            $("#dynamicBill #description #billname").css({
                "text-decoration": "line-through",
                color: "red"
            });
            $("#dynamicBill #description").css({
                background: "rgb(255, 170, 170)"
            });
            $("#dynamicBill #description #done").text("This bill will be deleted in 24 hours");
        }

        var usersPerItem = {};
        for (i = 0; i < bill.consumers.length; i += 1) {
            if (!usersPerItem[bill.consumers[i].item_id]) {
                usersPerItem[bill.consumers[i].item_id] = 0;
            }
            usersPerItem[bill.consumers[i].item_id] += 1;
        }

        // Update the item prices including the tax
        for (i = 0; i < bill.items.length; i += 1) {
            bill.items[i].amount *= (1 + bill.tax / 100);
        }

        var userOwn, UIusername;
        $("#dynamicBill #users").find(".user").remove();
        for(i = 0; i < bill.users.length; i += 1) {
            $("#dynamicBill #users").append('<div id="user'+ bill.users[i].id +'" class="user"></div>');
            UIusername = bill.users[i].username;
            if (UIusername.length > 6) {
                UIusername = UIusername.substring(0,6) + "."
            }
            $("#dynamicBill #users #user"+bill.users[i].id).append('<div class="username">' + UIusername + '</div>');
            userOwn = 0;
            for(j = 0; j < bill.consumers.length; j += 1) {
                if (bill.consumers[j].user_id === bill.users[i].id) {
                    for(k = 0; k < bill.items.length; k += 1) {
                        if (bill.items[k].id === bill.consumers[j].item_id) {
                            userOwn += (bill.items[k].amount / usersPerItem[bill.items[k].id]);
                        }
                    }
                }
            }
            userOwn += bill.tip / (bill.users.length + bill.tempUsers.length);
            $("#dynamicBill #users #user"+bill.users[i].id).append('<div class="userown">$' + userOwn.toFixed(2) + '</div>');
        }
        for(i = 0; i < bill.tempUsers.length; i += 1) {
            $("#dynamicBill #users").append('<div id="tempUser'+ bill.tempUsers[i].id +'" class="user" style="background:grey;"></div>');
            UIusername = bill.tempUsers[i].username;
            if (UIusername.length > 6) {
                UIusername = UIusername.substring(0,6) + "."
            }
            $("#dynamicBill #users #tempUser"+bill.tempUsers[i].id).append('<div class="username">' + UIusername + '</div>');
            userOwn = 0;
            for(j = 0; j < bill.consumers.length; j += 1) {
                if (bill.consumers[j].temp_user_id === bill.tempUsers[i].id && !bill.consumers[j].paid) {
                    for(k = 0; k < bill.items.length; k += 1) {
                        if (bill.items[k].id === bill.consumers[j].item_id) {
                            userOwn += (bill.items[k].amount / usersPerItem[bill.items[k].id]);
                        }
                    }
                }
            }
            userOwn += bill.tip / (bill.users.length + bill.tempUsers.length);
            $("#dynamicBill #users #tempUser"+bill.tempUsers[i].id).append('<div class="userown">$' + userOwn.toFixed(2) + '</div>');
        }

        var itemPaid = false;
        $("#dynamicBill #items").find(".item").remove();
        for(i = 0; i < bill.items.length; i += 1) {
            $("#dynamicBill #items").append('<div id="item'+ bill.items[i].id +'" class="item"></div>');
            $("#dynamicBill #items #item"+bill.items[i].id).append('<div class="itemname">' + bill.items[i].name + '</div>');
            $("#dynamicBill #items #item"+bill.items[i].id).append('<div class="itemprice">$' + bill.items[i].amount.toFixed(2) + '</div>');
            itemPaid = true;
            for(j = 0; j < bill.consumers.length; j += 1) {
                if (bill.consumers[j].item_id === bill.items[i].id) {
                    if (!bill.consumers[j].paid) {
                        itemPaid = false;
                    }
                    var copy;
                    if (bill.consumers[j].user_id != null) { // user
                        copy = $("#dynamicBill #users #user"+bill.consumers[j].user_id).clone();
                    } else { // temp user
                        copy = $("#dynamicBill #users #tempUser"+bill.consumers[j].temp_user_id).clone();
                    }
                    copy.children().remove(".userown"); // removes the $ owned
                    $("#dynamicBill #items #item"+bill.items[i].id).append(copy);
                }
            }
            if (itemPaid) {
                $("#dynamicBill #items #item"+bill.items[i].id + " .itemprice").css({
                    color: "yellow",
                    "text-decoration": "line-through",
                });
            }
        }
    
        $("#dynamicBill #users #addUserContainer #submitUser").click(function() {
            var username = $("#dynamicBill #users #addUserContainer #fieldUser").val();
            var http = new XMLHttpRequest();
            http.open("GET", serverURL + "/users/" + username, true);
            http.onreadystatechange = function() { // callback function
                if(http.readyState == XMLHttpRequest.DONE) {
                    if (http.status !== 200) {
                      alert(http.status + ": " + http.responseText);
                      return;
                    }
                    var userID = JSON.parse(http.responseText).id;
    
                    // Update local bill
                    bill.users.push({id:userID, username:username});
    
                    // Update database
                    updateDatabase(function() {
                        // Update UI
                        var i = bill.users.length - 1;
                        $("#dynamicBill #users").append('<div id="user'+ bill.users[i].id +'" class="user"></div>');
                        var UIusername = bill.users[i].username;
                        if (UIusername.length > 6) {
                            UIusername = UIusername.substring(0,6) + "."
                        }
                        $("#dynamicBill #users #user"+bill.users[i].id).append('<div class="username">' + UIusername + '</div>');
                        var userOwn = bill.tip / (bill.users.length + bill.tempUsers.length);
                        $("#dynamicBill #users #user"+bill.users[i].id).append('<div class="userown">$' + userOwn.toFixed(2) + '</div>');
                    });
                }
            }
            http.send();
        });
    
        $("#dynamicBill #users #addNameContainer #submitName").click(function() {
            var name = $("#dynamicBill #users #addNameContainer #fieldName").val();
            var body = {
                name: name,
                link: link
            };
            var http = new XMLHttpRequest();
            http.open("POST", serverURL + "/tempusers", true);
            http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            http.onreadystatechange = function() { // callback function
                if(http.readyState == XMLHttpRequest.DONE) {
                    if (http.status !== 201) {
                      alert(http.status + ": " + http.responseText);
                      return;
                    }
                    var tempUserID = JSON.parse(http.responseText).id;
    
                    // Update local data
                    bill.tempUsers.push({id:tempUserID, username:name});
    
                    // Update database
                    updateDatabase(function () {
                        var i = bill.tempUsers.length - 1;
                        $("#dynamicBill #users").append('<div id="tempUser'+ bill.tempUsers[i].id +'" class="user"></div>');
                        var UIusername = bill.tempUsers[i].username;
                        if (UIusername.length > 6) {
                            UIusername = UIusername.substring(0,6) + "."
                        }
                        $("#dynamicBill #users #user"+bill.tempUsers[i].id).append('<div class="username">' + UIusername + '</div>');
                        var userOwn = bill.tip / (bill.users.length + bill.tempUsers.length);
                        $("#dynamicBill #users #user"+bill.tempUsers[i].id).append('<div class="userown">$' + userOwn.toFixed(2) + '</div>');
                    });
                }
            }
            http.send(JSON.stringify(body));
        });


        $('#dynamicBill #users .user').draggable({
            helper:"clone"
        });
        $('#dynamicBill #items .item').droppable({
            drop: function(event, ui) {
                if ($(this).has("#"+$(ui.draggable).attr('id')).length === 1) {
                    // user is already in there
                    $(this).children("#"+$(ui.draggable).attr('id')).effect("highlight", {}, 500);
                    return;
                }
                var itemID = $(this).attr('id').substring(4);    
                var isUserTemp = $(ui.draggable).attr("id").match("^tempUser");
    
                // Updates the data
                if (isUserTemp) {
                    bill.consumers.push({
                        item_id: $(this).attr("id").substring(4),
                        user_id: null,
                        temp_user_id: $(ui.draggable).attr("id").substring(8),
                        paid: false
                    });
                } else { // registered user
                    bill.consumers.push({
                        item_id: $(this).attr("id").substring(4),
                        user_id: $(ui.draggable).attr("id").substring(4),
                        temp_user_id: null,
                        paid: false
                    });
                }
    
                // Update database
                updateDatabase($(this), $(ui.draggable), function(DropZone, UIDraggable) {
                    // Updates the UI
                    var copy = UIDraggable.clone();
                    copy.children().remove(".userown"); // removes the $ owned
                    DropZone.append(copy);
                    copy.effect("highlight", {}, 500);
                    DropZone.effect("highlight", {}, 1000);
                    var usersPerItem = {};
                    for (i = 0; i < bill.consumers.length; i += 1) {
                        if (!usersPerItem[bill.consumers[i].item_id]) {
                            usersPerItem[bill.consumers[i].item_id] = 0;
                        }
                        usersPerItem[bill.consumers[i].item_id] += 1;
                    }
                    usersPerItem[DropZone.attr("id").substring(4)] += 1;
                    var userOwn, userOwnElement;
                    for(i = 0; i < bill.users.length; i += 1) {
                        userOwn = 0;
                        for(j = 0; j < bill.consumers.length; j += 1) {
                            if (bill.consumers[j].user_id === bill.users[i].id) {
                                for(k = 0; k < bill.items.length; k += 1) {
                                    if (bill.items[k].id === bill.consumers[j].item_id) {
                                        userOwn += (bill.items[k].amount / usersPerItem[bill.items[k].id]);
                                    }
                                }
                            }
                        }
                        userOwn += bill.tip / (bill.users.length + bill.tempUsers.length);
                        userOwnElement = $("#dynamicBill #users #user"+bill.users[i].id + " .userown");
                        if (userOwnElement.text() != "$" + userOwn.toFixed(2)) {
                            userOwnElement.effect("highlight", {}, 500);
                        }
                        userOwnElement.text("$" + userOwn.toFixed(2));
                    }
                    for(i = 0; i < bill.tempUsers.length; i += 1) {
                        userOwn = 0;
                        for(j = 0; j < bill.consumers.length; j += 1) {
                            if (bill.consumers[j].temp_user_id === bill.tempUsers[i].id && !bill.consumers[j].paid) {
                                for(k = 0; k < bill.items.length; k += 1) {
                                    if (bill.items[k].id === bill.consumers[j].item_id) {
                                        userOwn += (bill.items[k].amount / usersPerItem[bill.items[k].id]);
                                    }
                                }
                            }
                        }
                        userOwn += bill.tip / (bill.users.length + bill.tempUsers.length);
                        userOwnElement = $("#dynamicBill #users #tempUser"+bill.tempUsers[i].id + " .userown");
                        if (userOwnElement.text() != "$" + userOwn.toFixed(2)) {
                            userOwnElement.effect("highlight", {}, 500);
                        }
                        userOwnElement.text("$" + userOwn.toFixed(2));
                    }
                });
            }
        });
      }
    }
    http.send();
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