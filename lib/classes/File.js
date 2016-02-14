'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _firebase = require('../utils/firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _FileSystemEntity2 = require('./FileSystemEntity');

var _FileSystemEntity3 = _interopRequireDefault(_FileSystemEntity2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var File = function (_FileSystemEntity) {
	_inherits(File, _FileSystemEntity);

	function File(project, path, content) {
		_classCallCheck(this, File);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(File).call(this, project, path));

		logger.debug({
			description: 'File constructor called with', project: project, path: path,
			func: 'constructor', obj: 'File'
		});
		_this.entityType = 'file';
		_this.content = content;
		return _this;
	}

	/**
  * @description File's type
  * @return {String}
  */


	_createClass(File, [{
		key: 'getOriginalContent',


		/**
   * @description Get a file's content from default location (Firebase)
   */
		value: function getOriginalContent() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2.fbRef.once('value', function (fileSnap) {
					if (!fileSnap.val()) {
						logger.log({
							description: 'File data does not exist.',
							func: 'get', obj: 'File'
						});
						return reject({ message: 'File data does not exist.' });
					}
					// Load file from firepad original content if no history available
					if (fileSnap.hasChild('original') && !fileSnap.hasChild('history')) {
						//File has not yet been opened in firepad
						_this2.content = fileSnap.child('original').val();
						logger.log({
							description: 'File content loaded.',
							content: _this2.content, func: 'get', obj: 'File'
						});
						return resolve(_this2.content);
					}
					logger.warn({
						description: 'Cannot get content of file with existing firepad content.',
						func: 'get', obj: 'File'
					});
					reject({ message: 'no orignal content or has existing history' });
				});
			});
		}

		/**
   * @description Get content from firepad instance
   */
		// getContent() {
		// 	return new Promise(resolve => {
		// 		let headless = new Firepad.Headless(this.fbRef);
		// 		headless.getText(text => {
		// 			this.content = text;
		// 			resolve(this.content);
		// 		});
		// 	});
		// }

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
				return new Promise(function (resolve) {
					//Open firepad from ace with file content as default
					var fileFirepad = file.firepadFromAce(editor);
					//Wait for firepad to be ready
					fileFirepad.on('ready', function () {
						resolve(file);
						// firepad.setText()
					});
				});
			}, function (error) {
				logger.error({
					description: 'Valid ace editor instance required to create firepad.',
					editor: editor, error: error, func: 'openInFirepad', obj: 'File'
				});
				return Promise.reject(error);
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
			var firepad = _firebase2.default.getLib();
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
	}]);

	return File;
}(_FileSystemEntity3.default);

exports.default = File;
module.exports = exports['default'];