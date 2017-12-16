/*jslint white:true */
module.exports = {
    start: start,
    stop: stop
};

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
var validator = require('validator');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Scrypt = require('scrypt-async');

var parameters = {
    local: {
        databaseHost: "localhost",
        databaseUser: "root",
        databasePassword: "password",
        databaseConnectionLimit: 10,
        databaseName: "billsplitter",
        sqlScript: "local.sql",
        port: 8000,
        secret: "secretkey"
    },
    test: {
        databaseHost: "localhost",
        databaseUser: "root",
        databasePassword: "password",
        databaseConnectionLimit: 10,
        databaseName: "billsplittertest",
        sqlScript: "tests/test.sql",
        port: 8001,
        secret: "TestSecret"
    },
    websys: {
        databaseHost: "localhost",
        databaseUser: "websysF17GB1",
        databasePassword: "websysF17GB1!!",
        databaseConnectionLimit: 10,
        databaseName: "websysF17GB1",
        sqlScript: "websys.sql",
        port: 7001,
        secret: "secretkey"
    }
};

var params = null;
var server = null;
var pool = null;


function start() {
    databaseExists(params.databaseName, function(exists) {
        if (!exists) {
            fs.readFile(__dirname + "/" + params.sqlScript, 'utf8', function (error, data) {
                if (error) {
                    console.error("Reading the SQL script file failed");
                    throw error;      
                }              
                var connection = mysql.createConnection({
                    host: params.databaseHost,
                    user: params.databaseUser,
                    password: params.databasePassword,
                    multipleStatements: true
                });
                connection.connect();
                connection.query(data, function (error) {
                    if (error) {
                        console.error("The SQL script did not execute successfully");
                        throw error;
                    }
                    pool = mysql.createPool({
                        connectionLimit: params.databaseConnectionLimit,
                        host: params.databaseHost,
                        user: params.databaseUser,
                        password: params.databasePassword,
                        database: params.databaseName
                    });
                    console.log("Database created and connection pool configured");
                });
                connection.end();
            });
        } else {
            pool = mysql.createPool({
                connectionLimit: params.databaseConnectionLimit,
                host: params.databaseHost,
                user: params.databaseUser,
                password: params.databasePassword,
                database: params.databaseName
            });
            console.log("Database found and connection pool configured");
        }
    });
    server = app.listen(params.port, function () {
        console.log("Server listening at %s:%s", params.databaseHost, params.port);
    });
}

function stop() {
    server.close();
    pool.end();
}

if (require.main === module) {
    if (process.argv.length > 2) {
        if (process.argv[2] === "test") {
            params = parameters.test;
            start();
        } else if (process.argv[2] === "websys") {
            params = parameters.websys;
            start();
        }
    } else {
        params = parameters.main;
        start();
    }
}

function databaseExists(databaseName, callback) {
    var connection = mysql.createConnection({
        host: params.databaseHost,
        user: params.databaseUser,
        password: params.databasePassword
    });
    connection.connect();
    connection.query(
        "SHOW DATABASES LIKE ?",
        [databaseName],
        function (error, results) {
            if (error) {
                console.error("The database existence check failed:", error);
                callback(false);
            } else if (results.length === 0) {
                callback(false);
            } else {
                callback(true);
            }
        }
    );
    connection.end();
}

/* ******************************
*********************************
GET /ping for testing of server
*********************************
Required URL parameters:
Required body parameters:
*********************************
Reponds: Your result
*********************************
********************************* */
app.get('/ping', function (req, res) {
    res.status(200).send("pong");
});


