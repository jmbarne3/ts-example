var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    bless = require('gulp-bless'),
    notify = require('gulp-notify'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    sourcemap = require('gulp-sourcemaps'),
    scsslint = require('gulp-scss-lint'),
    tsc = require('gulp-typescript-compiler'),
    tsd = require('gulp-tsd'),
    tslint = require('gulp-tslint');
    
var config = {
  sassPath: './src/scss',
  cssOutPath: './static/css',
  tsPath: './src/ts',
  jsPath: './src/js',
  jsOutPath: './static/js',
  fontPath: './static/fonts',
  bowerPath: './src/components'
};

gulp.task('bower', function() {
  bower()
    .pipe(gulp.dest(config.bowerPath));  
});

gulp.task('files', ['bower'], function() {
  gulp.src(config.bowerPath + '/bootstrap-sass-official/assets/fonts/*/*')
    .pipe(gulp.dest(config.fontPath));
    
  gulp.src(config.bowerPath + '/font-awesome/fonts/*')
    .pipe(gulp.dest(config.fontPath + '/font-awesome')); 
});

gulp.task('tsd', ['files'], function(callback) {
  tsd({
    command: 'reinstall',
    config: './tsd.json'
  }, callback);
});

gulp.task('ts-lint', ['files'], function() {
  gulp.src(config.tsPath + '/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

var tsCompile = function() {
  gulp.src(config.tsPath + '/app.ts', {read: false})
    .pipe(tsc({
      module: 'commonjs',
      target: 'ES5',
      sourcemap: false,
      logErrors: true,
      resolve: true
    }))
    .pipe(sourcemap.init())
    .pipe(concat('ucfsearch.min.js'))
    .pipe(uglify())
    .pipe(sourcemap.write('/'))
    .pipe(gulp.dest(config.jsOutPath));
};

gulp.task('ts-default', ['bower', 'files', 'ts-lint'], tsCompile);

gulp.task('ts', ['ts-lint'], tsCompile);

gulp.task('scss-lint', function() {
  gulp.src(config.sassPath + '/*.scss')
    .pipe(scsslint()); 
});

var scssCompile = function() {
  gulp.src(config.sassPath + '/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename('style.min.css'))
    .pipe(bless())
    .pipe(gulp.dest(config.cssOutPath));
};

gulp.task('css-default', ['bower', 'files', 'scss-lint'], scssCompile);

gulp.task('css', ['scss-lint'], scssCompile);

gulp.task('jshint', function() {
  gulp.src(config.jsPath + '/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail')); 
});

var jsCompile = function() {
  var compile = [
    config.bowerPath + '/bootstrap-sass-official/assets/javascripts/bootstrap.js',
    config.jsPath + '/script.js'  
  ];
  
  gulp.src(compile)
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.jsOutPath));
};

gulp.task('js-default', ['bower', 'files', 'jshint'], jsCompile);

gulp.task('js', ['jshint'], jsCompile);

gulp.task('watch', function() {
  gulp.watch(config.sassPath + '/*.scss', ['css']);
  gulp.watch(config.jsPath + '/*.js', ['js']);
  gulp.watch(config.tsPath + '/**/*.ts', ['ts']);
});

gulp.task('default', ['bower', 'files', 'tsd', 'css-default', 'js-default', 'ts-default']);
