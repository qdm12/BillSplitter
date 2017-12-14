var chai = require('chai');
var expect = chai.expect;
var Server = require('./../server.js');

var request = require('sync-request');
var fs = require('fs');
var mysql = require('mysql');

// Make sure you have the server running on port 8001 with the database "billsplittertest"
// Do this with `node server.js test` on another terminal

before(function() { // takes some ~1 second for the first request for some reason
    var res = request('GET', 'http://localhost:8001/');
});

// Testing of server
describe('Server GET /', function() {
    it('Simple GET', function() {
        var res = request('GET', 'http://localhost:8001/');
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Your result");
    });
});


// Upload a new bill
describe('Server POST /bills', function() {
    before(function(done) {
        const testSuite = this;
        fs.readFile(__dirname + "/test.sql", 'utf8', function (error, data) {
            if (error) {
                console.error("Reading the SQL script file failed:", error);
                testSuite.skip();
            } else {
                var connection = mysql.createConnection({host:"localhost", user:"root", password:"password", multipleStatements: true});
                connection.connect();
                connection.query(data, function (error, results) {
                    if (error) {
                        console.error("The Test SQL script did not execute successfully:", error);
                        testSuite.skip();
                    } else {
                        done();
                    }
                });
                connection.end();
            }
        });
    });
    it('No parameter', function() {
        var res = request('POST', 'http://localhost:8001/bills', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('Missing token', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('Missing body', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing the picture parameter");
    });
    it('Missing body parameter picture', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            },
            json: {}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing the picture parameter");
    });
    it('Invalid token', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "XXXXXXXXXXX"
            },
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Token is invalid");
    });
    it('User ID does not exist anymore', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                // token for user ID 256
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMTk2MjM0LCJleHAiOjE1MTMyODI2MzR9.peHmCivucnGWUnZpejybdneiAIpcnVcO213NjnXtVyk"
            },
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            },
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Bill created");
    });
});


// Obtain bills IDs where a certain user is involved
describe('Server GET /bills', function() {
    before(function(done) {
        const testSuite = this;
        fs.readFile(__dirname + "/test.sql", 'utf8', function (error, data) {
            if (error) {
                console.error("Reading the SQL script file failed:", error);
                testSuite.skip();
            } else {
                var connection = mysql.createConnection({host:"localhost", user:"root", password:"password", multipleStatements: true});
                connection.connect();
                connection.query(data, function (error, results) {
                    if (error) {
                        console.error("The Test SQL script did not execute successfully:", error);
                        testSuite.skip();
                    } else {
                        done();
                    }
                });
                connection.end();
            }
        });
    });
    it('Missing token', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('Invalid token', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "XXXXXXXXXXX"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Token is invalid");
    });
    it('User ID does not exist anymore', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                // token for user ID 256
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMTk2MjM0LCJleHAiOjE1MTMyODI2MzR9.peHmCivucnGWUnZpejybdneiAIpcnVcO213NjnXtVyk"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('No bill yet', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                // token for user ID 4
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjQsImlhdCI6MTUxMzE5NjY4NiwiZXhwIjoxNTEzMjgzMDg2fQ.MiEZCdQNQdDTWqtXv0sFi8DjgeZoL7OW3jZAA4mpXjQ"
            }
        });
        expect(res.statusCode).to.equal(204);
        expect(res.body.toString('utf-8')).to.equal("");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            }
        });
        expect(res.statusCode).to.equal(200);
        var billIDs = JSON.parse(res.body.toString('utf-8'));
        expect(billIDs).to.eql([ 1, 2 ]);
    });
});


