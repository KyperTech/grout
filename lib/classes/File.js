'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var firepad = getFirepadLib();

var File = (function () {
	function File(actionData) {
		_classCallCheck(this, File);

		if (!actionData) {
			logger.error({
				description: 'File data that includes path and app is needed to create a File action.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data with path and app is needed to create file action.');
		}
		if (!(0, _lodash.isObject)(actionData)) {
			logger.error({
				description: 'Action data is not an object. Action data must be an object that includes app and fileData.',
				func: 'constructor', obj: 'File'
			});
			//TODO: Get appName from path data?
			throw new Error('File data must be an object that includes path and appName.');
		}
		this.type = 'file';
		if ((0, _lodash.has)(actionData, 'fileData') && (0, _lodash.has)(actionData, 'app')) {
			(0, _lodash.extend)(this, actionData.fileData);
			this.app = actionData.app;
			if (!this.path) {
				if (!this.ref) {
					logger.error({
						description: 'Path or ref required to create file.',
						func: 'constructor', obj: 'File'
					});
					throw new Error('Path or ref required to create file.');
				}
				this.path = this.pathArrayFromRef.join('/');
			}
			this.pathArray = this.path.split('/');
			//Get name from data or from pathArray
			this.name = (0, _lodash.has)(actionData.fileData, 'name') ? actionData.fileData.name : this.pathArray[this.pathArray.length - 1];
		}
		logger.debug({
			description: 'File object constructed.', file: this,
			func: 'constructor', obj: 'File'
		});
	}

	_createClass(File, [{
		key: 'get',
		value: function get() {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_this.fbRef.once('value', function (fileSnap) {
					// Load file from firepad original content if no history available
					if (fileSnap.hasChild('original') && !fileSnap.hasChild('history')) {
						//File has not yet been opened in firepad
						_this.content = fileSnap.child('original').val();
						logger.log({
							description: 'File content loaded.',
							content: _this.content, func: 'get', obj: 'File'
						});
						_this.headless.setText(_this.content, function (err) {
							_this.headless.dispose();
							if (!err) {
								logger.log({
									description: 'File content set to Headless Firepad.',
									func: 'get', obj: 'File'
								});
								resolve(_this);
							} else {
								logger.error({
									description: 'Error setting file text.',
									error: err, func: 'get', obj: 'File'
								});
								reject(err);
							}
						});
					} else {
						//Get firepad text from history
						_this.headless.getText(function (text) {
							logger.log({
								description: 'Text loaded from headless',
								text: text, func: 'get', obj: 'File'
							});
							_this.content = text;
							// this.fbRef.once('value', (fileSnap) => {
							// 	let meta = fileSnap.child('meta').val();
							// });
							_this.headless.dispose();
							resolve(_this);
						});
					}
				});
			});
		}
		//Alias for get

	}, {
		key: 'open',
		value: function open() {
			return this.get;
		}
	}, {
		key: 'add',
		value: function add() {
			return this.addToFb;
		}
	}, {
		key: 'remove',
		value: function remove() {
			return removeFromFb;
		}
	}, {
		key: 'save',
		value: function save() {
			return this.add;
		}
		/**
   * @description Add file to Firebase located at file's fbRef
   */

	}, {
		key: 'addToFb',
		value: function addToFb() {
			var fbData = { meta: { path: this.path } };
			var fbRef = this.fbRef;

			return new Promise(function (resolve, reject) {
				fbRef.set(fbData, function (err) {
					if (!err) {
						logger.info({
							description: 'File successfully added to Firebase.',
							func: 'addToFb', obj: 'Files'
						});
						resolve(fileData);
					} else {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: err, func: 'addToFb', obj: 'Files'
						});
						reject(err);
					}
				});
			});
		}
		/**
   * @description Add file to Firebase located at file's fbRef
   */

	}, {
		key: 'removeFromFb',
		value: function removeFromFb() {
			var fbData = { meta: { path: this.path } };
			var fbRef = this.fbRef;

			return new Promise(function (resolve, reject) {
				fbRef.remove(function (err) {
					if (!err) {
						logger.info({
							description: 'File successfully removed from Firebase.',
							func: 'removeFromFb', obj: 'Files'
						});
						resolve(fileData);
					} else {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: err, func: 'removeFromFb', obj: 'Files'
						});
						reject(err);
					}
				});
			});
		}
	}, {
		key: 'getFromS3',
		value: function getFromS3() {
			var _this2 = this;

			if (!this.app || !this.app.frontend) {
				logger.log({
					description: 'Application Frontend data not available. Calling applicaiton get.',
					func: 'get', obj: 'File'
				});
				return this.app.get().then(function (appData) {
					_this2.app = appData;
					logger.log({
						description: 'Application get successful. Getting file.',
						app: appData, func: 'get', obj: 'File'
					});
					return _this2.get();
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
					if (typeof _awsSdk2.default.config.credentials == 'undefined' || !_awsSdk2.default.config.credentials) {
						logger.log({
							description: 'AWS creds do not exist, so they are being set.',
							func: 'publish', obj: 'File'
						});
						setAWSConfig();
					}
					var s3 = new _awsSdk2.default.S3();
					var getData = {
						Bucket: _this2.app.frontend.bucketName,
						Key: _this2.path
					};
					//Set contentType from actionData to ContentType parameter of new object
					if (_this2.contentType) {
						getData.ContentType = _this2.contentType;
					}
					logger.debug({
						description: 'File get params built.', getData: getData,
						file: _this2, func: 'get', obj: 'File'
					});
					var finalData = _this2;
					return {
						v: new Promise(function (resolve, reject) {
							s3.getObject(getData, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (!err) {
									logger.info({
										description: 'File loaded successfully.',
										data: data, func: 'get', obj: 'File'
									});
									if ((0, _lodash.has)(data, 'Body')) {
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
									reject(err);
								}
							});
						})
					};
				})();

				if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
			}
		}
	}, {
		key: 'saveToS3',
		value: function saveToS3(fileData) {
			var _this3 = this;

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
					if (!(0, _lodash.has)(fileData, ['content', 'path'])) {
						logger.error({
							description: 'File data including path and content required to publish.',
							func: 'publish', obj: 'File'
						});
						return {
							v: Promise.reject({ message: 'File data including path and content required to publish.' })
						};
					}
					var saveParams = {
						Bucket: _this3.app.frontend.bucketName,
						Key: fileData.path,
						Body: fileData.content,
						ACL: 'public-read'
					};
					//Set contentType from fileData to ContentType parameter of new object
					if (_this3.contentType) {
						saveParams.ContentType = _this3.contentType;
					}
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2.default.config.credentials == 'undefined' || !_awsSdk2.default.config.credentials) {
						logger.debug({
							description: 'AWS creds do not exist, so they are being set.',
							func: 'publish', obj: 'File'
						});
						setAWSConfig();
					}
					var s3 = new _awsSdk2.default.S3();
					logger.debug({
						description: 'File publish params built.',
						saveParams: saveParams, fileData: _this3,
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

				if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
			}
		}
	}, {
		key: 'removeFromS3',
		value: function removeFromS3() {
			var _this4 = this;

			if (!this.app || !this.app.frontend) {
				logger.log({
					description: 'Application Frontend data not available. Calling applicaiton get.',
					func: 'removeFromS3', obj: 'File'
				});
				return this.app.get().then(function (appData) {
					_this4.app = appData;
					logger.log({
						description: 'Application get successful. Getting file.',
						app: appData, func: 'removeFromS3', obj: 'File'
					});
					return _this4.get();
				}, function (error) {
					logger.error({
						description: 'Application Frontend data not available. Make sure to call .get().',
						error: error, func: 'removeFromS3', obj: 'File'
					});
					return Promise.reject({
						message: 'Front end data is required to get file.'
					});
				});
			} else {
				var _ret3 = (function () {
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2.default.config.credentials == 'undefined' || !_awsSdk2.default.config.credentials) {
						logger.debug({
							description: 'AWS creds do not exist, so they are being set.',
							func: 'publish', obj: 'File'
						});
						setAWSConfig();
					}
					var s3 = new _awsSdk2.default.S3();
					var saveParams = {
						Bucket: _this4.app.frontend.bucketName,
						Key: _this4.path
					};
					//Set contentType from actionData to ContentType parameter of new object
					if (_this4.contentType) {
						saveParams.ContentType = _this4.contentType;
					}
					logger.debug({
						description: 'File get params built.',
						saveParams: saveParams, file: _this4,
						func: 'get', obj: 'File'
					});
					return {
						v: new Promise(function (resolve, reject) {
							s3.deleteObject(saveParams, function (err, data) {
								//[TODO] Add putting object ACL (make public)
								if (err) {
									logger.error({
										description: 'Error loading file from S3.',
										error: err, func: 'get', obj: 'File'
									});
									return reject(err);
								}
								logger.info({
									description: 'File loaded successfully.',
									fileData: data, func: 'get', obj: 'File'
								});
								if ((0, _lodash.has)(data, 'Body')) {
									logger.info({
										description: 'File has content.',
										fileData: data.Body.toString(), func: 'get', obj: 'File'
									});
									resolve(data.Body.toString());
								} else {
									resolve(data);
								}
							});
						})
					};
				})();

				if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
			}
		}
		/**
   * @description Open file in firepad from already existing ace editor instance
   * @param {Object} Ace editor object
   */

	}, {
		key: 'openInFirepad',
		value: function openInFirepad(editor) {
			var _this5 = this;

			//Load file contents from s3
			return new Promise(function (resolve, reject) {
				_this5.get().then(function (file) {
					logger.warn({
						description: 'File contents loaded. Opening firepad.',
						editor: editor, file: file,
						func: 'openInFirepad', obj: 'File'
					});
					//Open firepad from ace with file content as default
					var fileFirepad = file.firepadFromAce(editor);
					//Wait for firepad to be ready
					fileFirepad.on('ready', function () {
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
		/**
   * @description Create firepad instance from ACE editor
   * @param {Object} Ace editor object
   */

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
			if (typeof firepad.fromACE !== 'function') {
				logger.error({
					description: 'Firepad does not have fromACE method.',
					firepad: firepad, func: 'fbRef', obj: 'File'
				});
				return;
			}
			var settings = {};
			// if (this.content) {
			// 	settings.defaultText = this.content;
			// }
			//Attach logged in user id
			// if (matter.isLoggedIn && matter.currentUser) {
			// 	settings.userId = matter.currentUser.username || matter.currentUser.name;
			// }
			logger.warn({
				description: 'Creating firepad from ace.',
				settings: settings, editor: editor, editorVal: editor.getValue(),
				func: 'fbRef', obj: 'File'
			});
			return firepad.fromACE(this.fbRef, editor, settings);
		}
	}, {
		key: 'getConnectedUsers',
		value: function getConnectedUsers() {
			var _this6 = this;

			return new Promise(function (resolve, reject) {
				_this6.fbRef.child('users').on('value', function (usersSnap) {
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
		key: 'pathArrayFromRef',
		get: function get() {
			if (!this.fbRef) {
				logger.error({
					description: 'File fbRef is required to get path array.', file: this,
					func: 'pathArrayFromRef', obj: 'File'
				});
			}
			return this.fbRef.path.o;
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
			logger.debug({
				description: 'Safe path array created.',
				safeArray: safeArray, func: 'safePathArray', obj: 'File'
			});
			return safeArray;
		}
	}, {
		key: 'safePath',
		get: function get() {
			var safePathArray = this.safePathArray;

			if (safePathArray.length === 1) {
				return safePathArray[0];
			}
			return safePathArray.join('/');
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			if (!this.app || !this.app.name) {
				logger.error({
					description: 'App information needed to generate fbUrl for File.',
					file: this, func: 'fbRef', obj: 'File'
				});
				throw new Error('App information needed to generate fbUrl for File.');
			}
			return [_config2.default.fbUrl, 'files', this.app.name, this.safePath].join('/');
		}
	}, {
		key: 'fbRef',
		get: function get() {
			if (this.ref) {
				logger.log({
					description: 'File already has reference.',
					ref: this.ref, func: 'fbRef', obj: 'File'
				});
				return this.ref;
			}
			// logger.log({
			// 	description: 'Fb ref generated.',
			// 	url: this.fbUrl, func: 'fbRef', obj: 'File'
			// });
			return new _firebase2.default(this.fbUrl);
		}
	}, {
		key: 'headless',
		get: function get() {
			if (typeof firepad === 'undefined' || typeof firepad.Headless !== 'function') {
				logger.error({
					description: 'Firepad is required to get file content.',
					func: 'get', obj: 'File'
				});
				throw Error('Firepad is required to get file content');
			} else {
				return firepad.Headless(this.fbRef);
			}
		}
	}]);

	return File;
})();
//------------------ Utility Functions ------------------//
/**
 * @description Initial AWS Config
 */

exports.default = File;
function setAWSConfig() {
	return _awsSdk2.default.config.update({
		credentials: new _awsSdk2.default.CognitoIdentityCredentials({
			IdentityPoolId: _config2.default.aws.cognito.poolId
		}),
		region: _config2.default.aws.region
	});
}
/**
 * @description Load firepad from local or global
 */
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'fbRef', obj: 'File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.log({
			description: 'Firepad does not currently exist.',
			func: 'fbRef', obj: 'File'
		});
		return null;
		//TODO: Correctly load firepad
		// dom.loadJs('https://cdn.firebase.com/libs/firepad/1.2.0/firepad.js');
		// if (typeof global !== 'undefined' && global.Firepad) {
		// 	return global.Firepad;
		// } else if (typeof window !== 'undefined' && window.Firepad) {
		// 	return window.Firepad;
		// } else {
		// 	logger.error({
		// 		description: 'Adding firepad did not help.',
		// 		func: 'fbRef', obj: 'File'
		// 	});
		// }
	}
}
module.exports = exports['default'];