var config = require('../config.json')

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { preloadState: {title: config.ownerTitle + ' Webcenter', owner : config.owner, photos: [] }});
});

module.exports = router;