// Obtain details of a bill
describe('Server GET /bills/:billID', function() {
    before(function(done) {
        const testSuite = this;
        fs.readFile(__dirname + "/test.sql", 'utf8', function (error, data) {
            if (error) {
                console.error("Reading the SQL script file failed:", error);
                testSuite.skip();
            } else {
                var connection = mysql.createConnection({host:"localhost", user:"root", password:"password", multipleStatements: true});
                connection.connect();
                connection.query(data, function (error, results) {
                    if (error) {
                        console.error("The Test SQL script did not execute successfully:", error);
                        testSuite.skip();
                    } else {
                        done();
                    }
                });
                connection.end();
            }
        });
    });
    it('Missing token', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('billID is not an integer', function() {
        var res = request('GET', 'http://localhost:8001/bills/abc', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("billID is invalid");
    });
    it('Token is invalid', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "XXXXXXXXXXX"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Token is invalid");
    });
    it('User ID does not exist anymore', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                // token for user ID 256
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMTk2MjM0LCJleHAiOjE1MTMyODI2MzR9.peHmCivucnGWUnZpejybdneiAIpcnVcO213NjnXtVyk"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('No bill (wrong token)', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                // token for user ID 4
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjQsImlhdCI6MTUxMzE5NjY4NiwiZXhwIjoxNTEzMjgzMDg2fQ.MiEZCdQNQdDTWqtXv0sFi8DjgeZoL7OW3jZAA4mpXjQ"
            }
        });
        expect(res.statusCode).to.equal(204);
        expect(res.body.toString('utf-8')).to.equal("");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzE5NTAxMywiZXhwIjoxNTEzMjgxNDEzfQ.6llgBUZB9uY6m6I1ih4_HMLMrHDTRs_38n-wPVwYFu4"
            }
        });
        expect(res.statusCode).to.equal(200);
        var bill = JSON.parse(res.body.toString('utf-8'));
        expect(bill).to.eql({
            id: 1,
            time: {sec:'01', min:'00', hour:'00', day:'01', month:'Dec', year:'2017' },
            address: '196 W Third Avenue',
            restaurant: 'Pizza\'o\'ven',
            name: 'Birthday pizza',
            tax: 19.67,
            tip: 5,
            link: '2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL',
            done: 0,
            users: [{id:1, username:'Alice'}, {id:2, username:'Bob'}],
            tempUsers: [{id:1, username:'John'}],
            items: [{id:1, name:'PizzaA', amount:10.5}, {id:2, name:'PizzaB', amount:14}, {id:3, name:'Fries', amount:6.24}],
            consumers: [
                { item_id: 1, user_id: 1, temp_user_id: null, paid: 0 },
                { item_id: 1, user_id: null, temp_user_id: 1, paid: 0 },
                { item_id: 2, user_id: 2, temp_user_id: null, paid: 0 },
                { item_id: 3, user_id: 1, temp_user_id: null, paid: 0 },
                { item_id: 3, user_id: 2, temp_user_id: null, paid: 0 },
                { item_id: 3, user_id: null, temp_user_id: 1, paid: 0 }
            ]
        });
    });
});


// Log in
describe('Server POST /login', function() {
    before(function(done) {
        const testSuite = this;
        fs.readFile(__dirname + "/test.sql", 'utf8', function (error, data) {
            if (error) {
                console.error("Reading the SQL script file failed:", error);
                testSuite.skip();
            } else {
                var connection = mysql.createConnection({host:"localhost", user:"root", password:"password", multipleStatements: true});
                connection.connect();
                connection.query(data, function (error, results) {
                    if (error) {
                        console.error("The Test SQL script did not execute successfully:", error);
                        testSuite.skip();
                    } else {
                        done();
                    }
                });
                connection.end();
            }
        });
    });
    it('No body is provided', function() {
        var res = request('POST', 'http://localhost:8001/login', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Email parameter is missing', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Password parameter is missing', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"email@e.com"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Email is not an email address', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"email.blablacom", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your email address is invalid");
    });
    it('Password is more than 100 characters', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"email@e.com", password:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your password is too long");
    });
    it('Email does not exist', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"email@e.com", password:"password"}
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Incorrect email or password");
    });
    it('Email exists and wrong password', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"alice@a.com", password:"wrong password"}
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Incorrect email or password");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"alice@a.com", password:"password"}
        });
        expect(res.statusCode).to.equal(200);
        var credentials = JSON.parse(res.body.toString('utf-8'));
        expect(credentials.userID).to.equal(1);
        expect(credentials.token.length).to.equal(143); // as token is randomly generated
    });
});