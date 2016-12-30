module.exports = function(options) {
    var express    = require('express');
    var walk       = require('walk'); // Directory walking
    var _          = require('underscore'); // Underscore functions (list selections, etc.)
    var router     = express.Router();
    var fileHelper = require('../server/js/file-helper')
    var path       = require('path'); // Path concatination

    var uploadDir = options.uploadFolder;
    var photos = null;
    var currentPhotoId = null;
    var lastUpdate = null;

    const root = {root: path.join(__dirname,"..","..")};

    router.get('/currentId', function(req, res, next) {
        res.send(String(currentPhotoId));
    });

    router.get('/length', function(req, res, next) {
        res.send(String(photos.length - 1));
    });

    router.get('/currentImage', function(req, res, next) {
        function initPhotos(files) {
            photos = _.shuffle(files);
            lastUpdate = new Date();
            currentPhotoId = 0;
            res.sendFile(photos[currentPhotoId], root)
        }
        
        if(photos == null) {
            // Shuffle, start at image 0
            fileHelper.getFilePaths(uploadDir, function(files) {
                initPhotos(files);
            });
            console.log("photos was null, initialized");
            return;
        } else {
            if(new Date() - lastUpdate >= 5000) {
                if(currentPhotoId + 1 == photos.length) {
                    fileHelper.getFilePaths(uploadDir, function (files) {
                        initPhotos(files);
                    });
                    console.log("time passed, shuffle, output id 0");
                    return;
                } else {
                    currentPhotoId++;
                    lastUpdate = new Date();
                    console.log("time passed, photos was updated from id " + (currentPhotoId - 1) + " to " + currentPhotoId + " of max id " + (photos.length -1));
                }
            }

        }
        res.sendFile(photos[currentPhotoId], root)
    });

    return router;
}