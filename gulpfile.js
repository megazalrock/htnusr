"use strict";
var gulp = require('gulp');

var del = require('del');
var path = require('path');
var source = require('vinyl-source-stream');

var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');

var duration = require('gulp-duration');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var LessPluginAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessPluginAutoprefix({browsers: ['last 2 versions']});

var sourcemaps = require('gulp-sourcemaps');
var gzip = require('gulp-gzip');

var runSequence = require('run-sequence');

var notifier = require('node-notifier');
var notify = require('gulp-notify');

var FilePath = function(dir, filename){
	this.dir = dir;
	this.filename = filename;
};

FilePath.prototype.path = function(){
	return this.dir + this.filename;
};

var js = {
	src : new FilePath('src/js/', 'main.js'),
	dest: new FilePath('htdocs/js/', 'main.js')
};

var less = {
	src : new FilePath('src/css/', 'main.less'),
	dest: new FilePath('htdocs/css/', 'main.css')
};

var props = {
	entries: js.src.path(),
	debug: true,
	cache: {},
	packageCache: {},
	fullPath: true
};

function bundleJs(bundler) {
	return bundler.bundle()
		.on('error', function (e) {
			console.log(e.message);
			console.log(e.codeFrame);
			notifier.notify({
				title : 'Error : ' + path.basename(e.filename) + ' ' + e.loc.line + ':' + e.loc.column,
				message : e.filename,
				icon: 'node_modules/gulp-notify/assets/gulp-error.png'
			}, function (err) {
				console.log(err);
			});
			this.emit('end');
		})
		.pipe(source(js.dest.filename))
		.pipe(gulp.dest(js.dest.dir));
}

gulp.task('watchify', function () {
	var bundler = watchify(
		browserify(props).transform(babelify, {
			presets: ['es2015', 'react']
		})
	);
	bundleJs(bundler);
	bundler.on('update', function () {
		bundleJs(bundler)
			.pipe(duration('compiled ' + js.src.filename))
			.pipe(notify( js.src.filename + ' is compiled !'));
	});
});

gulp.task('browserify', function () {
	var bundler = browserify(props).transform(babelify, {
		presets: ['es2015', 'react']
	});
	return bundleJs(bundler);
});

gulp.task('less', function () {
	return gulp.src(less.src.path())
	.pipe(sourcemaps.init())
	.pipe(less({
		plugins: [autoprefix],
		paths: [less.src.dir]
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(less.dest.dir))
	.pipe(notify( less.dest.filename + ' is compiled !'));
});

gulp.task('lessBuild', function () {
	return gulp.src(less.src.path())
	.pipe(less({
		plugins: [autoprefix],
		paths: [less.src.dir]
	}))
	.pipe(minifyCss())
	.pipe(gulp.dest(less.dest.dir));
});


gulp.task('uglify', ['browserify'], function () {
	return gulp.src(js.dest.path())
		.pipe(uglify())
		.pipe(gulp.dest(js.dest.dir))
		.pipe(duration('compressed ' + js.src.filename));
		/*.pipe(notify( jsMainFileName + ' is compressed !'));*/
});

gulp.task('clean', function () {
	return del.bind([
		js.dest.dir + '**/*',
		less.dest.dir + '**/*'
	]);
});

gulp.task('buildComplete', function () {
	notifier.notify({
		title : 'Build complited !!!!',
		message : [js.dest.path(), less.dest.path()].join('\n'),
		icon: 'node_modules/gulp-notify/assets/gulp.png'
	}, function (err) {
		console.log(err);
	});
});

gulp.task('gzip', function(){
	gulp.src(js.dest.path())
		.pipe(gzip())
		.pipe(gulp.dest(js.dest.dir));

	gulp.src(less.dest.path())
		.pipe(gzip())
		.pipe(gulp.dest(less.dest.dir));
});


gulp.task('build', function (callback) {
	return runSequence(
		'clean',
		['uglify', 'lessBuild'],
		'gzip',
		'buildComplete',
		callback
	);
});

gulp.task('watch', ['watchify'] , function () {
	gulp.watch([less.src.dir + '*.less'], ['less']);
});

gulp.task('default', ['watch']);