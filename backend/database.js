module.exports = {
    connectToDatabase: connectToDatabase,
    createDatabase: createDatabase,
    cleanDatabase: cleanDatabase,
    createUser: createUser,
};
var mysql = require('mysql');
var connection = null;

function connectToDatabase(dbname, initialize) {
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: dbname
    });
    connection.connect(function(err) {
        if (err) {
            throw new Error("Database not connected");
        } else {
            console.log("Database connected");
            if (initialize) { // execute the corresponding SQL script
                var statement = "source " + dbname + ".sql";
                connection.query(statement, function (err, result) {
                    if (err) {
                        console.warn("The SQL script", dbname+".sql did not work:", err);
                    } else {
                        console.log(result);
                    }
                });
            }
        }
    });
}

function createDatabase(dbname) {
    if (connection != null) {
        connection.end();
    }
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password"
    });
    connection.connect(function(err) {
        if (err) {
            throw new Error("Database not connected");
        } else {
            var statement = "CREATE DATABASE IF NOT EXISTS "+dbname;
            connection.query(statement, function (err, result) {
                if (err) {
                    console.warn("The database ", dbname, " could not be created: ", err);
                } else {
                    console.log("The database ", dbname, " has been created");
                }
                connection.end();
                connectToDatabase(dbname, true);
            });
        }
    });
}

function cleanDatabase(dbname) {
    if (connection != null) {
        connection.end();
    }
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password"
    });
    connection.connect(function(err) {
        if (err) {
            throw new Error("Database not connected");
        } else {
            var statement = "DROP DATABASE IF EXISTS "+dbname;
            connection.query(statement, function (err, result) {
                if (err) {
                    console.warn("The database ", dbname, " could not be dropeed: ", err);
                } else {
                    console.log("The database ", dbname, " has been dropped");
                }
                connection.end();
            });
        }
    });
}

function createUser(email, username, digest, salt, token) {
    var statement = "INSERT INTO users (email, username, digest, salt, token) VALUES ?";
    var values = [email, username, digest, salt, token];
    connection.query(statement, values, function (err, result) {
        if (err) {
            console.warn("The user can't be created: ", err)
        } else {
            console.log(result);
        }
    });
}

// TODO Escape inputs for database

function userIDExists(userID) {}

function getToken(userID) {
    var statement = "";
    connection.query(statement, function (err, result, fields) {

    });
}

function billIDExists(userID, billID) {
    var statement = "SELECT 1 FROM bills WHERE id = "+billID+" LIMIT 1";
    connection.query(statement, function (err, result) {
        if (err) {
            console.warn("The user can't be created: ", err)
        } else {
            console.log(result);
        }
    });
}

function emailExists(email) {}

function usernameExists(username) {}

function getUserID(email) {}

function getSalt(userID) {}

function getDigest(userID) {}

function getToken(userID) {}

