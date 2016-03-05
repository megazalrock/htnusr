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



var jsSrcFileName = 'main.js';
var jsSrcDir = 'src/js/';
var jsDestDir = 'htdocs/js/';
var jsMainFileName = 'main.js';


var lessSrcFileName = 'main.less';
var lessSrcDir = 'src/css/';
var lessDestDir = 'htdocs/css/';
var cssMainFileName = 'main.css';

var props = {
	entries: jsSrcDir + jsSrcFileName,
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
		.pipe(source(jsMainFileName))
		.pipe(gulp.dest(jsDestDir));
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
			.pipe(duration('compiled ' + jsMainFileName))
			.pipe(notify( jsMainFileName + ' is compiled !'));
	});
});

gulp.task('browserify', function () {
	var bundler = browserify(props).transform(babelify, {
		presets: ['es2015', 'react']
	});
	return bundleJs(bundler);
});

gulp.task('less', function () {
	return gulp.src(lessSrcDir + lessSrcFileName)
	.pipe(sourcemaps.init())
	.pipe(less({
		plugins: [autoprefix],
		paths: [lessSrcDir]
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(lessDestDir))
	.pipe(notify( cssMainFileName + ' is compiled !'));
});

gulp.task('lessBuild', function () {
	return gulp.src(lessSrcDir + lessSrcFileName)
	.pipe(less({
		plugins: [autoprefix],
		paths: [lessSrcDir]
	}))
	.pipe(minifyCss())
	.pipe(gulp.dest(lessDestDir));
});


gulp.task('uglify',['browserify'], function () {
	return gulp.src(jsDestDir + jsMainFileName)
		.pipe(uglify())
		.pipe(gulp.dest(jsDestDir))
		.pipe(duration('compressed ' + jsMainFileName));
		/*.pipe(notify( jsMainFileName + ' is compressed !'));*/
});

gulp.task('clean', function () {
	return del.bind([
		jsDestDir + '**/*',
		lessDestDir + '**/*'
	]);
});

gulp.task('buildComplete', function () {
	notifier.notify({
		title : 'Build complited !!!!',
		message : [jsDestDir + jsMainFileName, lessDestDir + cssMainFileName].join('\n'),
		icon: 'node_modules/gulp-notify/assets/gulp.png'
	}, function (err) {
		console.log(err);
	});
});

gulp.task('gzip', function(){
	gulp.src(jsDestDir + jsMainFileName)
		.pipe(gzip())
		.pipe(gulp.dest(jsDestDir));

	gulp.src(lessDestDir + cssMainFileName)
		.pipe(gzip())
		.pipe(gulp.dest(lessDestDir));
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
	gulp.watch([lessSrcDir + '*.less'], ['less']);
});

gulp.task('default', ['watch']);