var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var mocha = require('gulp-mocha');

var package = require('./package.json');

gulp.task('test', function () {
  return gulp.src(['./spec/*.spec.js'], {read: false})
    .pipe(mocha({
      reporter: 'min'
    }));
});

gulp.task('build', function () {
  return browserify('./src/index.js', {
    standalone: package.name
  }).bundle()
    .pipe(source(package.name + '.js'))
    .pipe(gulp.dest('./lib'))
    .pipe(rename(package.name + '.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./lib'));
  // gulp.src(['./src/index.js'])
  //   .pipe(uglify())
  //   .pipe(concat(package.name + '.min.js'))
  //   .pipe(gulp.dest('./lib'));
});

gulp.task('watch', function () {
  gulp.watch('./*.js', ['test']);
  gulp.watch('./spec/*.js', ['test']);
});

gulp.task('default', ['build'], function () {});