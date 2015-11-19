var fs         = require('fs');
var gulp       = require('gulp');
var browserify = require('browserify');
var uglify     = require('gulp-uglify');
var connect    = require('gulp-connect');
var watch      = require('gulp-watch');
var rename     = require('gulp-rename');
var sass       = require('gulp-sass');
var ghPages    = require('gulp-gh-pages');
var env        = process.env.NODE_ENV || 'development';

gulp.task('connect', function () {
  connect.server({
    root: 'build',
    port: process.env.port || 8000,
    livereload: true
  });
});

gulp.task('browserify', function() {
  return browserify('js/app.js').
    transform('babelify', {
      presets: [ 'es2015', 'react' ]
    }).
    bundle().
    on('error', console.error.bind(console)).
    pipe(fs.createWriteStream('build/app.js'));
});

gulp.task('sass', function () {
  return gulp.src('./css/**/*.scss').
    pipe(sass({
      outputStyle: 'compressed',
      includePaths: [ './node_modules/basscss-sass' ]
    })).
    on('error', sass.logError).
    pipe(rename('app.css')).
    pipe(gulp.dest('build'));
});

gulp.task('html', function() {
  return gulp.src('./html/**/*').
    pipe(gulp.dest('build'));
});

gulp.task('reload', function() {
  return gulp.src('./build/**/*').
    pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['js/**/*.js', 'js/**/*.jsx'], function () {
    gulp.start('browserify');
  });
  gulp.watch(['css/**/*.scss'], function () {
    gulp.start('sass');
  });
  gulp.watch([ 'html/**/*' ], function() {
    gulp.start('html');
  });
  gulp.watch([ 'build/**' ], ['reload']);
});

gulp.task('uglify', ['browserify'], function() {
  return gulp.src('build/app.js').
    pipe(uglify()).
    pipe(rename('app.js')).
    pipe(gulp.dest('build'));
});

gulp.task('deploy', ['build', 'uglify'], function() {
  return gulp.src('./build/**').
    pipe(ghPages());
});

gulp.task('build',   ['browserify', 'sass', 'html']);
gulp.task('dev',     ['build', 'connect', 'watch']);
gulp.task('default', ['serve']);