"use strict";

const
	webpack = require("webpack-stream"),
	gulp = require("gulp"),
	babel = require("gulp-babel"),
	sass = require("gulp-sass"),
    sourcemaps = require('gulp-sourcemaps');

gulp.task("sass", function() {
	return gulp.src("src/www/css/site.scss")
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on("error", function() {
			console.dir(arguments);
		})
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www/css"));
});

gulp.task("babel", function() {

	return gulp.src(["src/www/js/**/*.jsx","src/www/js/**/*.js"])
		.pipe(sourcemaps.init())
		.pipe(babel({
			plugins: ["transform-react-jsx"],
			presets: ["es2015", "react", "stage-0"]
		}))
		.on("error", function() {
			console.dir(arguments);
		})
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www/js"));

});

gulp.task("webpack", ["babel"], function() {

	return gulp.src("./dist/www/js/site.js")
		.pipe(sourcemaps.init())
		.pipe(webpack({
			output: {
				filename: "site-webpack.js"
			},
			devtool: 'source-map',
		}))
		.on("error", function() {
			console.dir(arguments);
		})
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("./dist/www/js"));

});

gulp.task("copy", function() {

	gulp.src("node_modules/bootstrap/dist/css/**/*")
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www/css"));
	
	gulp.src("node_modules/react-bootstrap/dist/**/*.js")
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www/js"));

	gulp.src("src/www/**/*.html")
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www"));
		
	gulp.src("src/www/img/*")
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/www/img"));

	gulp.src(["src/**/*","!src/www/**/*"])
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist"));

});

gulp.task("server", function() {
	require("./index.js");
});

gulp.task("build", ["sass", "webpack", "copy"]);

gulp.task("default", ["build"], function () {
	gulp.watch("src/www/css/site.scss", ["sass"]);
	gulp.watch(["src/www/js/**/*.jsx","src/www/js/**/*.js"], ["webpack"]);
	gulp.watch(["node_modules/bootstrap/dist/css/**/*"], ["copy"]);
	gulp.watch(["src/www/**/*"], ["copy"]);
	gulp.watch(["src/**/*","!src/www/**/*"], ["copy"]);

});
