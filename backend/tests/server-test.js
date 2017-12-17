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
describe('Server GET /ping', function() {
    it('GET /ping', function() {
        var res = request('GET', 'http://localhost:8001/ping');
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("pong");
    });
});

// Just creating the database for each test suite
function setUpDatabase(testSuite, done) {
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
}


// Upload a new bill
describe('Server POST /bills', function() {
    before(function(done) {
        setUpDatabase(this, done);
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
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing the picture parameter");
    });
    it('Missing body parameter picture', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
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
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMjgyMjkyfQ.HAVz-a60xp-AJdPmtXozfl2wOABodAdtEf21EKgGtVI"
            },
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {picture: "?"}
        });
        expect(res.statusCode).to.equal(201);
        expect(res.body.toString('utf-8')).to.equal("Bill created");
    });
});


// Obtain bills IDs where a certain user is involved
describe('Server GET /bills', function() {
    before(function(done) {
        setUpDatabase(this, done);
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
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMjgyMjkyfQ.HAVz-a60xp-AJdPmtXozfl2wOABodAdtEf21EKgGtVI"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('No bill yet', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                // token for user ID 4
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjQsImlhdCI6MTUxMzI4MjI4OH0.vCoORSsgfk2-s3xuppO4Fm8GOOhIqiJyDoTih2BiT34"
            }
        });
        expect(res.statusCode).to.equal(204);
        expect(res.body.toString('utf-8')).to.equal("");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
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
        setUpDatabase(this, done);
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
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
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
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMjgyMjkyfQ.HAVz-a60xp-AJdPmtXozfl2wOABodAdtEf21EKgGtVI"
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('No bill (wrong token)', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                // token for user ID 4
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjQsImlhdCI6MTUxMzI4MjI4OH0.vCoORSsgfk2-s3xuppO4Fm8GOOhIqiJyDoTih2BiT34"
            }
        });
        expect(res.statusCode).to.equal(204);
        expect(res.body.toString('utf-8')).to.equal("");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
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
            done: false,
            users: [{id:1, username:'Alice'}, {id:2, username:'Bob'}],
            tempUsers: [{id:1, username:'John'}],
            items: [{id:1, name:'PizzaA', amount:10.5}, {id:2, name:'PizzaB', amount:14}, {id:3, name:'Fries', amount:6.24}],
            consumers: [
                { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                { item_id: 2, user_id: 2, temp_user_id: null, paid: false },
                { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                { item_id: 3, user_id: null, temp_user_id: 1, paid: false }
            ]
        });
    });
});


// Log in
describe('Server POST /login', function() {
    before(function(done) {
        setUpDatabase(this, done);
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
            json: {email:"alice@a.com"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Email is not a string (number)', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:1, password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your email address is not a string");
    });
    it('Password is not a string (number)', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"elliot@e.com", password:1}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your password is not a string");
    });
    it('Email is not an email address', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"ema@bla.1", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your email address is invalid");
    });
    it('Password is more than 100 characters', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"alice@a.com", password:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your password is too long");
    });
    it('Email does not exist', function() {
        var res = request('POST', 'http://localhost:8001/login', {
            json: {email:"elliot@e.com", password:"password"}
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
            json: {email: "alice@a.com", password: "password"}
        });
        expect(res.statusCode).to.equal(200);
        var credentials = JSON.parse(res.body.toString('utf-8'));
        expect(credentials.userID).to.equal(1);
        expect(credentials.token.length).to.equal(120); // token is randomly generated
    });
});


// Sign up (+login)
describe('Server POST /users', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('No body is provided', function() {
        var res = request('POST', 'http://localhost:8001/users', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Email parameter is missing', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {username:"Elliot", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Username parameter is missing', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Password parameter is missing', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliot"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameter(s)");
    });
    it('Email is not a string (number)', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:1, username:"Elliot", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your email address is not a string");
    });
    it('Username is not a string (number)', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:1, password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your username is not a string");
    });
    it('Password is not a string (number)', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliot", password:1}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your password is not a string");
    });
    it('Email is not an email address', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"email.blablacom", username:"Elliot", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Your email address is invalid");
    });
    it('Username is less than 4 characters', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Ell", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Username is too short");
    });
    it('Username is more than 40 characters', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliottttttttttttttttttttttttttttttttttttttttt", password:"password"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Username is too long");
    });
    it('Password is less than 6 characters', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliot", password:"aaaaa"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Password is too short");
    });
    it('Password is more than 100 characters', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliot", password:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Password is too long");
    });
    it('Email alice@a.com is already registered', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"alice@a.com", username:"Elliot", password:"password"}
        });
        expect(res.statusCode).to.equal(409);
        expect(res.body.toString('utf-8')).to.equal("Email is already registered");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/users', {
            json: {email:"elliot@e.com", username:"Elliot", password:"password"}
        });
        expect(res.statusCode).to.equal(201);
        var credentials = JSON.parse(res.body.toString('utf-8'));
        expect(credentials.userID).to.equal(5);
        expect(credentials.token.length).to.equal(120); // token is randomly generated
    });
});


// Dynamic webpage
describe('Server GET /bills/web/:link', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('Link is not a string (integer)', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/1');
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Link is not 40 characters', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/abc123');
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Link does not exist', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/XXXFHtGDh44bMtW4VbngW3XxPQwqIQucnAUYYYYY');
        expect(res.statusCode).to.equal(404);
        expect(res.body.toString('utf-8')).to.equal("Link provided does not exist");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL');
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8').length).to.greaterThan(200);
    });
});



