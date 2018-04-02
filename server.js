var express = require('express');
var app = express();
var _ = require('lodash');
var cors = require('cors');

var hddSpace = require('hdd-space');

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

app.use(cors());

app.get('/', function(req, res) {
  res.send('API access: use /api/volumes');
});

router.get('/', function(req, res) {
  res.send('Welcome to our API.');
});

// return all volumes raw
router.get('/raw-volumes', function(req, res) {
  getHddSpace(function (spaceInfo) {
    res.send(spaceInfo);
  });
})

router.get('/volumes', function(req, res) {
  if (process.platform === 'darwin') {
    var volRex = RegExp('^\/Volumes\/');
    getHddSpace(function (spaceInfo) {
      var resultArr = [];
      spaceInfo.parts.forEach(function(element) {
        if (volRex.test(element.mountOn)) {
          resultArr.push(element);
        }
      });
      res.send(resultArr);
    });
  } else {
    res.redirect('/api/raw-volumes');
  }
})

router.get('/list-volumes', function(req, res) {
  if (process.platform === 'darwin') {
    var volRex = RegExp('^\/Volumes\/');
    getHddSpace(function (spaceInfo) {
      var resultArr = [];
      spaceInfo.parts.forEach(function(element) {
        if (volRex.test(element.mountOn)) {
          resultArr.push(element.mountOn);
        }
      });
      res.send(resultArr);
    });
  } else {
    res.redirect('/api/raw-volumes');
  }
})

// return multiple volumes query.
// EX: http://localhost:8080/api/volumes/multiple?volumes=Engineering1,Engineering2
router.get('/volumes/multiple', function(req, res) {
  //console.log(req.query.volumes.split(','));
  var responseJSON = {
    "volumes": []
  };
  var volArr = req.query.volumes.split(',');
  getHddSpace(function (spaceInfo) {
    var allInfo = spaceInfo.parts.slice();

    volArr.forEach(function (volume) {
      var matchObj = _.find(allInfo, function(volumeObj) {
        return _.last(volumeObj.mountOn.split('/')) === volume;
      });
      console.log(matchObj);
      if (matchObj != undefined) {
        responseJSON["volumes"].push(matchObj);
      }
    });

    if (responseJSON["volumes"].length > 0) {
      res.send(responseJSON);
    } else {
      res.send('volumes ' + volArr + ' were not found.');
    }
  });
});

// return the specified volume obj.
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