/* ******************************
*********************************
POST /bills to upload a new bill
*********************************
Required headers parameters: x-access-token
Required URL parameters:
Required body parameters: picture
*********************************
Reponds: Bill created
*********************************
********************************* */
app.post('/bills', function (req, res) {
    // Check token
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send("Token is missing from x-access-token in headers");
    }

    // Parse body of request
    var picture = req.body.picture;
    if (!picture) {
        return res.status(400).send("Body is missing the picture parameter");
    }
    // TODO see how to transport picture
    // TODO check for picture format

    jwt.verify(token, params.secret, function (error, decoded) {
      if (error) {
        return res.status(401).send("Token is invalid");
      }
      var userID = decoded.userID;
      // Check in database
      pool.getConnection(function(error, connection) {
        if (error) {
          console.warn("Could not obtain connection from pool\n");
          return res.status(500).send("Our server is having troubles");
        }
        connection.query(
          "SELECT 1 FROM users WHERE id = ? LIMIT 1",
          [userID],
          function (error, result) {
            if (error) {
              connection.release();
              console.warn("The users table can't be searched:", error, "\n");
              return res.status(500).send("Our database is having troubles");    
            }
            if (result.length === 0) { // user ID does not exist
              connection.release();
              console.log("User ID", userID, "does not exist\n");
              return res.status(401).send("User ID does not exist");
            }
            var dt = new Date();
            var time = dt.toISOString().split('T')[0];
            var tax = 0;
            var address = "", restaurant = "";
            var items = [];
            // START OCR TODO TODO TODO
            // ************************************************
            address = "50 W 4TH ST NEW YORK";
            restaurant = "McDonald's";
            tax = 19.5;
            time = "2017-12-01 00:00:01";
            items = [
                {
                    name: "Cheeseburger",
                    amount: 3.67 // tax not included ?
                },
                {
                    name: "Fries",
                    amount: 1.7
                }
            ];
            // ************************************************
            // END OCR
            var name = restaurant; // TODO can be changed later
            var link = randomString(40); // ~zero chance that it already exists
            connection.beginTransaction(function (error) {
              if (error) {
                connection.release();
                console.warn("The database transaction sequence could not be started:", error, "\n");
                return res.status(500).send("Our server is having troubles");
              }
              connection.query(
                "INSERT INTO bills (address, time, restaurant, name, tax, link) VALUES ?",
                [[[address, time, restaurant, name, tax, link]]], // TODO insert id as it can skip from id 3 to id 5 if rollback occurs
                function (error) {
                  if (error) {
                    console.warn("The new bill could not be created:", error);
                    connection.rollback(function (error) {
                      connection.release();
                      if (error) {
                        console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                      } else {
                        console.log("Rolling back database query\n");
                      }
                    });
                    return res.status(500).send("Our database is having troubles");
                  }
                  connection.query(
                    "SELECT id AS lastid FROM bills WHERE link = ?",
                    [link], // we use link as MAX(id) might fail with concurrent connections
                    function (error, result) {
                      if (error) {
                        console.warn("The bills table could not be searched:", error);
                        connection.rollback(function (error) {
                          connection.release();
                          if (error) {
                            console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                          } else {
                            console.log("Rolling back database query\n");
                          }
                        });
                        return res.status(500).send("Our database is having troubles");
                      }
                      var billID = result[0].lastid;
                      var values = [];
                      items.forEach(function (item) {
                        values.push([billID, item.name, item.amount]);
                      });
                      connection.query(
                        "INSERT INTO items (bill_id, name, amount) VALUES ?",
                        [values],
                        function (error) {
                          if (error) {
                            console.warn("The items could not be created:", error);
                            connection.rollback(function (error) {
                              connection.release();
                              if (error) {
                                console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                              } else {
                                console.log("Rolling back database query\n");
                              }
                            });
                            return res.status(500).send("Our database is having troubles");
                          }
                          connection.query(
                            "INSERT INTO bills_users (bill_id, user_id) VALUES ?",
                            [[[billID, userID]]],
                            function (error) {
                              if (error) {
                                console.warn("The bill - user could not be created:", error);
                                connection.rollback(function (error) {
                                  connection.release();
                                  if (error) {
                                    console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                  } else {
                                    console.log("Rolling back database query\n");
                                  }
                                });
                                return res.status(500).send("Our database is having troubles");
                              }
                              connection.commit(function (error) {
                                connection.release();
                                if (error) {
                                  console.warn("The transaction sequence could not be committed:", error, "\n");
                                  return res.status(500).send("Our database is having troubles");
                                }
                                res.status(201).send("Bill created");
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            });
          }
        );
      });
    });
});


/* ******************************
*********************************
GET /bills to obtain bills IDs where user is involved
*********************************
Required headers parameters: x-access-token
Required URL parameters:
Required body parameters:
*********************************
Reponds: list of bill IDs
*********************************
********************************* */
app.get('/bills', function (req, res) {
    // Check token
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send("Token is missing from x-access-token in headers");
    }
    jwt.verify(token, params.secret, function (error, decoded) {
      if (error) {
        return res.status(401).send("Token is invalid");
      }
      var userID = decoded.userID;
      
      // Check in database
      pool.getConnection(function (error, connection) {
          if (error) {
              console.warn("Could not obtain connection from pool\n");
              return res.status(500).send("Our server is having troubles");
          }
          connection.query(
              "SELECT 1 FROM users WHERE id = ? LIMIT 1",
              [userID],
              function (error, result) {
                  if (error) {
                      connection.release();
                      console.warn("The users table can't be searched:", error, "\n");
                      return res.status(500).send("Our database is having troubles");
                  }
                  if (result.length === 0) { // User ID does not exist
                      connection.release();
                      console.log("User ID", userID, "does not exist\n");
                      return res.status(401).send("User ID does not exist");
                  }
                  connection.query(
                      "SELECT bill_id FROM bills_users WHERE user_id = ?",
                      [userID],
                      function (error, result) {
                          connection.release();
                          if (error) {
                              console.warn("The bills_users table can't be searched:", error, "\n");
                              return res.status(500).send("Our database is having troubles");
                          }
                          if (result.length === 0) {
                              return res.status(204).send(); // no bill yet
                          }
                          var billsIDs = [];
                          var i;
                          for (i = 0; i < result.length; i += 1) {
                            billsIDs.push(result[i].bill_id);
                          }
                          res.status(200).json(billsIDs);
                      }
                  );
              }
          );
      });
    });
});


/* ******************************
*********************************
GET /bills/:billID to obtain details of a bill
*********************************
Required headers parameters: x-access-token
Required URL parameters: billID
Required body parameters:
*********************************
Reponds: bill object in JSON encoding
*********************************
********************************* */
app.get('/bills/:billID', function (req, res) {
    // Check token
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send("Token is missing from x-access-token in headers");
    }

    // Parse URL parameters of request
    var billID = req.params.billID;

    // Check for validity of inputs
    if (isNaN(billID)) {
        return res.status(400).send("billID is invalid");
    }
    if (billID < 1 || billID > 2147483647) {
        return res.status(400).send("billID is invalid");
    }

    jwt.verify(token, params.secret, function (error, decoded) {
      if (error) {
        return res.status(401).send("Token is invalid");
      }
      var userID = decoded.userID;
      
      // Check in database
      pool.getConnection(function(error, connection) {
        if (error) {
          console.warn("Could not obtain connection from pool\n");
          return res.status(500).send("Our server is having troubles");
        }
        connection.query(
          "SELECT 1 FROM users WHERE id = ? LIMIT 1",
          [userID],
          function (error, result) {
            if (error) {
              connection.release();
              console.warn("The users table can't be searched:", error, "\n");
              return res.status(500).send("Our database is having troubles");
            }
            if (result.length === 0) { // User ID does not exist
              connection.release();
              console.log("User ID", userID, "does not exist\n");
              return res.status(401).send("User ID does not exist");
            }
            connection.query( // this also makes sure the user belongs to that bill
              "SELECT bills.* FROM bills, bills_users WHERE bills.id = ? AND bills.id = bills_users.bill_id AND bills_users.user_id = ?",
              [billID, userID],
              function (error, result) {
                if (error) {
                  connection.release();
                  console.warn("The bills / bills_users table can't be searched:", error, "\n");
                  return res.status(500).send("Our database is having troubles");
                }
                if (result.length === 0) {
                  connection.release();
                  return res.status(204).send();
                }
                var bill = {
                  id: result[0].id,
                  link: result[0].link,
                  address: result[0].address,
                  restaurant: result[0].restaurant,
                  name: result[0].name,
                  time: dbTimeToTimeObj(result[0].time),
                  tax: result[0].tax,
                  tip: result[0].tip,
                  done: Boolean(Number(result[0].done))
                };
                connection.query(
                  "SELECT bills_users.user_id, users.username FROM bills_users, users WHERE bills_users.bill_id = ? AND bills_users.user_id = users.id",
                  [billID],
                  function (error, result) {
                    if (error) {
                      connection.release();
                      console.warn("The bills_users / users table can't be searched:", error, "\n");
                      return res.status(500).send("Our database is having troubles");
                    }
                    bill.users = [];
                    var i;
                    for(i = 0; i < result.length; i += 1) {
                        bill.users.push({
                            id: result[i].user_id,
                            username: result[i].username
                        });
                    }
                    connection.query(
                      "SELECT bills_users.temp_user_id, temp_users.name FROM bills_users, temp_users WHERE bills_users.bill_id = ? AND bills_users.temp_user_id = temp_users.id",
                      [billID],
                      function (error, result) {
                        if (error) {
                          connection.release();
                          console.warn("The bills_users / temp_users table can't be searched:", error, "\n");
                          return res.status(500).send("Our database is having troubles");
                        }
                        bill.tempUsers = [];
                        for(i = 0; i < result.length; i += 1) {
                            bill.tempUsers.push({
                                id: result[i].temp_user_id,
                                username: result[i].name
                            });
                        }
                        connection.query(
                          "SELECT id, name, amount FROM items WHERE items.bill_id = ?",
                          [billID],
                          function (error, result) {
                            if (error) {
                              connection.release();
                              console.warn("The items table can't be searched:", error, "\n");
                              return res.status(500).send("Our database is having troubles");
                            }
                            bill.items = [];
                            for(i = 0; i < result.length; i += 1) {
                                bill.items.push({
                                    id: result[i].id,
                                    name: result[i].name,
                                    amount: result[i].amount
                                });
                            }
                            connection.query(
                              "SELECT items_consumers.* FROM items_consumers, items WHERE items.bill_id = ? AND items.id = items_consumers.item_id",
                              [billID],
                              function (error, result) {
                                if (error) {
                                  connection.release();
                                  console.warn("The items_consumers table can't be searched:", error, "\n");
                                  return res.status(500).send("Our database is having troubles");
                                }
                                bill.consumers = [];
                                for(i = 0; i < result.length; i += 1) {
                                    bill.consumers.push({
                                        item_id: result[i].item_id,
                                        user_id: result[i].user_id,
                                        temp_user_id: result[i].temp_user_id,
                                        paid: Boolean(Number(result[i].paid))
                                    });
                                }
                                res.status(200).json(bill);
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
});


/* ******************************
*********************************
POST /login to login and obtain userID and token
*********************************
Required headers parameters:
Required URL parameters:
Required body parameters: email, password
*********************************
Reponds: userID, token
*********************************
********************************* */
app.post('/login', function (req, res) {
    // Parse body of request
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
        return res.status(400).send("Body is missing parameter(s)");
    }

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (typeof email !== "string") {
        return res.status(400).send("Your email address is not a string");
    }
    if (typeof password !== "string") {
        return res.status(400).send("Your password is not a string");
    }
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
        return res.status(400).send("Your email address is invalid");
    }
    email = validator.normalizeEmail(email);
    password = validator.trim(password);
    if (password.length > 100) { // to prevent overload of server with scrypt on long strings
        return res.status(400).send("Your password is too long");
    }

    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT id, digest, salt FROM users WHERE email = ? LIMIT 1",
        [email],
        function (error, result) {
          connection.release();
          if (error) {
            console.warn("The users table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length === 0) { // email does not exist
            return res.status(401).send("Incorrect email or password");
          }
          Scrypt(password, result[0].salt, {N:16384, r:8, p:1, dkLen:32, encoding:'base64'}, function (digest) {
            if (digest !== result[0].digest) {
              return res.status(401).send("Incorrect email or password");
            }
            var token = jwt.sign({userID: result[0].id}, params.secret);
            // deterministic creation so multiple logins possible
            res.status(200).json({userID: result[0].id, token: token});
          });
        }
      );
    });
});

/* ******************************
*********************************
POST /users to sign up (+login)
*********************************
Required URL parameters:
Required body parameters: email, username, password
*********************************
Reponds: userID, token
*********************************
********************************* */
app.post('/users', function (req, res) {
    // Parses body of request
    var email = req.body.email, username = req.body.username, password = req.body.password;
    if (!email || !username || !password) {
        return res.status(400).send("Body is missing parameter(s)");
    }

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (typeof email !== "string") {
        return res.status(400).send("Your email address is not a string");
    }
    if (typeof username !== "string") {
        return res.status(400).send("Your username is not a string");
    }
    if (typeof password !== "string") {
        return res.status(400).send("Your password is not a string");
    }
    email = validator.trim(email);
    username = validator.trim(username);
    password = validator.trim(password);
    if (!validator.isEmail(email)) {
        return res.status(400).send("Your email address is invalid");
    }
    email = validator.normalizeEmail(email);
    if (username.length < 4) {
        return res.status(400).send("Username is too short");
    }
    if (username.length > 40) {
        return res.status(400).send("Username is too long");
    }
    if (password.length < 6) {
        return res.status(400).send("Password is too short");
    }
    if (password.length > 100) {
        return res.status(400).send("Password is too long");
    }

    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT 1 FROM users WHERE email = ? LIMIT 1",
        [email],
        function (error, result) {
          if (error) {
            connection.release();
            console.warn("The users table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length > 0) {
            connection.release();
            return res.status(409).send("Email is already registered");
          }
          connection.query(
            "SELECT 1 FROM users WHERE username = ? LIMIT 1",
            [username],
            function (error, result) {
              if (error) {
                connection.release();
                console.warn("The users table can't be searched:", error, "\n");
                return res.status(500).send("Our database is having troubles");
              }
              if (result.length > 0) {
                connection.release();
                return res.status(409).send("Username is already registered");
              }
              // Create the user
              // TODO Add email verification
              var salt = randomString(8);
              Scrypt(password, salt, {N:16384, r:8, p:1, dkLen:32, encoding:'base64'}, function (digest) {
                connection.beginTransaction(function (error) {
                  if (error) {
                    connection.release();
                    console.warn("The database transaction sequence could not be started:", error, "\n");
                    return res.status(500).send("Our server is having troubles");
                  }
                  connection.query(
                    "INSERT INTO users (email, username, digest, salt) VALUES ?",
                    [[[email, username, digest, salt]]],
                    function (error) {
                      if (error) {
                        console.warn("The user can't be created:", error);
                        connection.rollback(function (error) {
                          connection.release();
                          if (error) {
                            console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                          } else {
                            console.log("Rolling back database query\n");
                          }
                        });
                        return res.status(500).send("Our database is having troubles");
                      }
                      connection.query(
                        "SELECT id FROM users WHERE email = ?",
                        [email],
                        function (error, result) {
                          if (error) {
                            console.warn("The users table can't be searched:", error);
                            connection.rollback(function (error) {
                              connection.release();
                              if (error) {
                                console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                              } else {
                                console.log("Rolling back database query\n");
                              }
                            });
                            return res.status(500).send("Our database is having troubles");
                          }
                          if (result.length !== 1) {
                            console.warn("The database returned", result.length, "users with the email", email);
                            connection.rollback(function (error) {
                              connection.release();
                              if (error) {
                                console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                return res.status(500).send("Our database is having troubles");
                              }
                              console.log("Rolling back database query\n");
                              return res.status(500).send("Our server is having troubles");
                            });
                            return;
                          }
                          var userID = result[0].id;
                          if (isNaN(userID)) {
                            console.warn("The user ID", userID, "is not an integer");
                            connection.rollback(function (error) {
                              connection.release();
                              if (error) {
                                console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                return res.status(500).send("Our database is having troubles");
                              }
                              console.log("Rolling back database query\n");
                              return res.status(500).send("Our server is having troubles");
                            });
                            return;
                          }
                          var token = jwt.sign({userID: userID}, params.secret);
                          connection.commit(function (error) {
                            connection.release();
                            if (error) {
                              console.warn("The transaction sequence could not be committed:", error, "\n");
                              return res.status(500).send("Our database is having troubles");
                            }
                            res.status(201).json({userID: userID, token: token});
                          });
                        }
                      );
                    }
                  );
                });
              });
            }
          );
        }
      );
    });
});

/* ******************************
*********************************
GET /bills/web/:link/details to get the details of the bill
*********************************
Required URL parameters: link
Required body parameters:
*********************************
Reponds: bill object in JSON encoding
*********************************
********************************* */
app.get('/bills/web/:link/details', function (req, res) {
    // Parse URL parameters of request
    var link = req.params.link; // link acts as the bill's token
    if (!link || (link && typeof link !== "string") || (link && typeof link == "string" && link.length !== 40)) {
        return res.status(400).send("Link provided is invalid");
    }
    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT id FROM bills WHERE link = ? LIMIT 1",
        [link],
        function (error, result) {
          connection.release();
          if (error) {
            console.warn("The bills table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length === 0) {
              return res.status(404).send("Link provided does not exist");
          }
          var billID = result[0].id;
          connection.query(
            "SELECT * FROM bills WHERE id = ?",
            [billID],
            function (error, result) {
              if (error) {
                connection.release();
                console.warn("The bills table can't be searched:", error, "\n");
                return res.status(500).send("Our database is having troubles");
              }
              // Bill exists for sure
              var bill = {
                id: result[0].id,
                link: result[0].link,
                address: result[0].address,
                restaurant: result[0].restaurant,
                name: result[0].name,
                time: dbTimeToTimeObj(result[0].time),
                tax: result[0].tax,
                tip: result[0].tip,
                done: Boolean(Number(result[0].done))
              };
              connection.query(
                "SELECT bills_users.user_id, users.username FROM bills_users, users WHERE bills_users.bill_id = ? AND bills_users.user_id = users.id",
                [billID],
                function (error, result) {
                  if (error) {
                    connection.release();
                    console.warn("The bills_users / users table can't be searched:", error, "\n");
                    return res.status(500).send("Our database is having troubles");
                  }
                  bill.users = [];
                  var i;
                  for(i = 0; i < result.length; i += 1) {
                      bill.users.push({
                          id: result[i].user_id,
                          username: result[i].username
                      });
                  }
                  connection.query(
                    "SELECT bills_users.temp_user_id, temp_users.name FROM bills_users, temp_users WHERE bills_users.bill_id = ? AND bills_users.temp_user_id = temp_users.id",
                    [billID],
                    function (error, result) {
                      if (error) {
                        connection.release();
                        console.warn("The bills_users / temp_users table can't be searched:", error, "\n");
                        return res.status(500).send("Our database is having troubles");
                      }
                      bill.tempUsers = [];
                      for(i = 0; i < result.length; i += 1) {
                          bill.tempUsers.push({
                              id: result[i].temp_user_id,
                              username: result[i].name
                          });
                      }
                      connection.query(
                        "SELECT id, name, amount FROM items WHERE items.bill_id = ?",
                        [billID],
                        function (error, result) {
                          if (error) {
                            connection.release();
                            console.warn("The items table can't be searched:", error, "\n");
                            return res.status(500).send("Our database is having troubles");
                          }
                          bill.items = [];
                          for(i = 0; i < result.length; i += 1) {
                              bill.items.push({
                                  id: result[i].id,
                                  name: result[i].name,
                                  amount: result[i].amount
                              });
                          }
                          connection.query(
                            "SELECT items_consumers.* FROM items_consumers, items WHERE items.bill_id = ? AND items.id = items_consumers.item_id",
                            [billID],
                            function (error, result) {
                              if (error) {
                                connection.release();
                                console.warn("The items_consumers table can't be searched:", error, "\n");
                                return res.status(500).send("Our database is having troubles");
                              }
                              bill.consumers = [];
                              for(i = 0; i < result.length; i += 1) {
                                  bill.consumers.push({
                                      item_id: result[i].item_id,
                                      user_id: result[i].user_id,
                                      temp_user_id: result[i].temp_user_id,
                                      paid: Boolean(Number(result[i].paid))
                                  });
                              }
                              res.status(200).json(bill);
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
});


/* ******************************
*********************************
GET /bills/web/:link to get dynamic webpage of bill
*********************************
Required URL parameters: link
Required body parameters:
*********************************
Reponds: HTML file
*********************************
********************************* */
app.get('/bills/web/:link', function (req, res) {
    // Parse URL parameters of request
    var link = req.params.link; // link acts as the bill's token
    if (!link || (link && typeof link !== "string") || (link && typeof link == "string" && link.length !== 40)) {
        return res.status(400).send("Link provided is invalid");
    }
    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT 1 FROM bills WHERE link = ? LIMIT 1",
        [link],
        function (error, result) {
          connection.release();
          if (error) {
            console.warn("The bills table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length === 0) {
            return res.status(404).send("Link provided does not exist");
          }
          res.status(200).sendFile(path.join(__dirname + '/dynamic/Dynamic_webpage_gen4.html'));
        }
      );
    });
});


/* ******************************
*********************************
PUT /bills/web/:link to change the bill
*********************************
Required URL parameters: link
Required body parameters: bill object (name, done, users, tempUsers, consumers)
*********************************
Reponds: Bill updated
*********************************
********************************* */
app.put('/bills/web/:link', function (req, res) {
    // Parse URL parameter of request
    var link = req.params.link; // link acts as the bill's token
    if (!link || (link && typeof link !== "string") || (link && typeof link == "string" && link.length !== 40)) {
        return res.status(400).send("Link provided is invalid");
    }
    var bill = req.body.bill;
    if (!bill) {
        return res.status(400).send("Body is missing the bill parameter");
    }
    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT id FROM bills WHERE link = ? LIMIT 1",
        [link],
        function (error, result) {
          if (error) {
            connection.release();
            console.warn("The bills table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length === 0) {
            connection.release();
            return res.status(404).send("Link provided does not exist");
          }
          if ((typeof bill) !== "object") {
            return res.status(400).send("The bill JSON parameter is malformed or not an object");
          }
          // we add it to the object for clarity
          bill.id = result[0].id;
          bill.link = link;
          if (bill.name === undefined || bill.done === undefined || 
            bill.users === undefined || bill.tempUsers === undefined ||
            bill.consumers === undefined) {
            return res.status(400).send("The bill object provided is missing top level properties");
          }
          if (typeof bill.name !== "string" || bill.name.length > 50) {
            return res.status(400).send("The property name is not a string of less than 51 characters");
          }
          if (typeof bill.done !== "boolean") {
            return res.status(400).send("The property done is not a boolean");
          }
          if (!Array.isArray(bill.users)) {
            return res.status(400).send("The bill object users property is not an array");
          }
          if (!Array.isArray(bill.tempUsers)) {
            return res.status(400).send("The bill object tempUsers property is not an array");
          }
          if (!Array.isArray(bill.consumers)) {
            return res.status(400).send("The bill object consumers property is not an array");
          }
          var i;
          for(i = 0; i < bill.users.length; i += 1) {
            if (bill.users[i].id === undefined) {
                return res.status(400).send("The user object "+i+" is missing its id property");
            }
            if (isNaN(bill.users[i].id)) {
                return res.status(400).send("The user object "+i+" id property is not a number");
            }
            if (bill.users[i].id < 1 || bill.users[i].id > 2147483647) {
                return res.status(400).send("The user object "+i+" id property is not in the correct range");
            }
          }
          for(i = 0; i < bill.tempUsers.length; i += 1) {
            if (bill.tempUsers[i].id === undefined) {
                return res.status(400).send("The tempUser object "+i+" is missing its id property");
            }
            if (isNaN(bill.tempUsers[i].id)) {
                return res.status(400).send("The tempUser object "+i+" id property is not a number");
            }
            if (bill.tempUsers[i].id < 1 || bill.tempUsers[i].id > 2147483647) {
                return res.status(400).send("The tempUser object "+i+" id property is not in the correct range");
            }
          }
          for(i = 0; i < bill.consumers.length; i += 1) {
            if (bill.consumers[i].item_id === undefined) {
                return res.status(400).send("The consumer object "+i+" is missing its item_id property");
            }
            if (isNaN(bill.consumers[i].item_id)) {
                return res.status(400).send("The consumer object "+i+" item_id property is not a number");
            }
            if (bill.consumers[i].item_id < 1 || bill.consumers[i].item_id > 2147483647) {
                return res.status(400).send("The consumer object "+i+" item_id property is not in the correct range");
            }
            if (bill.consumers[i].user_id === undefined) {
                return res.status(400).send("The consumer object "+i+" is missing its user_id property");
            }
            if (bill.consumers[i].user_id && isNaN(bill.consumers[i].user_id)) {
                return res.status(400).send("The consumer object "+i+" user_id property is not null or a number");
            }
            if (bill.consumers[i].user_id && (bill.consumers[i].user_id < 1 || bill.consumers[i].user_id > 2147483647)) {
                return res.status(400).send("The consumer object "+i+" user_id property is not null but not in the correct range");
            }
            if (bill.consumers[i].temp_user_id === undefined) {
                return res.status(400).send("The consumer object "+i+" is missing its temp_user_id property");
            }
            if (bill.consumers[i].temp_user_id && isNaN(bill.consumers[i].temp_user_id)) {
                return res.status(400).send("The consumer object "+i+" temp_user_id property is not null or a number");
            }
            if (bill.consumers[i].temp_user_id && (bill.consumers[i].temp_user_id < 1 || bill.consumers[i].temp_user_id > 2147483647)) {
                return res.status(400).send("The consumer object "+i+" temp_user_id property is not null but not in the correct range");
            }
            if (bill.consumers[i].paid === undefined) {
                return res.status(400).send("The consumer object "+i+" is missing its paid property");
            }
            if ((typeof bill.consumers[i].paid) !== "boolean") {
                return res.status(400).send("The consumer object "+i+" paid property is not a boolean");
            }
          }
          connection.beginTransaction(function (error) {
            if (error) {
              connection.release();
              console.warn("The database transaction sequence could not be started:", error, "\n");
              return res.status(500).send("Our server is having troubles");
            }
            connection.query(
              "UPDATE bills SET name = ?, done = ? WHERE id = ?",
              [bill.name, bill.done, bill.id],
              function (error) {
                if (error) {
                  console.warn("The bills table can't be searched:", error, "\n");
                  connection.rollback(function (error) {
                    connection.release();
                    if (error) {
                      console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                    } else {
                      console.log("Rolling back database query\n");
                    }
                  });
                  return res.status(500).send("Our database is having troubles");
                }
                var values = [];
                for(i = 0; i < bill.users.length; i += 1) {
                  values.push([bill.id, bill.users[i].id, null]);
                }
                for(i = 0; i < bill.tempUsers.length; i += 1) {
                  values.push([bill.id, null, bill.tempUsers[i].id]);
                }
                connection.query( // TODO check that unique works here
                  "INSERT IGNORE INTO bills_users (bill_id, user_id, temp_user_id) VALUES ?",
                  [values],
                  function (error) {
                    if (error) {
                      console.warn("The users can't be inserted in the bills_users table:", error, "\n");
                      connection.rollback(function (error) {
                        connection.release();
                        if (error) {
                          console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                        } else {
                          console.log("Rolling back database query\n");
                        }
                      });
                      return res.status(500).send("Our database is having troubles");
                    }
                    values = [];
                    for(i = 0; i < bill.consumers.length; i += 1) {
                      values.push([
                          bill.consumers[i].item_id,
                          bill.consumers[i].user_id,
                          bill.consumers[i].temp_user_id,
                          bill.consumers[i].paid
                        ]);
                    }
                    connection.query( // TODO check that unique works here
                      "INSERT IGNORE INTO items_consumers (item_id, user_id, temp_user_id, paid) VALUES ?",
                      [values],
                      function (error) {
                        if (error) {
                          console.warn("The consumers data can't be inserted in the items_consumers table:", error, "\n");
                          connection.rollback(function (error) {
                            connection.release();
                            if (error) {
                              console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                            } else {
                              console.log("Rolling back database query\n");
                            }
                          });
                          return res.status(500).send("Our database is having troubles");
                        }
                        connection.commit(function (error) {
                          connection.release();
                          if (error) {
                            console.warn("The transaction sequence could not be committed:", error, "\n");
                            return res.status(500).send("Our database is having troubles");
                          }
                          res.status(200).send("Bill updated");
                        });
                      }
                    );
                  }
                );
              }
            );
          });
        }
      );
    });
});

/*
TODO
- Create temp user
- Test PUT /bills/web/:link to change the bill
- switch to camelcase
- Delete account
- get user ID from username
- Remove people with PUT, enhance the PUT bill
*/

function randomString(length) {
    var s = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;
    for(i = 0; i < length; i += 1) {
        s += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return s;
}

function dbTimeToTimeObj(databaseTimestamp) {
    var dateArray = databaseTimestamp.toString("yyyyMMddHHmmss").replace(/T/, ' ').replace(/\..+/, '').split(" ");
    var clock = dateArray[4].split(":");
    return {
        sec: clock[2],
        min: clock[1],
        hour: clock[0],
        day: dateArray[2],
        month: dateArray[1],
        year: dateArray[3]
    };
}