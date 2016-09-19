// Gulp Requires
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    include = require('gulp-include'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    twig = require('gulp-twig'),
    server = lr(),
    webserver = require('gulp-webserver'),
    replace = require('gulp-replace'),
    fs = require('fs');

// Node requires for exec and sys
var exec = require('child_process').exec,
    sys = require('sys');



// Directories
var SRC = 'source',
    DIST = 'dist';

// build the skeleton (wo)man!
gulp.task('compile', function(){
  return gulp.src(SRC + '/twig/*.twig')
    .pipe(twig())
    .pipe(gulp.dest(DIST+'/'));
});

gulp.task('inline_css', ['compile'], function() {
  return gulp.src(DIST + '/*.html')
    .pipe(replace(/<link href="styles\/app.css"[^>]*>/, function(s) {
          var style = fs.readFileSync(DIST + '/styles/app.css', 'utf8');
          return '<style>\n' + style + '\n</style>';
      }))
    .pipe(gulp.dest(DIST+'/'))
    .pipe(livereload(server.listen(44466)));;
})

// give him/her meat on his/her bones!
gulp.task('scss', function(){
  return gulp.src(SRC + '/scss/app.scss')
    .pipe(
      sass({
        outputStyle: 'expanded',
        debugInfo: true,
        lineNumbers: true,
        errLogToConsole: true,
        onSuccess: function(){
          notify().write({ message: "SCSS Compiled successfully!" });
        },
        onError: function(err) {
          gutil.beep();
          notify().write(err);
        }
      })
    )
    .on('error', errorHandler)
    // .pipe(rename({ suffix: '.min' }))
    // .pipe(minifycss())
    .pipe(gulp.dest(DIST + '/styles') )
    .pipe(livereload(server.listen(44466)));
});

//make him/her without fault!
gulp.task('lint', function() {
  return gulp.src(SRC+ '/js/app.js')
    .pipe(include())
      .on('error', console.log)
    // .pipe(jshint())
    // .pipe(jshint.reporter('default', { verbose: true }))
    .pipe(uglify())
    .pipe(gulp.dest(DIST + '/js') )
    .pipe(livereload(server.listen(44466)));
});

// make sure he's clean!
gulp.task('clean', function() {
  return gulp.src(DIST, {read: false})
    .pipe(clean());
});



// Do the creep, ahhhhhhh!
gulp.task('watch', function() {

  // Listen on port 35729
  server.listen(35740, function (err) {
    if (err) {
      return console.log(err);
    }

    // Watch .twig files
    gulp.watch(SRC + '/twig/**/*.twig', ['inline_css']);

    // Watch .scss files
    gulp.watch(SRC + '/scss/**/*.scss', ['scss','inline_css']);

    // Watch .js files
    gulp.watch(SRC + '/js/**/*.js', ['lint']);
  });

});

// give him/her to the world!
gulp.task('webserver', function() {
  gulp.src('./'+DIST+'/')
    .pipe(webserver({
      port: 8100,
      path: '/',
      fallback: '/index.html',
      livereload: true,
      open: true
    }));
})

// Gulp Default Task
gulp.task('default', ['compile', 'scss', 'lint', 'inline_css', 'watch', 'webserver']);


// Handle the error
function errorHandler (error) {
  console.log(error.toString());
  this.emit('end');
}
