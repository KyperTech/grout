// Load Gulp and all of our Gulp plugins
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

// Load other npm modules
const del = require('del');
const glob = require('glob');
const path = require('path');
const isparta = require('isparta');
const browserSync = require('browser-sync');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const rollup = require('rollup');
const browserify = require('browserify');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const awspublish = require('gulp-awspublish');
const KarmaServer = require('karma').Server;

// Gather the library data from `package.json`
const manifest = require('./package.json');
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));
const conf = require('./config.json');
const _ = require('lodash');
const shell = require('gulp-shell');

// JS files that should be watched
const mainFiles = ['src/**/*.js', 'src/classes/**/*.js'];

// Locations/Files to watch along with main files
const watchFiles = ['package.json', '**/.eslintrc', '.jscsrc', 'test/**/*'];
const ignoreFiles = ['dist/**/*.js', 'examples/**', 'node_modules/**'].map(function(location){return '!' + location;});

//Create CDN Publisher
var publisher = CDNPublisher();

//Run test once using Karma and exit
gulp.task('test', function (done) {
  require('babel-core/register');
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
//Run test with mocha and generate code coverage with istanbul
gulp.task('coverage', ['lint-src', 'lint-test'], function(done) {
  require('babel-core/register');
  gulp.src(['src/**/*.js', '!gulpfile.js', '!dist/**/*.js', '!examples/**', '!node_modules/**'])
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
});

// Release a new version of the package
gulp.task('release', function(callback) {
  const tagCreate = 'git tag -a v' + manifest.version + ' -m ' + 'Version v' + manifest.version;
  const tagPush = 'git push --tags';
  //Bump package version
  //Unlink local modules
  //Build (test/build:main/build:bundle)
  //Upload to CDN locations
  //Create a git tag and push the tag
  //TODO: Look into what should be moved to happening after travis build
  //TODO: Include 'npm publish', 'git commit' and 'git push'?
  runSequence('bump', 'unlink', 'build', 'upload',  shell.task([tagCreate, tagPush]), callback);
});

// Basic usage:
// Will patch the version
gulp.task('bump', function(){
  gulp.src('./component.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

//Upload to both locations of CDN
gulp.task('upload', function (callback) {
  runSequence('upload:version', 'upload:latest', callback);
});

//Upload to CDN under version
gulp.task('upload:version', function() {
  return gulp.src('./' + conf.distFolder + '/**')
    .pipe($.rename(function (path) {
      path.dirname = conf.cdn.path + '/' + manifest.version + '/' + path.dirname;
    }))
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
});
//Upload to CDN under "/latest"
gulp.task('upload:latest', function() {
  return gulp.src('./' + conf.distFolder + '/**')
    .pipe($.rename(function (path) {
      path.dirname = conf.cdn.path + '/latest/' + path.dirname;
    }))
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
});

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Lint our source code
createLintTask('lint-src', ['src/**/*.js']);

// Lint our test code
createLintTask('lint-test', ['test/**/*.js', '!test/coverage/**']);

//Link list of modules
gulp.task('link', shell.task(buildLinkCommands('link')));

//Unlink list of modules
gulp.task('unlink', shell.task(buildLinkCommands('unlink')));

// An alias of test
gulp.task('default', ['coverage', 'build']);

//----------------------- Utility Functions -------------------------------\\
function buildLinkCommands(linkAction){
  //TODO: Don't allow package types that don't follow standard link/unlink pattern
  // const allowedPackageLinkTypes = ['bower', 'npm'];
  if(!linkAction){
    linkAction = 'link';
  }
  const linkTypes = _.keys(conf.linkedModules);
  const messageCommand = 'echo ' + linkAction + 'ing local modules';
  var commands = [messageCommand];
  //Each type of packages to link
  _.each(linkTypes, function (packageType){
    //Check that package link patter is supported
    // if(!_.contains(allowedPackageLinkTypes, packageType)){
    //   console.error('Invalid package link packageType');
    //   return;
    // }
    //Each package of that packageType
    _.each(conf.linkedModules[packageType], function (packageName){
      commands.push(packageType + ' ' + linkAction  + ' ' + packageName);
      if(linkAction === 'unlink'){
        commands.push(packageType + ' install ' + packageName);
      }
    });
  });
  return commands;
}
function CDNPublisher () {
  var s3Config = {
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    params:{
      Bucket:conf.cdn.bucketName
    }
  };
  return awspublish.create(s3Config);
}
// Send a notification when JSCS fails,
// so that you know your changes didn't build
function jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failOnError())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify));
  });
}

//Run tests sepeartley with mocha (for coverage)
function test() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}));
}
