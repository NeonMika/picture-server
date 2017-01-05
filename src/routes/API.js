module.exports = function(options) {
    var express = require('express');
    var walk = require('walk'); // Directory walking
    var _ = require('underscore'); // Underscore functions (list selections, etc.)
    var router = express.Router();
    var fileHelper = require('../server/js/file-helper')
    var path = require('path'); // Path concatination

    var uploadDir = options.uploadFolder;
    var photos = null;
    var currentPhotoId = null;
    var lastUpdate = null;

    const root = { root: path.join(__dirname, "..", "..") };

    function initPhotos(finallyFn) {
        fileHelper.getFilePaths(uploadDir, function(files) {
            photos = _.shuffle(files);
            lastUpdate = new Date();
            currentPhotoId = 0;
            finallyFn();
        });
    }

    router.get('/currentId', function(req, res, next) {
        const doIt = () => res.send(String(currentPhotoId));
        if (photos === null) {
            initPhotos(doIt);
        } else {
            doIt();
        }
    });

    router.get('/length', function(req, res, next) {
        //        fileHelper.getFileNumber(uploadedDir, function(n) {
        //            res.send(n);
        //        })
        const doIt = () => res.send(String(photos.length - 1));
        if (photos === null) {
            initPhotos(doIt);
        } else {
            doIt();
        }
    });

    router.get('/currentImage', function(req, res, next) {
        if (photos == null) {
            // Shuffle, start at image 0
            initPhotos(() => {
                res.sendFile(photos[currentPhotoId], root)
                console.log("photos was null, initialized");
            });
            return;
        } else {
            if (new Date() - lastUpdate >= 5000) {
                if (currentPhotoId + 1 == photos.length) {
                    initPhotos(() => {
                        res.sendFile(photos[currentPhotoId], root);
                        console.log("time passed, shuffle, output id 0");
                    });
                    return;
                } else {
                    currentPhotoId++;
                    lastUpdate = new Date();
                    console.log("time passed, photos was updated from id " + (currentPhotoId - 1) + " to " + currentPhotoId + " of max id " + (photos.length - 1));
                }
            }

        }
        res.sendFile(photos[currentPhotoId], root);
    });

    return router;
}
