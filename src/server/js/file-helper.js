var fs = require('fs') // File handling
var walk = require('walk'); // Directory walking
var path = require('path'); // Path concatination

module.exports = {

    getFileNumber: function(dir, finallyFn) {
        getFilePaths(dir, (x) => {
            console.log(x);
            finallyFn(x.length);
        });
    },

    getFilePaths: function(dir, finallyFn) {
        var files = [];

        // Walker options
        var walker = walk.walk(dir, { followLinks: false });

        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
            files.push(path.join(root, stat.name).replace(/\\/g, "/"));
            next();
        });

        walker.on('end', function() {
            finallyFn(files)
        });
    },

    deleteIfDuplicate: function(filePath, dir, finallyFn) {
        var baseStat = fs.statSync(filePath)

        // Walker options
        var walker = walk.walk(dir, { followLinks: false });

        walker.on('file', function(root, stat, next) {
            let fullpathCompareFile = path.join(root, stat.name);
            if (baseStat.size == stat.size && filePath != fullpathCompareFile) {
                console.log("size matching, compare " + filePath + " to " + fullpathCompareFile)
                let
                    fd1 = fs.openSync(filePath, 'r'),
                    fd2 = fs.openSync(fullpathCompareFile, 'r'),
                    buffer1 = Buffer.alloc(baseStat.size),
                    buffer2 = Buffer.alloc(stat.size);

                fs.readSync(fd1, buffer1, 0, buffer1.length, 0);
                fs.readSync(fd2, buffer2, 0, buffer2.length, 0);

                fs.closeSync(fd1);
                fs.closeSync(fd2);

                if (buffer1.equals(buffer2)) {
                    fs.unlinkSync(filePath);
                    console.log("File has been duplicate -> Not accepted");
                } else {
                    next();
                }
            } else {
                next();
            }
        });
    }
}
