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
    messageListRef.remove(0);
    res.json({
        'payload': 'Success',
        'details': 'All working correctly'
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
        if (!req.body.availabeExecutives) {
            res.json({
                'error': 'Invalid Response, try again',
                'details': 'Argument availabeExecutives not found or response structure not valid'
            });
        };
        if (!req.body.pickupAddress) {
            res.json({
                'error': 'Invalid Response, try again',
                'details': 'Argument pickupAddress not found or response structure not valid'
            });
        };
        pickers = req.body.availabeExecutives;
        pickupAddress = req.body.pickupAddress;
        request('http://api.opencagedata.com/geocode/v1/json?q=' + pickupAddress + '&key=93d639c2f2e101a955c9dd2ec8704fca', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                toSend = JSON.parse(body);
                pickupLat = toSend.results[0].geometry.lat;
                pickupLng = toSend.results[0].geometry.lng;

                pickers.sort(function(a, w, e, s, o, me) {
                    p = Math.pow((pickupLat - a.latitude), 2);
                    q = Math.pow((pickupLng - a.longitude), 2);
                    r = Math.pow((pickupLat - w.latitude), 2);
                    s = Math.pow((pickupLng - w.longitude), 2);
                    t = Math.pow((p + q), 1 / 2);
                    u = Math.pow((r + s), 1 / 2);
                    return t - u;
                });

                res.json(pickers);
                var sendUsers = {
                    orignalBody: req.body,
                    pickers
                };
                var messageListRef = Firebase.database().ref('items');
                messageListRef.push(sendUsers);
                io.sockets.emit('sendUsers', sendUsers);
            }
            else {
                res.json({
                    'error': 'Could not Geocode Address'
                });
            }
        });
    }
};