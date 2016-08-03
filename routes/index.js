
/*
 * GET home page.
 */
var request = require('request');

exports.index = function (req, res) {
    res.render('index', { title: 'BBR', year: new Date().getFullYear() });
};

exports.test = function (req, res) {
    res.json({
       'payload':req.params.payload,
       'reaching method':'get',
       'route':'test',
       'details':'All working correctly'
    });
};

exports.testPost = function (req, res) {
    res.json({
       'payload':req.body.payload,
       'reaching method':'post',
       'route':'test',
       'details':'All working correctly'
    });
};

exports.bufferBasedRouting = function (req, res) {
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
    request('http://api.opencagedata.com/geocode/v1/json?q=' + pickupAddress + '&key=93d639c2f2e101a955c9dd2ec8704fca', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            toSend = JSON.parse(body);
            pickupLat = toSend.results[0].geometry.lat;
            pickupLng = toSend.results[0].geometry.lng;
            pickers.sort(function (a, w, e, s, o, me) {
                p = Math.pow((pickupLat - a.latitude), 2);
                q = Math.pow((pickupLng - a.longitude), 2);
                r = Math.pow((pickupLat - w.latitude), 2);
                s = Math.pow((pickupLng - w.longitude), 2);
                t = Math.pow((p + q), 1 / 2);
                u = Math.pow((r + s), 1 / 2);
                return t-u;
            });
            res.json(pickers);
        } else {
            res.json({'error':'Could not Geocode Address'});
        }
    });
};