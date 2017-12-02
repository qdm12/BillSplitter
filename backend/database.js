var mysql = require('mysql');
var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
});
database.connect(function(err) {
    if (err) {
        throw new Error("Database not connected");
    } else {
        console.log("Database connected");
    }
});

// TODO Escape inputs for database

function userIDExists(userID) {}

function getToken(userID) {
    var statement = "";
    database.query(statement, function (err, result, fields) {

    });
}

function billIDExists(userID, billID) {}

function emailExists(email) {}

function usernameExists(username) {}

function getUserID(email) {}

function getSalt(userID) {}

function getDigest(userID) {}

function getToken(userID) {}

function createUser(email, username, digest, salt, token) {}