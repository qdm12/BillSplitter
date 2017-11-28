var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var validator = require('validator');


const crypto = require('./crypto.js');


// All body of HTTP requests must be encoded in x-www-form-urlencoded

app.get('/', function (req, res) {
    res.end("Your result");
});

// Signup procedure
app.post('/users', function (req, res) {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    // see https://www.npmjs.com/package/validator
    if (!validator.isEmail(email)) {
        console.log("Invalid email address for signup:", email);
        res.status(400).send('Your email is not an email address');
        return;
    }
    // Check username is ascii and non empty, same for password
    var result = crypto.scrypt(password);
    var digest = result[0];
    var salt = result[1];
    // store that in the SQL database
    res.status(201);
});

var server = app.listen(8000, function () {
    console.log("Server listening at localhost:%s", server.address().port);
});