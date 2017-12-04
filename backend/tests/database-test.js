var chai = require('chai');
var expect = chai.expect;
var Database = require('./../database.js');

describe('Database package', function() {
    before(function(){
        Database.createDatabase("billsplitter_test");
        Database.connectToDatabase("billsplitter_test", true);
    });
    after(function(){
        Database.cleanDatabase("billsplitter_test");
    });
    it('createUser', function() {
        console.log(2222);
        //Database.createUser();
        expect(0).to.equal(0);
    });
});