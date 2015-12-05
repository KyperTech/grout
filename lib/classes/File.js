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

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _firepad = require('firepad');

var _firepad2 = _interopRequireDefault(_firepad);

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
			logger.error({
				description: 'File data is not an object. File data must be an object that includes path and appName.',
				func: 'constructor', obj: 'File'
			});
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
				logger.log({
					description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File'
				});
				return this.app.get().then(function (appData) {
					_this.app = appData;
					logger.log({
						description: 'Application get successful. Getting file.',
						app: appData, func: 'get', obj: 'File'
					});
					return _this.get();
				}, function (err) {
					logger.error({
						description: 'Application Frontend data not available.',
						error: err, func: 'get', obj: 'File'
					});
					return Promise.reject({ message: 'Front end data is required to get file.' });
				});
			} else {
				var _ret = (function () {
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2['default'].config.credentials == 'undefined' || !_awsSdk2['default'].config.credentials) {
						logger.log({
							description: 'AWS creds do not exist, so they are being set.',
							func: 'publish', obj: 'File'
						});
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();
					var getData = {
						Bucket: _this.app.frontend.bucketName,
						Key: _this.path
					};
					//Set contentType from actionData to ContentType parameter of new object
					if (_this.contentType) {
						getData.ContentType = _this.contentType;
					}
					logger.debug({
						description: 'File get params built.', getData: getData,
						file: _this, func: 'get', obj: 'File'
					});
					var finalData = _this;
					return {
						v: new Promise(function (resolve, reject) {
							s3.getObject(getData, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.info({
										description: 'File loaded successfully.',
										data: data, func: 'get', obj: 'File'
									});
									if (_lodash2['default'].has(data, 'Body')) {
										logger.info({
											description: 'File has content.',
											content: data.Body.toString(),
											metaData: data.Metadata.toString(),
											func: 'get', obj: 'File'
										});
										finalData.content = data.Body.toString();
										logger.info({
											description: 'File content has been added to file.',
											file: finalData,
											func: 'get', obj: 'File'
										});
										resolve(finalData);
									} else {
										resolve(data);
									}
								} else {
									logger.error({
										description: 'Error loading file from S3.',
										error: err, func: 'get', obj: 'File'
									});
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
			logger.debug({
				description: 'File publish called.', file: this,
				fileData: fileData, func: 'publish', obj: 'File'
			});
			if (!this.app.frontend) {
				logger.error({
					description: 'Application Frontend data not available. Make sure to call .get().',
					func: 'publish', obj: 'File'
				});
				return Promise.reject({ message: 'Front end data is required to publish file.' });
			} else {
				var _ret2 = (function () {
					if (!_lodash2['default'].has(fileData, ['content', 'path'])) {
						logger.error({
							description: 'File data including path and content required to publish.',
							func: 'publish', obj: 'File'
						});
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
						logger.debug({
							description: 'AWS creds do not exist, so they are being set.',
							func: 'publish', obj: 'File'
						});
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();
					logger.debug({
						description: 'File publish params built.',
						saveParams: saveParams, fileData: _this2,
						func: 'publish', obj: 'File'
					});
					return {
						v: new Promise(function (resolve, reject) {
							s3.putObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.log({
										description: 'File saved successfully.',
										response: data, func: 'publish', obj: 'File'
									});
									resolve(data);
								} else {
									logger.error({
										description: 'Error saving file to S3.',
										error: err, func: 'publish', obj: 'File'
									});
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
					logger.debug({
						description: 'File get params built.',
						saveParams: saveParams, file: _this3,
						func: 'get', obj: 'File'
					});
					return {
						v: new Promise(function (resolve, reject) {
							s3.deleteObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.info({
										description: 'File loaded successfully.',
										fileData: data, func: 'get', obj: 'File'
									});
									if (_lodash2['default'].has(data, 'Body')) {
										logger.info({
											description: 'File has content.',
											fileData: data.Body.toString(), func: 'get', obj: 'File'
										});
										resolve(data.Body.toString());
									} else {
										resolve(data);
									}
								} else {
									logger.error({
										description: 'Error loading file from S3.',
										error: err, func: 'get', obj: 'File'
									});
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
		key: 'openInFirepad',
		value: function openInFirepad(editor) {
			var _this4 = this;

			//Load file contents from s3
			return new Promise(function (resolve, reject) {
				_this4.get().then(function (file) {
					logger.log({
						description: 'File contents loaded. Opening firepad.',
						editor: editor, file: file,
						func: 'openInFirepad', obj: 'File'
					});
					//Open firepad from ace with file content as default
					var firepad = file.firepadFromAce(editor);
					//Wait for firepad to be ready
					firepad.on('ready', function () {
						resolve(file);
						// firepad.setText()
					});
				}, function (err) {
					logger.error({
						description: 'Valid ace editor instance required to create firepad.',
						func: 'openInFirepad', obj: 'File', editor: editor
					});
					reject(err);
				});
			});
		}
	}, {
		key: 'firepadFromAce',
		value: function firepadFromAce(editor) {
			//TODO:Create new Firepad instance within div
			if (!editor || typeof editor.setTheme !== 'function') {
				logger.error({
					description: 'Valid ace editor instance required to create firepad.',
					func: 'fbRef', obj: 'File', editor: editor
				});
				return;
			}
			if (typeof _firepad2['default'].fromACE !== 'function') {
				logger.error({
					description: 'Firepad does not have fromACE method.',
					firepad: _firepad2['default'], func: 'fbRef', obj: 'File'
				});
				return;
			}
			var settings = {};
			if (this.content) {
				settings.defaultText = this.content;
			}
			if (_Matter2['default'].isLoggedIn && _Matter2['default'].currentUser) {
				settings.userId = _Matter2['default'].currentUser.username || _Matter2['default'].currentUser.name;
			}
			logger.log({
				description: 'Creating firepad from ace.',
				settings: settings, func: 'fbRef', obj: 'File'
			});
			return _firepad2['default'].fromACE(this.fbRef, editor, settings);
		}
	}, {
		key: 'getConnectedUsers',
		value: function getConnectedUsers() {
			var _this5 = this;

			return new Promise(function (resolve, reject) {
				_this5.fbRef.child('users').on('value', function (usersSnap) {
					if (usersSnap.val() === null) {
						resolve([]);
					} else {
						(function () {
							var usersArray = [];
							usersSnap.forEach(function (userSnap) {
								var user = userSnap.val();
								user.username = userSnap.key();
								usersArray.push(user);
							});
							logger.log({
								description: 'Connected users array built.',
								users: usersArray, func: 'connectedUsers', obj: 'File'
							});
							resolve(usersArray);
						})();
					}
				}, function (err) {
					logger.error({
						description: 'Error loading connected users.',
						error: err, func: 'connectedUsers', obj: 'File'
					});
					reject(err);
				});
			});
		}
	}, {
		key: 'getDefaultContent',
		value: function getDefaultContent() {
			//TODO: Fill with default data for matching file type
		}
	}, {
		key: 'fileType',
		get: function get() {
			if (this.ext == 'js') {
				return 'javascript';
			} else {
				return this.ext;
			}
		}
	}, {
		key: 'ext',
		get: function get() {
			var re = /(?:\.([^.]+))?$/;
			return re.exec(this.name)[1];
		}
	}, {
		key: 'safePathArray',
		get: function get() {
			var safeArray = this.pathArray.map(function (loc) {
				//Replace periods with colons and other unsafe chars as --
				return loc.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '--');
			});
			logger.log({
				description: 'Safe path array created.',
				safeArray: safeArray, func: 'safePathArray', obj: 'File'
			});
			return safeArray;
		}
	}, {
		key: 'safePath',
		get: function get() {
			return this.safePathArray.join('/');
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			var url = [_config2['default'].fbUrl, 'files', this.app.name, this.safePath].join('/');
			logger.log({
				description: 'File ref url generated',
				url: url, func: 'fbRef', obj: 'File'
			});
			return url;
		}
	}, {
		key: 'fbRef',
		get: function get() {
			logger.log({
				description: 'Fb ref generatating.',
				url: this.fbUrl, func: 'fbRef', obj: 'File'
			});
			return new _firebase2['default'](this.fbUrl);
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