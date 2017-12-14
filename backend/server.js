/*jslint white:true */
var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var validator = require('validator');
var mysql = require("mysql");
var jwt = require('jsonwebtoken');
var Scrypt = require('scrypt-async');

var secret = "secretkey"; // Used for token generation and verification
// TODO store secret in environment variable
var tokenExpiration = 86400;

var server = null;
var pool = null;

// All body of HTTP requests must be encoded in x-www-form-urlencoded


/* ******************************
*********************************
GET / for testing of server
*********************************
Required URL parameters:
Required body parameters:
*********************************
Reponds: Your result
*********************************
********************************* */
app.get('/', function (req, res) {
    res.end("Your result");
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

    // Parse body
    var picture = req.body.picture;
    if (!picture) {
        return res.status(400).send("Body is missing the picture parameter");
    }
    // TODO see how to transport picture
    // TODO check for picture format

    jwt.verify(token, secret, function (error, decoded) {
      if (error) {
        return res.status(401).send("Token is invalid");
      }
      var userID = decoded.userID;
      // Check in database
      // TODO there should be no concurrent connection for this (auto increment problem)
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
                    "SELECT MAX(id) AS lastid FROM bills",
                    [],
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
                              var path = "./bills/web/" + link + "/";
                              fs.stat(path, function (err) {
                                if (err && (err.errno === 34 || err.errno === -4058)) { // path does not exist
                                  fs.mkdir(path, function (error) {
                                    if (error) {
                                      console.warn("The directory", path, "could not be created, error is:", error);
                                      connection.rollback(function (error) {
                                        connection.release();
                                        if (error) {
                                          console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                          return res.status(500).send("Our database is having troubles");
                                        }
                                        console.log("Rolling back database query\n");
                                        res.status(500).send("Our server is having troubles");
                                      });
                                      return;
                                    }
                                    // TODO copy default bill webpage to path
                                    // write the billID somewhere in this so that
                                    // dynamic webpage can use it to fetch information
                                    connection.commit(function (error) {
                                      connection.release();
                                      if (error) {
                                        console.warn("The transaction sequence could not be committed:", error, "\n");
                                        return res.status(500).send("Our database is having troubles");
                                      }
                                      res.status(200).send("Bill created");
                                    });
                                  });
                                } else if (err) {
                                  console.warn("Checking the path", path, "gave the error:", err);
                                  connection.rollback(function (error) {
                                    connection.release();
                                    if (error) {
                                      console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                      return res.status(500).send("Our database is having troubles");
                                    }
                                    console.log("Rolling back database query\n");
                                    res.status(500).send("Our server is having troubles");
                                  });
                                } else { // path already exists - unlikely just redo the whole thing
                                  console.warn("Path", path, "already exists !!");
                                  connection.rollback(function (error) {
                                    connection.release();
                                    if (error) {
                                      console.warn("The transaction sequence could not be rollbacked:", error, "\n");
                                      return res.status(500).send("Our database is having troubles");
                                    }
                                    console.log("Rolling back database query\n");
                                    res.status(500).send("Please try again, sorry about that.");
                                  });
                                }
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
    jwt.verify(token, secret, function (error, decoded) {
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
Reponds: bill object
*********************************
********************************* */
app.get('/bills/:billID', function (req, res) {
    // Check token
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send("Token is missing from x-access-token in headers");
    }

    // Parse body of request
    var billID = req.params.billID;

    // Check for validity of inputs
    if (isNaN(billID)) {
        return res.status(400).send("billID is invalid");
    }

    jwt.verify(token, secret, function (error, decoded) {
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
                  console.warn("The bills table can't be searched:", error, "\n");
                  return res.status(500).send("Our database is having troubles");
                }
                if (result.length === 0) {
                  connection.release();
                  return res.status(204).send();
                }
                var bill = {
                  id: result[0].id,
                  time: dbTimeToTimeObj(result[0].time),
                  address: result[0].address,
                  restaurant: result[0].restaurant,
                  name: result[0].name,
                  tax: result[0].tax,
                  tip: result[0].tip,
                  link: result[0].link,
                  done: result[0].done
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
                                console.log("GET /bills/:billID:", result); // TODO to remove
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
                                        paid: result[i].paid
                                    });
                                }
                                console.log("Detailed bill is:", bill, "\n"); // TODO to remove
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
        return res.status(400).send("Body is missing parameters");
    }

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
        return res.status(400).send("Your email address is invalid");
    }
    email = validator.normalizeEmail(email);
    password = validator.trim(password);
    if (password.length > 100) { // to prevent overload of server with scrypt on long strings
        return res.status(400).send("Your password is too long");
    }

    pool.getConnection(function(error) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT id, digest, salt, token FROM users WHERE email = ? LIMIT 1",
        [email],
        function (error, result) {
          connection.release();
          console.log("GET /users 1:", result); // TODO to remove
          if (error) {
            console.warn("The users table can't be searched:", error, "\n");
            return res.status(500).send("Our database is having troubles");
          }
          if (result.length === 0) { // email does not exist
            return res.status(401).send("Incorrect email or password");
          }
          Scrypt.scrypt(password, result[0].salt, {N:16384, r:8, p:1, dkLen:64, encoding:'base64'}, function (digest) {
            if (digest !== result[0].digest) {
              return res.status(401).send("Incorrect email or password");
            }
            var token = jwt.sign({userID: result[0].id}, secret, {expiresIn: tokenExpiration});
            // deterministic creation so multiple logins possible
            res.status(200).json({userID: result[0].id, token: token});
          });
        }
      );
    });
});

/* ******************************
*********************************
POST /users to sign up (+sign in) and obtain userID and token
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
    email = validator.trim(email);
    username = validator.trim(username);
    password = validator.trim(password);
    if (!validator.isEmail(email)) {
        return res.status(400).send("Your email is invalid");
    }
    email = validator.normalizeEmail(email);
    if (username.length < 4) {
        return res.status(400).send("Username is too short");
    }
    if (username.length > 40) {
        return res.status(400).send("Username is too long");
    }
    if (password.length < 4) {
        return res.status(400).send("Password is too short");
    }
    if (password.length > 100) {
        return res.status(400).send("Password is too long");
    }

    pool.getConnection(function(error) {
      if (error) {
        console.warn("Could not obtain connection from pool\n");
        return res.status(500).send("Our server is having troubles");
      }
      connection.query(
        "SELECT 1 FROM users WHERE email = ?",
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
            "SELECT 1 FROM users WHERE username = ?",
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
              Scrypt.scrypt(password, salt, {N:16384, r:8, p:1, dkLen:64, encoding:'base64'}, function (digest) {
                connection.beginTransaction(function (error) {
                  if (error) {
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
                          var token = jwt.sign({userID: userID}, secret, {expiresIn: tokenExpiration});
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
GET /bills/web/:link to get dynamic webpage of bill
*********************************
Required URL parameters: link
Required body parameters:
*********************************
Reponds: TODO ?
*********************************
********************************* */
app.get('/bills/web/:link', function (req, res) {
    // Parse body of request
    var link = req.params.link; // link acts as the bill's token really
    if (link.length !== 40) {
        return res.status(400).send("Link provided is invalid");
    }
    var path = "./bills/web/" + link;
    fs.stat(path, function (err) {
        if (err) {
            if (err.errno === 34) { // path does not exist
                return res.status(404).send("Link provided does not exist");
            }
            console.warn("Checking the path", path, "gave the error:", err, "\n");
            return res.status(500).send("Our server is having troubles");
        }
        // TODO serve the webpage
    });
});

/*
TODO
- Add user to bill
- Add temp user to bill
- Add user to an item, in items_consumers
- Add temp user to an item, in items_consumers
- Change paid status in items_consumers
- Specific information on one item of bill
*/

function start(port, database) {
    if (!fs.existsSync("./bills")){
        fs.mkdirSync("./bills");
    }
    if (!fs.existsSync("./bills/web")){
        fs.mkdirSync("./bills/web");
    }
    pool = mysql.createPool({
        connectionLimit: 10,
        host: "localhost",
        user: "root",
        password: "password",
        database: database
    });
    server = app.listen(port, function () {
        console.log("Server listening at localhost:%s", port);
    });
}

function stop() {
    server.close();
}

if (require.main === module) {
    if (process.argv.length > 2 && process.argv[2] === "test") {
        secret = "TestSecret";
        start(8001, "billsplittertest");
    } else {
        start(8000, "billsplitter");
    }
}

function randomString(length) {
    var s = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;
    for (i = 0; i < length; i += 1) {
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