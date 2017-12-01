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
app.post('/users/:email/bills', function (req, res) {
    // Parses body of request
    var email = req.email;
    var token = req.body.token;
    var picture = req.body.picture;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
        console.log("Invalid email address: ", email);
        res.status(400).send('Email address is invalid');
        return;
    }
    email = validator.normalizeEmail(email);

    // Check in database
    // TODO Escape email for database
    // TODO Database: 
    //          1. Check if email exists and is verified
    //          2. Obtain corresponding token
    if (!emailExists) {
        console.log("Email does not exist:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token is invalid for email:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }

    // Perform action
    // TODO escape picture and store it in database
    res.status(201).send("Bill created");
});

// Get bills of username
app.get('/users/:email/bills', function (req, res) {
    // Parses body of request
    var email = req.email;
    var token = req.body.token;
    
    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
        console.log("Invalid email address: ", email);
        res.status(400).send('Email address is invalid');
        return;
    }
    email = validator.normalizeEmail(email);

    // Check in database
    // TODO Escape email for database
    // TODO Database: 
    //          1. Check if email exists and is verified
    //          2. Obtain corresponding token
    if (!emailExists) {
        console.log("Email does not exist:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token is invalid for email:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }

    // Perform action
    // TODO Return bills from database
    res.status(200).send(bills);
});

// Get bill details
app.get('/users/:email/bills/:billID', function (req, res) {
    // Parses body of request
    var email = req.email;
    var billID = req.billID;
    var token = req.body.token;

    // Check for validity of inputs (see https://www.npmjs.com/package/validator)
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
        console.log("Invalid email address: ", email);
        res.status(400).send('Email address is invalid');
        return;
    }
    email = validator.normalizeEmail(email);

    // Check in database
    // TODO Escape email for database
    // TODO Database: 
    //          1. Check if email exists and is verified
    //          2. Obtain corresponding token
    if (!emailExists) {
        console.log("Email does not exist:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }
    if (token != storedToken) {
        console.log("Token is invalid for email:", email);
        res.status(403).send('Email and token combination is invalid');
        return;
    }

    // Check for billID in database

    // Perform action
    // TODO Return bill details from database
    res.status(200).send(bill);
});

// Sign in procedure
app.get('/users/:email', function (req, res) {
    var email = req.email;
    var password = req.body.password;
    // see https://www.npmjs.com/package/validator
    // TODO Escape inputs for database
    email = validator.trim(email);
    password = validator.trim(password);    
    if (!validator.isEmail(email)) {
        console.log("Invalid email address for login:", email);
        res.status(400).send('Your email address is invalid');
        return;
    }
    email = validator.normalizeEmail(email);
    if (password.length > 100) {
        console.log("Password is too long: ", password);
        res.status(401).send('Incorrect email or password');
        return;
    }
    // check if email exists in database
    /*
    if (!emailExists) {
        console.log("Email does not exist in database: ", email);
        res.status(401).send('Incorrect email or password');
        return;
    }*/
    var salt = ""; // get from database
    var digest = crypto.scrypt(password, salt);
    var digestStored = ""; // get from database
    if (digest != digestStored) {
        console.log("Password is incorrect: ", password);
        res.status(401).send('Incorrect email or password');
        return;
    }
    var token = ""; // get token from database
    res.status(200).send(token);
});

// Signup procedure
app.post('/users', function (req, res) {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    // Check for validity of inputs
    // see https://www.npmjs.com/package/validator
    // TODO Escape inputs for database
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

    // Check if user does not exist already (check verified flag)
    if (emailExists) {
        console.log("Email already exists:", email);
        res.status(409).send('Email is already registered');
        return;
    }
    if (userExists) {
        console.log("Username already exists:", username);
        res.status(409).send('Username is already taken');
        return;
    }
    
    // Create the user (add email verification eventually)
    var salt = crypto.randomString(8);
    var digest = crypto.scrypt(password, salt);
    var token = crypto.randomString(40);
    // store that in the SQL database
    res.status(201).send(token);
});

var server = app.listen(8000, function () {
    console.log("Server listening at localhost:%s", server.address().port);
});