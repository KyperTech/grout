Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

//Convenience vars
var logger = _Matter2['default'].utils.logger;

var File = (function () {
	function File(actionData) {
		_classCallCheck(this, File);

		if (actionData && _lodash2['default'].isObject(actionData) && _lodash2['default'].has(actionData, 'fileData') && _lodash2['default'].has(actionData, 'app')) {
			_lodash2['default'].extend(this, actionData.fileData);
			this.app = actionData.app;
			this.pathArray = this.path.split('/');
			//Get name from data or from pathArray
			this.name = _lodash2['default'].has(actionData.fileData, 'name') ? actionData.fileData.name : this.pathArray[this.pathArray.length - 1];
		} else if (actionData && !_lodash2['default'].isObject(actionData)) {
			logger.error({ description: 'File data is not an object. File data must be an object that includes path and appName.', func: 'constructor', obj: 'File' });
			//TODO: Get appName from path data?
			throw new Error('File data must be an object that includes path and appName.');
		} else {
			logger.error({ description: 'File data that includes path and app is needed to create a File action.', func: 'constructor', obj: 'File' });
			throw new Error('File data with path and app is needed to create file action.');
		}
		this.type = 'file';
		logger.debug({ description: 'File object constructed.', file: this, func: 'constructor', obj: 'File' });
	}

	_createClass(File, [{
		key: 'get',
		value: function get() {
			var _this = this;

			if (!this.app || !this.app.frontend) {
				logger.log({ description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File' });
				return this.app.get().then(function (appData) {
					_this.app = appData;
					logger.log({ description: 'Application get successful. Getting file.', app: appData, func: 'get', obj: 'File' });
					return _this.get();
				}, function (err) {
					logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', error: err, func: 'get', obj: 'File' });
					return Promise.reject({ message: 'Front end data is required to get file.' });
				});
			} else {
				var _ret = (function () {
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2['default'].config.credentials == 'undefined' || !_awsSdk2['default'].config.credentials) {
						logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();
					var saveParams = {
						Bucket: _this.app.frontend.bucketName,
						Key: _this.path
					};
					//Set contentType from actionData to ContentType parameter of new object
					if (_this.contentType) {
						saveParams.ContentType = _this.contentType;
					}
					logger.debug({ description: 'File get params built.', saveParams: saveParams, file: _this, func: 'get', obj: 'File' });
					return {
						v: new Promise(function (resolve, reject) {
							s3.getObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.info({ description: 'File loaded successfully.', fileData: data, func: 'get', obj: 'File' });
									if (_lodash2['default'].has(data, 'Body')) {
										logger.info({ description: 'File has content.', fileData: data.Body.toString(), func: 'get', obj: 'File' });
										resolve(data.Body.toString());
									} else {
										resolve(data);
									}
								} else {
									logger.error({ description: 'Error loading file from S3.', error: err, func: 'get', obj: 'File' });
									return reject(err);
								}
							});
						})
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			}
		}

		//Alias for get
	}, {
		key: 'open',
		value: function open() {
			return this.get();
		}
	}, {
		key: 'publish',
		value: function publish(fileData) {
			var _this2 = this;

			//TODO: Publish file to application
			logger.debug({ description: 'File publish called.', file: this, fileData: fileData, func: 'publish', obj: 'File' });
			if (!this.app.frontend) {
				logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', func: 'publish', obj: 'File' });
				return Promise.reject({ message: 'Front end data is required to publish file.' });
			} else {
				var _ret2 = (function () {
					if (!_lodash2['default'].has(fileData, ['content', 'path'])) {
						logger.error({ description: 'File data including path and content required to publish.', func: 'publish', obj: 'File' });
						return {
							v: Promise.reject({ message: 'File data including path and content required to publish.' })
						};
					}
					var saveParams = {
						Bucket: _this2.app.frontend.bucketName,
						Key: fileData.path,
						Body: fileData.content,
						ACL: 'public-read'
					};
					//Set contentType from fileData to ContentType parameter of new object
					if (_this2.contentType) {
						saveParams.ContentType = _this2.contentType;
					}
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2['default'].config.credentials == 'undefined' || !_awsSdk2['default'].config.credentials) {
						logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();

					logger.debug({ description: 'File publish params built.', saveParams: saveParams, fileData: _this2, func: 'publish', obj: 'File' });
					return {
						v: new Promise(function (resolve, reject) {
							s3.putObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.log({ description: 'File saved successfully.', response: data, func: 'publish', obj: 'File' });
									resolve(data);
								} else {
									logger.error({ description: 'Error saving file to S3.', error: err, func: 'publish', obj: 'File' });
									reject(err);
								}
							});
						})
					};
				})();

				if (typeof _ret2 === 'object') return _ret2.v;
			}
		}
	}, {
		key: 'del',
		value: function del() {
			var _this3 = this;

			if (!this.app || !this.app.frontend) {
				logger.log({ description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File' });
				return this.app.get().then(function (appData) {
					_this3.app = appData;
					logger.log({ description: 'Application get successful. Getting file.', app: appData, func: 'get', obj: 'File' });
					return _this3.get();
				}, function (err) {
					logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', error: err, func: 'get', obj: 'File' });
					return Promise.reject({ message: 'Front end data is required to get file.' });
				});
			} else {
				var _ret3 = (function () {
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2['default'].config.credentials == 'undefined' || !_awsSdk2['default'].config.credentials) {
						logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();
					var saveParams = {
						Bucket: _this3.app.frontend.bucketName,
						Key: _this3.path
					};
					//Set contentType from actionData to ContentType parameter of new object
					if (_this3.contentType) {
						saveParams.ContentType = _this3.contentType;
					}
					logger.debug({ description: 'File get params built.', saveParams: saveParams, file: _this3, func: 'get', obj: 'File' });
					return {
						v: new Promise(function (resolve, reject) {
							s3.deleteObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.info({ description: 'File loaded successfully.', fileData: data, func: 'get', obj: 'File' });
									if (_lodash2['default'].has(data, 'Body')) {
										logger.info({ description: 'File has content.', fileData: data.Body.toString(), func: 'get', obj: 'File' });
										resolve(data.Body.toString());
									} else {
										resolve(data);
									}
								} else {
									logger.error({ description: 'Error loading file from S3.', error: err, func: 'get', obj: 'File' });
									return reject(err);
								}
							});
						})
					};
				})();

				if (typeof _ret3 === 'object') return _ret3.v;
			}
		}
	}, {
		key: 'getTypes',
		value: function getTypes() {
			//Get content type and file type from extension
		}
	}, {
		key: 'openWithFirepad',
		value: function openWithFirepad() {
			//TODO:Create new Firepad instance within div
		}
	}, {
		key: 'getDefaultContent',
		value: function getDefaultContent() {
			//TODO: Fill with default data for matching file type
		}
	}, {
		key: 'ext',
		get: function get() {
			var re = /(?:\.([^.]+))?$/;
			this.ext = re.exec(this.name)[1];
		}
	}]);

	return File;
})();

exports['default'] = File;

//------------------ Utility Functions ------------------//

// AWS Config
function setAWSConfig() {
	_awsSdk2['default'].config.update({
		credentials: new _awsSdk2['default'].CognitoIdentityCredentials({
			IdentityPoolId: _config2['default'].aws.cognito.poolId
		}),
		region: _config2['default'].aws.region
	});
}
module.exports = exports['default'];