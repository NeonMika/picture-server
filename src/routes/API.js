module.exports = function (options) {
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
        fileHelper.getFilePaths(uploadDir, function (files) {
            photos = _.shuffle(files);
            lastUpdate = new Date();
            currentPhotoId = photos.length > 0 ? 0 : null;
            finallyFn();
        });
    }

    router.get('/currentId', function (req, res, next) {
        const doIt = () => res.send(String(currentPhotoId));
        if (photos === null) {
            initPhotos(doIt);
        } else {
            doIt();
        }
    });

    router.get('/imagePaths', function (req, res, next) {
        const doIt = () => res.json(photos);
        if (photos === null) {
            initPhotos(doIt);
        } else {
            doIt();
        }
    });

    router.get('/length', function (req, res, next) {
        //        fileHelper.getFileNumber(uploadedDir, function(n) {
        //            res.send(n);
        //        })
        const doIt = () => res.send(String(photos.length));
        if (photos === null) {
            initPhotos(doIt);
        } else {
            doIt();
        }
    });

    router.get('/currentImage', function (req, res, next) {
        if (photos === null) {
            // Shuffle, start at image 0
            initPhotos(() => {
                if (currentPhotoId != null) {
                    res.sendFile(photos[currentPhotoId], root)
                    console.log("photos was null, initialized and first image sent");
                } else {
                    res.send("")
                    console.log("photos was null, initialized, but not images found");
                }
            });
            return;
        } else {
            if (new Date() - lastUpdate >= 5000) {
                if (currentPhotoId === null || currentPhotoId + 1 == photos.length) {
                    initPhotos(() => {
                        if (currentPhotoId != null) {
                            res.sendFile(photos[currentPhotoId], root);
                            console.log("time passed, shuffle, output id 0");
                        } else {
                            res.send("");
                            console.log("time passed, shuffle, no images found");
                        }
                    });
                    return;
                } else {
                    currentPhotoId++;
                    lastUpdate = new Date();
                    console.log("time passed, photos was updated from id " + (currentPhotoId - 1) + " to " + currentPhotoId + " of max id " + (photos.length - 1));
                }
            }

        }
        if (currentPhotoId != null) {
            res.sendFile(photos[currentPhotoId], root);
        } else {
            res.send("")
        }
    });

    return router;
}
