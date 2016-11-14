/*
 * GET home page.
 */
var request = require('request');
var Firebase = require('firebase');
var path = require('path');
Firebase.initializeApp({
    serviceAccount: path.resolve(__dirname, 'Gluon-3a2ff1f6d836.json'),
    databaseURL: 'https://gluon.firebaseio.com'
});

exports.index = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.render('index', {
        title: 'BBR',
        year: new Date().getFullYear()
    });
};

exports.test = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({
        'payload': req.params.payload,
        'reaching method': 'get',
        'route': 'test',
        'details': 'All working correctly'
    });
};

exports.deleteFirebase = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var messageListRef = Firebase.database().ref('items');
    messageListRef.remove();
    res.json({
        'payload': 'Success',
        'details': 'All working correctly'
    });

    request.post({
            url: 'https://dharasabha.firebaseio.com/.json',
            json: sendUsers
        },
        function(err, httpResponse, body) {
            if (!err && response.statusCode == 200) {
                console.log('Successfully sent to fb server');
            } else {
                console.log('Unable to save data to firebase server');
            }
        });
};

exports.deleteSocketCache = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    request.delete({
            url: 'https://dharasabha.firebaseio.com/.json'
        },
        function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
              res.json({
                  'success': 'Cleared SocketCache',
                  'details': 'All Current Socket cache is pointing to null, Success from our side'
              });
            } else {
              res.json({
                  'error': 'Unable to clear',
                  'details': 'All Current Socket cache is still intact, Something went wrong on our side'
              });
            }
        });
};

exports.getSocketCache = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    request.get({
            url: 'https://dharasabha.firebaseio.com/.json'
        },
        function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
              res.json(body);
            } else {
              res.json({
                  'error': 'Unable to get',
                  'details': 'Something went wrong on our side'
              });
            }
        });
};

exports.testPost = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({
        'payload': req.body.payload,
        'reaching method': 'post',
        'route': 'test',
        'details': 'All working correctly'
    });
};

exports.bufferBasedRouting = function(io) {
    return function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var pickers = [];
        var availableExecutives = [];
        var rejectedBy = ['init'];
        if (!req.body.availabeExecutives) {
            res.json({
                'error': 'Invalid Response, try again',
                'details': 'Argument availabeExecutives not found or response structure not valid'
            });
            return;
        };
        if (req.body.availabeExecutives.length == 0) {
            res.json({
                'error': 'Invalid Response, try again',
                'details': 'Argument availabeExecutives has no Users'
            });
            return;
        };
        if (!req.body.pickupAddress) {
            res.json({
                'error': 'Invalid Response, try again',
                'details': 'Argument pickupAddress not found or response structure not valid'
            });
            return;
        };
        
        for(var i=0;i<req.body.availabeExecutives.length;i++){
          availableExecutives.push(req.body.availabeExecutives[i].userid);
        }

        pickers = req.body.availabeExecutives;
        pickupAddress = req.body.pickupAddress;
        request('http://maps.googleapis.com/maps/api/geocode/json?address=' + pickupAddress, function(error, response, body) {
            if (!error && response.statusCode == 200 && JSON.parse(body).results.length > 0) {
                toSend = JSON.parse(body);
                pickupLat = toSend.results[0].geometry.location.lat;
                pickupLng = toSend.results[0].geometry.location.lng;

                pickers.sort(function(a, w, e, s, o, me) {
                    p = Math.pow((pickupLat - a.latitude), 2);
                    q = Math.pow((pickupLng - a.longitude), 2);
                    r = Math.pow((pickupLat - w.latitude), 2);
                    s = Math.pow((pickupLng - w.longitude), 2);
                    t = Math.pow((p + q), 1 / 2);
                    u = Math.pow((r + s), 1 / 2);
                    return t - u;
                });

                var sendUsers = {
                    orignalBody: req.body,
                    pickers,
                    pickedBy: null,
                    currentPickerIndex: 0,
                    rejectedBy,
                    currentPicker: req.body.availabeExecutives[0].userid,
                    availableExecutives,
                };

                request.post({
                        url: 'https://dharasabha.firebaseio.com/.json',
                        json: sendUsers
                    },
                    function(err, httpResponse, body) {
                        if (!err && httpResponse.statusCode == 200) {
                            console.log('Successfully sent to fb server');
                        } else {
                            console.log('Unable to save data to firebase server');
                        }
                    });

                var messageListRef = Firebase.database().ref('items');
                messageListRef.push(sendUsers, function() {
                    Firebase.database().goOffline();
                });
                res.json(pickers);

            } else {
                res.json({
                    'error': 'Could not Geocode Address'
                });
            }
        });
    }
};
