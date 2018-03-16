var express = require('express');
var app = express();

var hddSpace = require('hdd-space');
//import hddSpace from 'hdd-space';

function getHddSpace(cb) {
  hddSpace({format: 'gb'}, function(info){
    cb(info);
  });
}

app.get('/volumes', function(req, res) {
  res.send('This is the root path.');
});

app.get('/all', function(req, res) {
  getHddSpace(function (spaceInfo) {
    res.send(spaceInfo);
  });
})

app.get('/volumes/:volume', function(req, res) {
  var volume = req.params.volume
  res.send(volume);
});

var server = app.listen(3000, function() {
  console.log('server started...');
});