module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify','es6-shim','mocha', 'chai', 'chai-sinon', 'chai-as-promised'],
    files: [
      'src/**/*.js',
      'test/**/*.spec.js',
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.js': 'browserify',
      'test/**/*.js': 'browserify'
    },
    browserify : {
      transform : ['babelify']
    },
    reporters: ['progress'],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // // level of logging
    // // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_ERROR,
    // enable / disable watching file and executing tests whenever any file changes
    // autoWatch: true,
    browsers: ['PhantomJS'],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};