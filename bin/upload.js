(function(){

  var conf = require('../config.json');
  var pkg = require('../package.json');
  var exec = require('child_process').exec;
  var cdnUrl = 'kyper-cdn/js/grout/' + pkg.version + '/';
  var child;
  child = exec('s3-cli --config ~/.s3cfg sync dist s3://' + cdnUrl, function (error) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    console.log('Successfully uploaded to CDN url:', cdnUrl);
  });
})();
