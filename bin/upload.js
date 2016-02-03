(function(){
  const conf = require('../config.json');
  const pkg = require('../package.json');
  const exec = require('child_process').exec;
  const versionUrl = 'kyper-cdn/js/grout/' + pkg.version + '/';
  const latestUrl = 'kyper-cdn/js/grout/latest/';
  //Upload to version url then to latest url
  uploadToUrl(versionUrl, () => {
    uploadToUrl(latestUrl);
  });
  function uploadToUrl(url, cb){
    console.log('Uploading to:', url);
    var child = exec(`s3-cli --config ~/.s3cfg sync dist s3://${url}`, (error) => {
      if (error !== null) {
        console.log('error uploading to S3 url: ' + url);
        console.log(error.toString() || error);
        throw error;
      }
      console.log('Successfully uploaded to S3 url:', url);
      if(cb){
        cb();
      }
    });
  }
})();
