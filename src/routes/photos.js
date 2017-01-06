module.exports = function(options) {

    var config = require('../config.json')

    var express    = require('express');
    var fs         = require('fs') // File handling
    var multer     = require('multer'); // Used for multi-part parsing
    var path       = require('path'); // Path concatination
    var fileHelper = require('../server/js/file-helper')

    var title = "Upload files"
    var uploadDir = options.uploadFolder
    var multiPartParser = multer({dest: uploadDir})
    var mkdirp = require('mkdirp');
    var router = express.Router();

    /* GET home page. */
    router.get('/', function(req, res, next) {
        fileHelper.getFilePaths(uploadDir, function(files) {
            res.render('index', { preloadState: {owner : config.owner, }});
        });
    });

    /* POST data */
    router.post('/', multiPartParser.array('uploadImages'), function(req, res, next) {
        console.log('POST files:\n' + JSON.stringify(req.files))
        console.log('POST files:')
        console.log(req.files)

        var arrayLength = req.files.length;
        var processFile = function(i, finallyFn) {
            var file = req.files[i]
            if (req.body.dir != "") {
                mkdirp(uploadDir + '/' + req.body.dir, function(err) {
                    if(err) res.json(err)
                    const moveToPath = path.join(uploadDir, req.body.dir, file.originalname);
                    fs.rename(file.path, moveToPath, function (err) {
                        if(err) res.json(err)
                        fileHelper.deleteIfDuplicate(moveToPath, uploadDir);
                    });
                });
            } else {
            const moveToPath = path.join(uploadDir, file.originalname);
            fs.rename(file.path, moveToPath, function (err) {
                if(err) res.json(err)
                fileHelper.deleteIfDuplicate(moveToPath, uploadDir);
            });
            }
            finallyFn()
        }

        var processFiles = function(i) {
            processFile(i, function() {
                i = i + 1;
                if(i < arrayLength) {
                    processFiles(i)
                } else {
                    fileHelper.getFilePaths(uploadDir, function(files) {
                      res.render('index', { preloadState: {title: title, owner : "", photos: files }});
                    });
                }
            })
        }

        if(arrayLength > 0) {
            processFiles(0)
        }
    });

    return router;
}