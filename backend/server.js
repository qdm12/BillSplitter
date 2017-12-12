var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var validator = require('validator');
var mysql = require("mysql");

var crypto = require('./crypto.js');

var server = null;
var pool = null;

// All body of HTTP requests must be encoded in x-www-form-urlencoded

app.get('/', function (req, res) {
    res.end("Your result");
});

// Upload picture of bill
app.post('/bills', function (req, res) {
    // Parse body of request
    if (!req.body.hasOwnProperty("userID") || !req.body.hasOwnProperty("token") || !req.body.hasOwnProperty("picture")) {
        res.status(400).send("Body is missing parameters");
        return;
    }
    var userID = req.body.userID;
    var token = req.body.token;
    var picture = req.body.picture; // TODO see how to transport picture

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!Number.isInteger(userID)) {
        console.log("Invalid user ID:", userID);
        res.status(400).send("User id is invalid");
        return;
    }
    if (token.length !== 40) {
        console.log("Token is not of length 40:", token);
        res.status(401).send("User ID and token combination is invalid");
        return;
    }
    // TODO check for picture format

    // Check in database
    // TODO there should be no concurrent connection for this (auto increment problem)
    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool");
        res.status(500).send("Our server is having troubles");
        return;
      }
      connection.query(
        "SELECT id, token FROM users WHERE id = ? AND token = ? LIMIT 1",
        [userID, token],
        function (error, result) {
          console.log("POST /bills DB 1:", result); // TODO to remove
          if (error) {
            connection.release();
            console.warn("The users table can't be searched:", error);
            res.status(500).send("Our database is having troubles");
            return;    
          }
          if (result.length === 0) { // Wrong userID or token
            connection.release();
            console.log("User ID", userID, "with token", token, "does not exit");
            res.status(401).send("User ID and token combination is invalid");
            return;
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
          var link = crypto.randomString(40); // ~zero chance that it already exists
          connection.beginTransaction(function (error) {
            if (error) {
              console.warn("The database transaction sequence could not be started:", error);
              connection.rollback(function (error) {
                connection.release();
                if (error) {
                  console.warn("The transaction sequence could not be rollbacked:", error);
                  res.status(500).send("Our database is having troubles");
                  return;
                }
                console.log("Rolling back database query");
                res.status(500).send("Our server is having troubles");
              });
              return;
            }
            connection.query(
              "INSERT INTO bills (address, time, restaurant, name, tax, link) VALUES ?",
              [[[address, time, restaurant, name, tax, link]]], // TODO insert id as it can skip from id 3 to id 5 if rollback occurs
              function (error) {
                console.warn("The new bill could not be created:", error);
                if (error) {
                  connection.rollback(function (error) {
                    connection.release();
                    if (error) {
                      console.warn("The transaction sequence could not be rollbacked:", error);
                      res.status(500).send("Our database is having troubles");
                      return;
                    }
                    console.log("Rolling back database query");
                    res.status(500).send("Our database is having troubles");
                  });
                  return;
                }
                connection.query(
                  "SELECT MAX(id) AS lastid FROM bills",
                  [],
                  function (error, result) {
                    console.log("POST /bills DB 2:", result); // TODO to remove
                    if (error) {
                      console.warn("The bills table could not be searched:", error);
                      connection.rollback(function (error) {
                        connection.release();
                        if (error) {
                          console.warn("The transaction sequence could not be rollbacked:", error);
                          res.status(500).send("Our database is having troubles");
                          return;
                        }
                        console.log("Rolling back database query");
                        res.status(500).send("Our database is having troubles");
                      });
                      return;
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
                              console.warn("The transaction sequence could not be rollbacked:", error);
                              res.status(500).send("Our database is having troubles");
                              return;
                            }
                            console.log("Rolling back database query");
                            res.status(500).send("Our database is having troubles");
                          });
                          return;
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
                                  console.warn("The transaction sequence could not be rollbacked:", error);
                                  res.status(500).send("Our database is having troubles");
                                  return;
                                }
                                console.log("Rolling back database query");
                                res.status(500).send("Our database is having troubles");
                              });
                              return;
                            }
                            var path = "./bills/web/" + link + "/";
                            fs.stat(path, function (err) {
                              if (err && (err.errno === 34 || err.errno === -4058)) { // path does not exist
                                fs.mkdir(path, function (error) {
                                    if (error) {
                                      console.warn("The directory",path,"could not be created, error is:", error);
                                      connection.rollback(function (error) {
                                        connection.release();
                                        if (error) {
                                          console.warn("The transaction sequence could not be rollbacked:", error);
                                          res.status(500).send("Our database is having troubles");
                                          return;
                                        }
                                        console.log("Rolling back database query");
                                        res.status(500).send("Our database is having troubles");
                                      });
                                      return;
                                    }
                                    // TODO copy default bill webpage to path
                                    // write the billID somewhere in this so that
                                    // dynamic webpage can use it to fetch information
                                    connection.commit(function (error) {
                                      connection.release();
                                      if (error) {
                                        console.warn("The transaction sequence could not be committed:", error);
                                        res.status(500).send("Our database is having troubles");
                                        return;
                                      }
                                      res.status(200).send("Bill created");
                                    });
                                });
                              } else if (err) {
                                console.warn("Checking the path", path, "gave the error:", err);
                                connection.rollback(function (error) {
                                  connection.release();
                                  if (error) {
                                    console.warn("The transaction sequence could not be rollbacked:", error);
                                    res.status(500).send("Our database is having troubles");
                                    return;
                                  }
                                  console.log("Rolling back database query");
                                  res.status(500).send("Our database is having troubles");
                                });
                              } else { // path already exists - unlikely just redo the whole thing
                                console.warn("Path", path, "already exists !!");
                                connection.rollback(function (error) {
                                  connection.release();
                                  if (error) {
                                    console.warn("The transaction sequence could not be rollbacked:", error);
                                    res.status(500).send("Our database is having troubles");
                                    return;
                                  }
                                  console.log("Rolling back database query");
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

// Get bills where user is involved
app.get('/users/:userID/bills', function (req, res) {
    // Parse body of request
    var userID = req.params.userID;
    if (!req.body.hasOwnProperty("token")) {
        res.status(400).send("Body is missing token");
        return;
    }
    var token = req.body.token;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!Number.isInteger(userID)) {
        console.log("Invalid user ID:", userID);
        res.status(400).send("User id is invalid");
        return;
    }
    if (token.length !== 40) {
        console.log("Invalid token length:", token);
        res.status(400).send("Token is invalid");
        return;
    }

    // Check in database
    pool.getConnection(function(error, connection) {
      if (error) {
        console.warn("Could not obtain connection from pool");
        res.status(500).send("Our server is having troubles");
        return;
      }
      connection.query(
        "SELECT id, token FROM users WHERE id = ? AND token = ? LIMIT 1",
        [userID, token],
        function (error, result) {
          console.log("GET /users/:userID/bills 1:", result); // TODO to remove
          if (error) {
            connection.release();
            console.warn("The users table can't be searched:", error);
            res.status(500).send("Our database is having troubles");
            return;
          }
          if (result.length === 0) { // Wrong userID or token
            connection.release();
            console.log("User ID", userID, "with token", token, "does not exit");
            res.status(401).send("User ID and token combination is invalid");
            return;
          }
          connection.query(
            "SELECT bill_id FROM bills_users WHERE user_id = ?",
            [userID],
            function (error, result) {
              console.log("GET /users/:userID/bills 2:", result); // TODO to remove
              if (error) {
                connection.release();
                console.warn("The bills_users table can't be searched:", error);
                res.status(500).send("Our database is having troubles");
                return;
              }
              if (result.length === 0) {
                connection.release();
                res.status(204).send("You do not have any bills yet");
                return;
              }
              var billsIDs = [];
              result.forEach(function (r) {
                billsIDs.push(r.bill_id);
              });
              // TODO Get information for all bills IDs in a single query
              connection.release();
            }
          );
        }
      );
    });
});

// Get bill details
app.get('/bills/:billID', function (req, res) {
    // Parse body of request
    var billID = req.params.billID;
    if (!req.body.hasOwnProperty("userID") || !req.body.hasOwnProperty("token")) {
        res.status(400).send('Body is missing parameters');
        return;
    }
    var userID = req.body.userID;
    console.log(req.body);
    var token = req.body.token;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!Number.isInteger(userID)) {
        console.log("Invalid user ID: ", userID);
        res.status(400).send('User id is invalid');
        return;
    }

    // Check in database
    pool.getConnection(function(error) {
      if (error) {
        console.warn("Could not obtain connection from pool");
        res.status(500).send("Our server is having troubles");
        return;
      }
      connection.query(
        "SELECT id, token FROM users WHERE id = ? AND token = ? LIMIT 1",
        [userID, token],
        function (error, result) {
          console.log("GET /bills/:billID 1", result); // TODO to remove
          if (error) {
            connection.release();
            console.warn("The users table can't be searched:", error);
            res.status(500).send("Our database is having troubles");
            return;
          }
          if (result.length === 0) { // Wrong userID or token
            connection.release();
            console.log("User ID", userID, "with token", token, "does not exit");
            res.status(401).send('User ID and token combination is invalid');
            return;
          }
          connection.query(
            "SELECT * FROM bills WHERE bills.id = ?",
            [billID],
            function (error, result) {
              console.log("GET /bills/:billID 2", result); // TODO to remove
              if (error) {
                connection.release();
                console.warn("The bills table can't be searched:", error);
                res.status(500).send("Our database is having troubles");
                return;
              }
              if (result.length === 0) {
                connection.release();
                console.log("User ID", userID, "does not have bill with id", billID);
                res.status(204).send('User ID has no such bill');
                return;
              }
              var bill = {
                id:result[0].id,
                time:result[0].time,
                address:result[0].address,
                restaurant:result[0].restaurant,
                name:result[0].name,
                tax:result[0].tax,
                tip:result[0].tip,
                link:result[0].link,
                done:result[0].done
              };
              connection.query(
                "SELECT bills_users.user_id AS id, users.username AS username FROM bills_users, users WHERE bills.id = ? AND bills_users.user_id = users.id",
                [billID],
                function (error, result) {
                  console.log("GET /bills/:billID 3", result); // TODO to remove
                  if (error) {
                    connection.release();
                    console.warn("The bills_users / users table can't be searched:", error);
                    res.status(500).send("Our database is having troubles");
                    return;
                  }
                  bill.users = result; // list of {id:x, username:xxx}s
                  connection.query(
                    "SELECT bills_users.temp_user_id AS id, temp_users.name AS username FROM bills_users, temp_users WHERE bills.id = ? AND bills_users.temp_user_id = temp_users.id",
                    [billID],
                    function (error, result) {
                      console.log("GET /bills/:billID 4", result); // TODO to remove
                      if (error) {
                        connection.release();
                        console.warn("The bills_users / temp_users table can't be searched:", error);
                        res.status(500).send("Our database is having troubles");
                        return;
                      }
                      bill.tempUsers = result; // list of {id:x, username:xxx}s
                      connection.query(
                        "SELECT items.id AS id, items.name AS name, items.amount AS amount FROM items WHERE items.bill_id = ?",
                        [billID],
                        function (error, result) {
                          console.log("GET /bills/:billID 5", result); // TODO to remove
                          if (error) {
                            connection.release();
                            console.warn("The items table can't be searched:", error);
                            res.status(500).send("Our database is having troubles");
                            return;
                          }
                          bill.items = result;
                          connection.query(
                            "SELECT items_consumers.* FROM items_consumers, items WHERE items.bill_id = ? AND items.id = items_consumers.item_id",
                            [billID],
                            function (error, result) {
                              console.log("GET /bills/:billID 6", result); // TODO to remove
                              if (error) {
                                connection.release();
                                console.warn("The items_consumers table can't be searched:", error);
                                res.status(500).send("Our database is having troubles");
                                return;
                              }
                              bill.consumers = result;
                              console.log("Detailed bill is:", bill); // TODO to remove
                              res.status(200).send(bill);
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


// Sign in procedure
app.get('/users', function (req, res) {
    // Parse body of request
    if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")) {
        res.status(400).send('Body is missing parameters');
        return;
    }
    var email = req.body.email;
    var password = req.body.password;
    
    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    password = validator.trim(password);    
    if (!validator.isEmail(email)) {
        console.log("Invalid email address for login:", email);
        res.status(400).send('Your email address is invalid');
        return;
    }
    email = validator.normalizeEmail(email);

    pool.getConnection(function(error) {
      if (error) {
        console.warn("Could not obtain connection from pool");
        res.status(500).send("Our server is having troubles");
        return;
      }
      connection.query(
        "SELECT id, digest, salt, token FROM users WHERE email = ? LIMIT 1",
        [email],
        function (error, result) {
          connection.release();
          console.log("GET /users 1:", result); // TODO to remove
          if (error) {
            console.warn("The users table can't be searched:", error);
            res.status(500).send("Our database is having troubles");
            return;
          }
          if (result.length === 0) { // email does not exist
            console.log("Email does not exist: ", email);
            res.status(401).send('Incorrect email or password');
            return;
          }
          var digest = crypto.scrypt(password, result[0].salt);
          if (digest != result[0].digest) {
            console.log("Password is incorrect: ", password);
            res.status(401).send('Incorrect email or password');
            return;
          }
          res.status(200).send({userID: result[0].id, token: result[0].token});
        }
      );
    });
});

// Sign up procedure
app.post('/users', function (req, res) {
    // Parses body of request
    if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("password")) {
        res.status(400).send('Body is missing parameters');
        return;
    }
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    username = validator.trim(username);
    password = validator.trim(password);
    if (!validator.isEmail(email)) {
        console.log("Invalid email address for signup:", email);
        res.status(400).send('Your email is invalid');
        return;
    }
    email = validator.normalizeEmail(email);
    if (username.length < 4) {
        console.log("Username is too short:", username);
        res.status(400).send('Username is too short');
        return;
    } else if (username.length > 40) {
        console.log("Username is too long:", username);
        res.status(400).send('Username is too long');
        return;
    }
    if (password.length < 4) {
        console.log("Password is too short:", password);
        res.status(400).send('Password is too short');
        return;
    } else if (password.length > 100) {
        console.log("Password is too long:", password);
        res.status(400).send('Password is too long');
        return;
    }

    pool.getConnection(function(error) {
      if (error) {
        console.warn("Could not obtain connection from pool");
        res.status(500).send("Our server is having troubles");
        return;
      }
      connection.query(
        "SELECT 1 FROM users WHERE email = ?",
        [email],
        function (error, result) {
          console.log("POST /users 1:", result); // TODO to remove
          if (error) {
            connection.release();
            console.warn("The users table can't be searched:", error);
            res.status(500).send("Our database is having troubles");
            return;
          }
          if (result.length > 0) {
            connection.release();
            console.log("Email already exists:", email);
            res.status(409).send("Email is already registered");
            return;
          }
          connection.query(
            "SELECT 1 FROM users WHERE username = ?",
            [username],
            function (error, result) {
              console.log("POST /users 2:", result); // TODO to remove
              if (error) {
                connection.release();
                console.warn("The users table can't be searched:", error);
                res.status(500).send("Our database is having troubles");
                return;
              }
              if (result.length > 0) {
                connection.release();
                console.log("Username already exists:", email);
                res.status(409).send("Username is already registered");
                return;
              }
              // Create the user
              // TODO Add email verification
              var salt = crypto.randomString(8);
              var digest = crypto.scrypt(password, salt);
              var token = crypto.randomString(40);
              connection.query(
                "INSERT INTO users (email, username, digest, salt, token) VALUES ?",
                [[[email, username, digest, salt, token]]],
                function (error, result) {
                  if (error) {
                    connection.release();
                    console.warn("The user can't be created:", error);
                    res.status(500).send("Our database is having troubles");
                    return;
                  }
                  console.log("User", username, "created");
                  res.status(201).send(token);
                }
              );
            }
          );
        }
      );
    });
});

// Serves bill's webpage
// link acts as the bill's token really
app.get('/bills/web/:link', function (req, res) {
    // Parse body of request
    var link = req.params.link;
    if (link.length !== 40) {
        console.log("Link provided is invalid: ", link);
        res.status(400).send("Link provided is invalid");
        return;
    }
    fs.stat(path, function (err, stats) {
        if (err) {
            if (err.errno === 34) { // path does not exist
                res.status(404).send("Link provided does not exist");
            } else {
                console.warn("Checking the path", path, "gave the error:", err);
                res.status(500).send("Our server is having troubles");
            }
        } else {
            // TODO serve the webpage
        }
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
    if (process.argv.length > 2 && process.argv[2] == "test") {
        start(8001, "billsplittertest");
    } else {
        start(8000, "billsplitter");
    }
}