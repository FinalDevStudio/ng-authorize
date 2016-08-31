'use strict';

const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const jsdox = require('jsdox');
const gulp = require('gulp');
const del = require('del');

const paths = {
  scripts: 'src/*.js'
};

/**
 * Clean the dist folder.
 */
gulp.task('build:clean', () => {
  del.sync('dist');
});

/**
 * Minify and copy to dist folder.
 */
gulp.task('build:minify', () => {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist/'));
});

/**
 * Beautify and copy to dist folder.
 */
gulp.task('build:beautify', () => {
  return gulp.src(paths.scripts)
    .pipe(uglify({
      mangle: false,
      compress: false,
      output: {
        bracketize: true,
        indent_level: 2,
        beautify: true
      }
    }))
    .pipe(gulp.dest('dist/'));
});

/**
 * Generate documentation.
 */
gulp.task('docs:clean', () => {
  return del.sync('docs/**.*');
});

gulp.task('docs:compile', (done) => {
  jsdox.generateForDir('./src', './docs', null, done);
});

/**
 * Watch for file changes.
 */
gulp.task('watch', ['default'], () => {
  gulp.watch(paths.scripts, ['default']);
});

/* Default task */
gulp.task('default', ['build', 'docs']);
gulp.task('docs', ['docs:clean', 'docs:compile']);
gulp.task('build', ['build:clean', 'build:minify', 'build:beautify']);
