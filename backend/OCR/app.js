
var express = require('express');
var cors = require('cors')
var app = express();
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendfile('tesseract.html');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
