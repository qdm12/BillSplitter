exports.scrypt = scryptHash;

var scrypt = require('scryptsy')

function scryptHash(input) {
    var salt = randomString(8);
    var digest = scrypt(input, salt, 16384, 8, 1, 64);
    return [digest.toString('base64'), salt]; // bytes, string
}

function randomString(length) {
    var string = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[{]}\|~/?.>,<;:";
    for (var i = 0; i < length; i++) {
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return string;
}