// Obtain details of a bill from web link
describe('Server GET /bills/web/:link/details', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('Link is not a string (integer)', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/1/details');
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Link is not 40 characters', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/abc123/details');
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Link does not exist', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/XXXFHtGDh44bMtW4VbngW3XxPQwqIQucnAUYYYYY/details');
        expect(res.statusCode).to.equal(404);
        expect(res.body.toString('utf-8')).to.equal("Link provided does not exist");
    });
    it('Success', function() {
        var res = request('GET', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL/details');
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
            done: false,
            users: [{id:1, username:'Alice'}, {id:2, username:'Bob'}],
            tempUsers: [{id:1, username:'John'}],
            items: [{id:1, name:'PizzaA', amount:10.5}, {id:2, name:'PizzaB', amount:14}, {id:3, name:'Fries', amount:6.24}],
            consumers: [
                { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                { item_id: 2, user_id: 2, temp_user_id: null, paid: false },
                { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                { item_id: 3, user_id: null, temp_user_id: 1, paid: false }
            ]
        });
    });
});


// Update bill using the dynamic link
describe('Server PUT /bills/web/:link', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('Link is not a string (integer)', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/1', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Link is not 40 characters', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/abc123', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('No body provided', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL');
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing the bill parameter");
    });
    it('Bill JSON parameter is missing', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', {
            json: {}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing the bill parameter");
    });
    it('Link does not exist', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/XXXFHtGDh44bMtW4VbngW3XxPQwqIQucnAUYYYYY', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(404);
        expect(res.body.toString('utf-8')).to.equal("Link provided does not exist");
    });
    it('Bill JSON parameter is malformed', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', {
            json: {
                bill: "abc"
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The bill JSON parameter is malformed or not an object");
    });
    it('Missing element in bill JSON object', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The consumer object 4 is missing its user_id property");
    });
    it('Success', function() {
        var res = request('PUT', 'http://localhost:8001/bills/web/2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Bill updated");
    });
});


// Update bill as a registered user
describe('Server PUT /bills/:billID', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('No body provided', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('Token is missing', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Token is missing from x-access-token in headers");
    });
    it('Bill ID is not a number (character)', function() {
        var res = request('PUT', 'http://localhost:8001/bills/a', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("URL parameter billID is invalid");
    });
    it('Bill ID is 0', function() {
        var res = request('PUT', 'http://localhost:8001/bills/0', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("URL parameter billID is invalid");
    });
    it('Bill ID is over 2147483647', function() {
        var res = request('PUT', 'http://localhost:8001/bills/2147483648', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("URL parameter billID is invalid");
    });
    it('Token is invalid', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "XXXXXXXXX"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("Token is invalid");
    });
    it('User ID does not exist anymore', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                // token for user ID 256
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjI1NiwiaWF0IjoxNTEzMjgyMjkyfQ.HAVz-a60xp-AJdPmtXozfl2wOABodAdtEf21EKgGtVI"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID does not exist");
    });
    it('No bill (wrong token)', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                // token for user ID 4
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjQsImlhdCI6MTUxMzI4MjI4OH0.vCoORSsgfk2-s3xuppO4Fm8GOOhIqiJyDoTih2BiT34"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(204);
        expect(res.body.toString('utf-8')).to.equal("");
    });
    it('Bill JSON parameter is malformed', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: "abc"
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The bill JSON parameter is malformed or not an object");
    });
    it('Missing element in bill JSON object', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The consumer object 4 is missing its user_id property");
    });
    it('Success', function() {
        var res = request('PUT', 'http://localhost:8001/bills/1', {
            headers: {
                'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTUxMzI4MjIxNX0.yBmaWqLBtfThJF9oNMN6Imhn8OfgXyUwseM_nmxJZi0"
            },
            json: {
                bill: {
                    name: "New name",
                    done: false,
                    users: [{id:1}, {id:2}, {id:3}], // Added Carol (id 3)
                    tempUsers: [{id:1}],
                    consumers: [
                        { item_id: 1, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 1, user_id: null, temp_user_id: 1, paid: false },
                        { item_id: 2, user_id: 2, temp_user_id: null, paid: true },
                        { item_id: 3, user_id: 1, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: 2, temp_user_id: null, paid: false },
                        { item_id: 3, user_id: null, temp_user_id: 1, paid: true },
                        { item_id: 2, user_id: 3, temp_user_id: null, paid: true }
                    ]
                }
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Bill updated");
    });
});


// Create temporary user
describe('Server POST /tempusers', function() {
    before(function(done) {
        setUpDatabase(this, done);
    });
    it('No body is provided', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing some parameter(s)");
    });
    it('Body is missing parameters', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing some parameter(s)");
    });
    it('Body is missing the name parameter', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {link: "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing some parameter(s)");
    });
    it('Body is missing the link parameter', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "michael"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing some parameter(s)");
    });
    it('Link parameter is invalid (integer)', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "michael", link: 1}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Link provided is invalid");
    });
    it('Name is too short', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "ab", link: "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The name provided is too short");
    });
    it('Name is too long', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "aaaaaaaaaaaaaaaaaaaaa", link: "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL"}
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("The name provided is too long");
    });
    it('Link does not exist', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "michael", link: "XXXXHtGDh44bMtW4VbngW3XxPQwqIQucnAUMXXXX"}
        });
        expect(res.statusCode).to.equal(404);
        expect(res.body.toString('utf-8')).to.equal("Link provided does not exist");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/tempusers', {
            json: {name: "michael", link: "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL"}
        });
        expect(res.statusCode).to.equal(201);
        var tempUser = JSON.parse(res.body.toString('utf-8'));
        expect(tempUser).to.eql({id: 3});
    });
});