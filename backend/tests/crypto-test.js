/*var chai = require('chai');
var expect = chai.expect;
var Crypto = require('./../crypto.js');

describe('Crypto package', function() {
    it('scryptHash (1) should return a deterministic digest of length 88 (base 64)', function() {
        var digest = Crypto.scrypt("password", "salt");
        expect(digest).to.equal("dFcxr0SE8yOWiWntoomu7gBbWQOsVh5kpayhIXl793NO+f1YQi4uIhg7ysup7Ie6DIO3oueI8Dzg2gZGNDPNpg==");
        expect(digest.length).to.equal(88);
    });
    it('scryptHash (2) should return a digest of length ', function() {
        var digest = Crypto.scrypt("passwordpasswordpassword", "saltsalt");
        expect(digest).to.equal("EGOPnjS2p/5NcI6Yvk/pzeJbRw1gIsiy/NqwkyQr/3H4AaClFcaDQNJctBLuhwkYAABIsJtmIHbuNvrp0ZVkwg==");
        expect(digest.length).to.equal(88);
    });
    it('randomString should return a string of length 10', function() {
        expect(Crypto.randomString(10).length).to.equal(10);
    });
});*/