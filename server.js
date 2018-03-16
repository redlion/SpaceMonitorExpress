var express = require('express');
var app = express();
var _ = require('lodash');

var hddSpace = require('hdd-space');
//import hddSpace from 'hdd-space';

var port = process.env.PORT || 8080;

function getHddSpace(cb) {
  hddSpace({format: 'gb'}, function(info){
    cb(info);
  });
}

// Routes for the API
// /api/volumes                 all volumes
// /api/volumes/:volume         specific volume

var router = express.Router();

app.get('/', function(req, res) {
  res.send('API access: use /api/volumes');
});

router.get('/', function(req, res) {
  res.send('Welcome to our API.');
});

router.get('/volumes', function(req, res) {
  getHddSpace(function (spaceInfo) {
    res.send(spaceInfo);
  });
})

router.get('/volumes/:volume', function(req, res) {
  var volume = req.params.volume;
  getHddSpace(function (spaceInfo) {
    var allInfo = spaceInfo.parts;
    var matchedObj = _.find(allInfo, function(volumeObj) {
      return _.last(volumeObj.mountOn.split('/')) === volume;
    });
    if(matchedObj) {
      res.send(matchedObj);
    } else {
      res.send('volume: ' + volume + ' is not found.');
    };
  });
});

app.use('/api', router);

var server = app.listen(port, function() {
  console.log('server started...');
});