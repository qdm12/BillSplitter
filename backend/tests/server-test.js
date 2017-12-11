var chai = require('chai');
var request = require('sync-request');
var expect = chai.expect;
var Server = require('./../server.js');

// Make sure you have the server running on port 8001 with the database "billsplittertest"

describe('Server GET /', function() {
    before(function() {});
    it('Simple GET', function() {
        var res = request('GET', 'http://localhost:8001/');
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Your result");
    });
});

describe('Server POST /bills', function() {
    it('No body parameter', function() {
        var res = request('POST', 'http://localhost:8001/bills', {});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameters");
    });
    it('Missing one body parameter', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 4,
            token: "x"
        }});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("Body is missing parameters");
    });
    it('User ID is a string', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: "string",
            token: "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(400);
        expect(res.body.toString('utf-8')).to.equal("User id is invalid");
    });
    it('Token too short', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 2,
            token: "XM53hT=MU=bV=IXCRrANUx",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID and token combination is invalid");
    });
    it('Token too long', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 2,
            token: "XM53hT=MU=bV=IXCRrANUxXM53hT=MU=bV=IXCRrANUxXM53hT=MU=bV=IXCRrANUxXM53hT=MU=bV=IXCRrANUx",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID and token combination is invalid");
    });
    it('User ID does not exist', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 2568,
            token: "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID and token combination is invalid");
    });
    it('Wrong user ID', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 2,
            token: "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID and token combination is invalid");
    });
    it('Wrong token', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 1,
            token: "XXX3hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkXXXX",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(401);
        expect(res.body.toString('utf-8')).to.equal("User ID and token combination is invalid");
    });
    it('Success', function() {
        var res = request('POST', 'http://localhost:8001/bills', { json: {
            userID: 1,
            token: "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x",
            picture: "?"
        }});
        expect(res.statusCode).to.equal(200);
        expect(res.body.toString('utf-8')).to.equal("Bill created");
    });
});