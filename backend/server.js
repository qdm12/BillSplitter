var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var validator = require('validator');
var mysql = require('mysql');
var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
});
database.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("Database connected");
    }
});


const crypto = require('./crypto.js');


// All body of HTTP requests must be encoded in x-www-form-urlencoded

app.get('/', function (req, res) {
    res.end("Your result");
});

// Upload picture of bill
app.post('/users/:userID/bills', function (req, res) {
    // Parse body of request
    var userID = req.userID;
    var token = req.body.token;
    var picture = req.body.picture;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!validator.isInt(userID)) {
        console.log("Invalid user ID: ", userID);
        res.status(400).send('User id is invalid');
        return;
    }
    // TODO check for token and picture format


    // Check in database
    // TODO Escape userID for database
    // TODO Database: 
    //          - Check userID exists
    //          - Obtain token of user
    if (!userIDExists) {
        console.log("User ID ", userID, " does not exist");
        res.status(401).send('User ID and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token ",token," is invalid for userID ", userID);
        res.status(401).send('User ID and token combination is invalid');
        return;
    }

    // Perform action
    // TODO Send picture to Google Cloud OCR API
    // TODO Store results in database
    res.status(201).send("Bill created");
});

// Get bills where user is involved
app.get('/users/:userID/bills', function (req, res) {
    // Parse body of request
    var userID = req.userID;
    var token = req.body.token;
    
    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!validator.isInt(userID)) {
        console.log("Invalid user ID: ", userID);
        res.status(400).send('User id is invalid');
        return;
    }

    // Check in database
    // TODO Escape userID for database
    // TODO Database: 
    //          - Check userID exists
    //          - Obtain token of user
    if (!userIDExists) {
        console.log("User ID ", userID, " does not exist");
        res.status(401).send('User ID and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token ",token," is invalid for userID ", userID);
        res.status(401).send('User ID and token combination is invalid');
        return;
    }

    // Perform action
    // TODO Return all bills from database
    res.status(200).send(bills);
});

// Get bill details
app.get('/users/:userID/bills/:billID', function (req, res) {
    // Parse body of request
    var userID = req.userID;
    var billID = req.billID;
    var token = req.body.token;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    if (!validator.isInt(userID)) {
        console.log("Invalid user ID: ", userID);
        res.status(400).send('User id is invalid');
        return;
    }

    // Check in database
    // TODO Escape userID for database
    // TODO Database: 
    //          - Check userID exists
    //          - Obtain token of user
    if (!userIDExists) {
        console.log("User ID ", userID, " does not exist");
        res.status(401).send('User ID and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token ",token," is invalid for userID ", userID);
        res.status(401).send('User ID and token combination is invalid');
        return;
    }
    // TODO Databse:
    //          - Check for billID in database
    //          - Obtain bill details from database if it exists
    if (!billIDExists) {
        console.log("User ID ", userID, " does not have bill ID ", billID);
        res.status(204).send('User does not have such bill');
        return;
    }

    // Perform action
    // TODO Return bill details
    res.status(200).send(bill);
});

// Sign in procedure
app.get('/users', function (req, res) {
    // Parse body of request
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

    // TODO Escape email for database
    // TODO Database: 
    //          - Check email exists
    //          - Obtain salt and digest of user
    //          - Obtain userID of user
    //          - Obtain token of user
    if (!emailExists) {
        console.log("Email does not exist: ", email);
        res.status(401).send('Incorrect email or password');
        return;
    }
    var digest = crypto.scrypt(password, salt);
    if (digest != digestStored) {
        console.log("Password is incorrect: ", password);
        res.status(401).send('Incorrect email or password');
        return;
    }
    var result = {userID:userID, token:token};
    res.status(200).send(result);
});

// Sign up procedure
app.post('/users', function (req, res) {
    // Parses body of request
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

    // TODO Escape email for database
    // TODO Database: 
    //          - Check email exists
    if (emailExists) {
        console.log("Email already exists:", email);
        res.status(409).send('Email is already registered');
        return;
    }
    // TODO Escape username for database
    // TODO Database: 
    //          - Check username exists
    if (userExists) {
        console.log("Username already exists:", username);
        res.status(409).send('Username is already taken');
        return;
    }
    
    // Create the user
    // TODO Add email verification
    var salt = crypto.randomString(8);
    var digest = crypto.scrypt(password, salt);
    var token = crypto.randomString(40);
    // TODO Escape salt, digest and token for database
    // TODO Database: 
    //          - Store email, username, salt, digest and token
    res.status(201).send(token);
});

var server = app.listen(8000, function () {
    console.log("Server listening at localhost:%s", server.address().port);
});