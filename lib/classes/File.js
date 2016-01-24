'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _firebase3 = require('../utils/firebase');

var _firebase4 = _interopRequireDefault(_firebase3);

var _FileSystemEntity2 = require('./FileSystemEntity');

var _FileSystemEntity3 = _interopRequireDefault(_FileSystemEntity2);

var _s = require('../utils/s3');

var S3 = _interopRequireWildcard(_s);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var s3 = S3.init();

var File = function (_FileSystemEntity) {
	_inherits(File, _FileSystemEntity);

	function File(project, path) {
		_classCallCheck(this, File);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(File).call(this, project, path));

		logger.debug({
			description: 'File constructor called with', project: project, path: path,
			func: 'constructor', obj: 'File'
		});
		if (!project) {
			logger.error({
				description: 'Project required to create file.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File must include project.');
		}
		if (!path) {
			logger.error({
				description: 'File must include path.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File must include a path.');
		}
		_this.type = 'file';
		_this.project = project;
		return _this;
	}

	/**
  * @description File's type
  * @return {String}
  */

	_createClass(File, [{
		key: 'get',

		/**
   * @description Get a file's content and meta data from default location (Firebase)
   */
		value: function get() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2.fbRef.once('value', function (fileSnap) {
					// Load file from firepad original content if no history available
					if (fileSnap.hasChild('original') && !fileSnap.hasChild('history')) {
						//File has not yet been opened in firepad
						_this2.content = fileSnap.child('original').val();
						logger.log({
							description: 'File content loaded.',
							content: _this2.content, func: 'get', obj: 'File'
						});
						_this2.headless.setText(_this2.content, function (error) {
							_this2.headless.dispose();
							if (!error) {
								logger.log({
									description: 'File content set to Headless Firepad.',
									func: 'get', obj: 'File'
								});
								resolve(_this2);
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
						_this2.headless.getText(function (text) {
							logger.log({
								description: 'Text loaded from headless',
								text: text, func: 'get', obj: 'File'
							});
							_this2.content = text;
							// this.fbRef.once('value', (fileSnap) => {
							// 	let meta = fileSnap.child('meta').val();
							// });
							_this2.headless.dispose();
							resolve(_this2);
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
   * @description Get project data
   * @return {Promise}
   */

	}, {
		key: 'getProject',
		value: function getProject() {
			var _this4 = this;

			if (this.project && this.project.frontend) {
				return Promise.resolve(this.project);
			}
			logger.log({
				description: 'Application Frontend data not available. Calling applicaiton get.',
				func: 'get', obj: 'File'
			});
			return this.project.get().then(function (appData) {
				_this4.project = appData;
				logger.log({
					description: 'Application get successful. Getting file.',
					app: appData, func: 'get', obj: 'File'
				});
				return _this4.get();
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
   * @description Headless Firepad at file location
   */

	}, {
		key: 'headless',
		get: function get() {
			var firepad = _firebase4.default.getFirepadLib();
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
}(_FileSystemEntity3.default);

exports.default = File;
module.exports = exports['default'];