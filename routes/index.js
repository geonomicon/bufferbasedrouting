
/*
 * GET home page.
 */
var request = require('request');

exports.index = function (req, res) {
    res.render('index', { title: 'BBR', year: new Date().getFullYear() });
};

exports.bufferBasedRouting = function (req, res) {
    var pickers = [];
    req.params.users = pickers;
    pickupAddress = req.params.pickupAddress;
    request('http://api.opencagedata.com/geocode/v1/json?q=' + pickupAddress + '&key=93d639c2f2e101a955c9dd2ec8704fca', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            toSend = JSON.parse(body);
            pickupLat = toSend.results[0].geometry.lat;
            pickupLng = toSend.results[0].geometry.lng;
        }
    });
    pickers.sort(function (a, b) {
        return Math.pow((Math.pow(pickupLat - a.latitude), 2) - Math.pow((pickupLng - a.longitude), 2), 1 / 2) - Math.pow((Math.pow(pickupLat - b.latitude), 2) - Math.pow((pickupLng - b.longitude), 2), 1 / 2);
    });
    res.json(pickers);
};