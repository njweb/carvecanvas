var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var babel = require('babel-register');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var concat = require('gulp-concat');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');

var pkg = require('./package.json');

gulp.task('build_libs', function () {
  return browserify('./src/index.js', {
    standalone: pkg.name
  })
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(source(pkg.name + '.js'))
    .pipe(gulp.dest('./lib'))
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./lib'));
});

gulp.task('spec', function () {
  return gulp.src(['./spec/*.spec.js'], {read: false})
    .pipe(mocha({reporter: 'min', compilers: {js: babel}}));
});

gulp.task('watch', function () {
  gulp.watch('./src/*.js', ['spec']);
  gulp.watch('./spec/*.js', ['spec']);
});

gulp.task('default', ['build_libs'], function () {});