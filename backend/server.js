var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const crypto = require('./crypto.js');


// All body of HTTP requests must be encoded in x-www-form-urlencoded

app.get('/', function (req, res) {
    res.end("Your result");
});

// Signup procedure
app.post('/users', function (req, res) {
    var email = req.body.email;
    var username = req.body.username;
    var clientDigest = req.body.clientDigest; // base64(sha256(email + password))
    // clientDigest to prevent rainbow attacks if the communication is insecured
    var result = crypto.scrypt(clientDigest);
    var digest = result[0];
    var salt = result[1];
    // store that in the SQL database
});

var server = app.listen(8000, function () {
    console.log("Example app listening at localhost:%s", server.address().port);
});