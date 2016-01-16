'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _Files = require('./Files');

var _Files2 = _interopRequireDefault(_Files);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _s = require('../utils/s3');

var S3 = _interopRequireWildcard(_s);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var s3 = S3.init();

var File = function () {
	function File(actionData) {
		_classCallCheck(this, File);

		logger.debug({
			description: 'File constructor called with', actionData: actionData,
			func: 'constructor', obj: 'File'
		});
		if (!actionData || !(0, _lodash.isObject)(actionData)) {
			logger.error({
				description: 'File data that includes path and app is needed to create a File action.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data with path and app is needed to create file action.');
		}
		var data = actionData.data;
		var project = actionData.project;

		if (!data) {
			logger.error({
				description: 'Action data must be an object that includes data.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data must be an object that includes data.');
		}
		if (!project) {
			logger.error({
				description: 'Action data must be an object that includes project.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data must be an object that includes project.');
		}
		this.type = 'file';
		this.project = project;
		(0, _lodash.extend)(this, data);
		if (!this.path) {
			if (!this.ref && !this.name) {
				logger.error({
					description: 'Path, name, or ref required to create a file object.',
					func: 'constructor', obj: 'File'
				});
				throw new Error('Path or ref required to create file.');
			}
			this.path = this.name ? this.name : this.pathArrayFromRef.join('/');
		}
		this.pathArray = this.path.split('/');
		if (!this.name) {
			//Get name from data or from pathArray
			this.name = this.pathArray[this.pathArray.length - 1];
		}
		logger.debug({
			description: 'File object constructed.', file: this,
			func: 'constructor', obj: 'File'
		});
	}
	/**
  * @description File's path in array form
  * @return {Array}
  */

	_createClass(File, [{
		key: 'get',

		/**
   * @description Get a file's content and meta data from default location (Firebase)
   */
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
						_this.headless.setText(_this.content, function (error) {
							_this.headless.dispose();
							if (!error) {
								logger.log({
									description: 'File content set to Headless Firepad.',
									func: 'get', obj: 'File'
								});
								resolve(_this);
							} else {
								logger.error({
									description: 'Error setting file text.',
									error: error, func: 'get', obj: 'File'
								});
								reject(error);
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
		/**
   * @description Open a file from default location (Firebase) (Alias for get)
   */

	}, {
		key: 'open',
		value: function open() {
			return this.get();
		}
		/**
   * @description Remove a file from default location (Firebase)
   */

	}, {
		key: 'remove',
		value: function remove(removeData) {
			return this.removeFromFb(removeData);
		}
		/**
   * @description Save file to default location (Firebase)
   */

	}, {
		key: 'add',
		value: function add() {
			return this.addToFb();
		}
		/**
   * @description Save file to default location (Firebase)
   */

	}, {
		key: 'save',
		value: function save() {
			return this.add();
		}
		/**
   * @description Add file to Firebase located at file's fbRef
   */

	}, {
		key: 'addToFb',
		value: function addToFb() {
			logger.debug({
				description: 'addToFb called.', file: this,
				func: 'addToFb', obj: 'File'
			});
			var fbRef = this.fbRef;
			var path = this.path;
			var fileType = this.fileType;
			var content = this.content;
			var name = this.name;

			var fbData = { meta: { path: path, fileType: fileType, name: name } };
			if (content) {
				fbData.original = content;
			}
			return new Promise(function (resolve, reject) {
				fbRef.set(fbData, function (error) {
					if (!error) {
						logger.info({
							description: 'File successfully added to Firebase.',
							func: 'addToFb', obj: 'File'
						});
						resolve(fbData);
					} else {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: error, func: 'addToFb', obj: 'File'
						});
						reject(error);
					}
				});
			});
		}
		/**
   * @description Remove file from Firebase
   */

	}, {
		key: 'removeFromFb',
		value: function removeFromFb() {
			var _this2 = this;

			logger.debug({
				description: 'Remove File from Firebase called.',
				func: 'removeFromFb', obj: 'File'
			});
			return new Promise(function (resolve, reject) {
				_this2.fbRef.remove(function (error) {
					if (error) {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: error, func: 'removeFromFb', obj: 'File'
						});
						return reject(error);
					}
					logger.info({
						description: 'File successfully removed from Firebase.',
						file: _this2, func: 'removeFromFb', obj: 'File'
					});
					resolve(_this2);
				});
			});
		}
		/**
   * @description Open file in firepad from already existing ace editor instance
   * @param {Object} Ace editor object
   */

	}, {
		key: 'openInFirepad',
		value: function openInFirepad(editor) {
			return this.get().then(function (file) {
				logger.info({
					description: 'File contents loaded. Opening firepad.',
					editor: editor, file: file, func: 'openInFirepad', obj: 'File'
				});
				//Open firepad from ace with file content as default
				var fileFirepad = file.firepadFromAce(editor);
				//Wait for firepad to be ready
				fileFirepad.on('ready', function () {
					resolve(file);
					// firepad.setText()
				});
			}, function (error) {
				logger.error({
					description: 'Valid ace editor instance required to create firepad.',
					editor: editor, error: error, func: 'openInFirepad', obj: 'File'
				});
				reject(error);
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
					func: 'fbRef', obj: 'File'
				});
				return;
			}
			var firepad = getFirepadLib();
			if (typeof firepad.fromACE !== 'function') {
				logger.error({
					description: 'Firepad does not have fromACE method.',
					firepad: firepad, func: 'fbRef', obj: 'File'
				});
				return;
			}
			var settings = {};
			//TODO: Set settings.defaultText with original file content if no history exists
			//Attach logged in user id
			if (_Matter2.default.isLoggedIn && _Matter2.default.currentUser) {
				settings.userId = _Matter2.default.currentUser.username || _Matter2.default.currentUser.name;
			}
			logger.debug({
				description: 'Creating firepad from ace.',
				settings: settings, editor: editor, func: 'fbRef', obj: 'File'
			});
			return firepad.fromACE(this.fbRef, editor, settings);
		}
		/**
   * @description Get users currently connected to file
   * @return {Promise}
   */

	}, {
		key: 'getConnectedUsers',
		value: function getConnectedUsers() {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				_this3.fbRef.child('users').on('value', function (usersSnap) {
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
								usersArray: usersArray, func: 'connectedUsers', obj: 'File'
							});
							resolve(usersArray);
						})();
					}
				}, function (error) {
					logger.error({
						description: 'Error loading connected users.',
						error: error, func: 'connectedUsers', obj: 'File'
					});
					reject(error);
				});
			});
		}
		/**
   * @description Get file from S3
   * @param {Object} getData - Object containg data of file
   * @param {String} getData.path - Path of file
   * @return {Promise}
   */

	}, {
		key: 'getFromS3',
		value: function getFromS3(getData) {
			var _this4 = this;

			return this.getProject().then(function (project) {
				var filesGetParams = { bucket: project.frontend.bucketName, path: _this4.path };
				logger.debug({
					description: 'File get params built.', getData: getData,
					file: _this4, func: 'getFromS3', obj: 'File'
				});
				return s3.getObject(filesGetParams).then(function (s3File) {
					(0, _lodash.extend)(_this4, s3File);
					logger.info({
						description: 'File loaded from s3.', s3File: s3File,
						file: _this4, func: 'getFromS3', obj: 'File'
					});
					return _this4;
				}, function (error) {
					logger.error({
						description: 'Error getting file from s3.',
						file: _this4, func: 'getFromS3', obj: 'File'
					});
					return Promise.reject(error);
				});
			}, function (error) {
				return Promise.reject(error);
			});
		}
		/**
   * @description Save file to S3
   * @param {Object} saveData - Object containg new file's data
   * @param {String} saveData.content - String content of file
   * @param {String} saveData.contentType - File's content type
   * @return {Promise}
   */

	}, {
		key: 'saveToS3',
		value: function saveToS3(saveData) {
			var _this5 = this;

			return this.getProject().then(function (project) {
				var content = saveData.content;
				var contentType = saveData.contentType;

				var saveData = {
					bucket: project.frontend.bucketName,
					path: _this5.path,
					content: content
				};
				if (contentType) {
					saveData.contentType = contentType;
				}
				return s3.saveObject(saveData);
			}, function (error) {
				return Promise.reject(error);
			});
		}
		/**
   * @description Remove file from S3
   * @return {Promise}
   */

	}, {
		key: 'removeFromS3',
		value: function removeFromS3() {
			var _this6 = this;

			return this.getProject().then(function (project) {
				var saveParams = {
					Bucket: _this6.project.frontend.bucketName,
					Key: _this6.path
				};
				logger.debug({
					description: 'File get params built.',
					saveParams: saveParams, file: _this6, func: 'get', obj: 'File'
				});
				return s3.deleteObject(saveParams).then(function (deletedFile) {
					logger.info({
						description: 'File loaded successfully.',
						deletedFile: deletedFile, func: 'get', obj: 'File'
					});
					resolve(deletedFile);
				}, function (error) {
					return Promise.reject(error);
				});
			}, function (error) {
				return Promise.reject(error);
			});
		}
		/**
   * @description Get project data
   * @return {Promise}
   */

	}, {
		key: 'getProject',
		value: function getProject() {
			var _this7 = this;

			if (this.project && this.project.frontend) {
				return Promise.resolve(this.project);
			}
			logger.log({
				description: 'Application Frontend data not available. Calling applicaiton get.',
				func: 'get', obj: 'File'
			});
			return this.project.get().then(function (appData) {
				_this7.project = appData;
				logger.log({
					description: 'Application get successful. Getting file.',
					app: appData, func: 'get', obj: 'File'
				});
				return _this7.get();
			}, function (error) {
				logger.error({
					description: 'Application Frontend data not available.',
					error: error, func: 'get', obj: 'File'
				});
				return Promise.reject({
					message: 'Front end data is required to get file.'
				});
			});
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
		/**
   * @description File's type
   * @return {String}
   */

	}, {
		key: 'fileType',
		get: function get() {
			if (this.ext == 'js') {
				return 'javascript';
			} else {
				return this.ext;
			}
		}
		/**
   * @description File's extension
   * @return {String}
   */

	}, {
		key: 'ext',
		get: function get() {
			var re = /(?:\.([^.]+))?$/;
			return re.exec(this.name)[1];
		}
		/**
   * @description Array of file's path in a format that is safe for Firebase
   * @return {Array}
   */

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
		/**
   * @description File's path in a format that is safe for Firebase
   * @return {String}
   */

	}, {
		key: 'safePath',
		get: function get() {
			var safePathArray = this.safePathArray;

			if (safePathArray.length === 1) {
				return safePathArray[0];
			}
			return safePathArray.join('/');
		}
		/**
   * @description File's Firebase url
   * @return {String}
   */

	}, {
		key: 'fbUrl',
		get: function get() {
			if (!this.project || !this.project.name) {
				logger.error({
					description: 'App information needed to generate fbUrl for File.',
					file: this, func: 'fbUrl', obj: 'File'
				});
				throw new Error('App information needed to generate fbUrl for File.');
			}
			var files = new _Files2.default({ project: this.project });
			var url = [files.fbUrl, this.safePath].join('/');
			logger.debug({
				description: 'FbUrl created for file.', url: url, file: this,
				func: 'fbUrl', obj: 'File'
			});
			return url;
		}
		/**
   * @description File's Firebase reference
   * @return {Object} Firebase reference
   */

	}, {
		key: 'fbRef',
		get: function get() {
			if (this.ref) {
				logger.debug({
					description: 'File already has reference.',
					ref: this.ref, func: 'fbRef', obj: 'File'
				});
				return this.ref;
			}
			logger.debug({
				description: 'Fb ref generated.',
				url: this.fbUrl, func: 'fbRef', obj: 'File'
			});
			return new _firebase2.default(this.fbUrl);
		}
		/**
   * @description Headless Firepad at file location
   */

	}, {
		key: 'headless',
		get: function get() {
			var firepad = getFirepadLib();
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
}();
/**
 * @description Load firepad from local or global
 */

exports.default = File;
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'File => getFirepadLib', file: 'classes/File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.debug({
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