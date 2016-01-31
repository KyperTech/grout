'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _File = require('./File');

var _File2 = _interopRequireDefault(_File);

var _Folder = require('./Folder');

var _Folder2 = _interopRequireDefault(_Folder);

var _s = require('../utils/s3');

var S3 = _interopRequireWildcard(_s);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var Directory = function () {
	function Directory(project) {
		_classCallCheck(this, Directory);

		logger.debug({
			description: 'Directory object constructed.',
			func: 'constructor', obj: 'Directory', dir: this
		});
		if (!project) {
			throw new Error('Project is required to create directory');
		}
		this.project = project;
	}

	/**
  * @description Firebase reference of directory
  */

	_createClass(Directory, [{
		key: 'get',

		/**
   * @description Get files list single time
   */
		value: function get() {
			var _this = this;

			logger.log({
				description: 'Directory get called.',
				func: 'get', obj: 'Directory'
			});
			return new Promise(function (resolve) {
				_this.fbRef.once('value', function (filesSnap) {
					logger.info({
						description: 'Directory loaded from firebase.',
						func: 'get', obj: 'Directory'
					});
					var filesArray = [];
					filesSnap.forEach(function (objSnap) {
						var objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : { path: objSnap.key() };
						//TODO: Have a better fallback for when meta does not exist
						// if (!objData.path) {
						// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
						// }
						objData.key = objSnap.key();
						filesArray.push(objData);
					});
					logger.debug({
						description: 'Directory array built.',
						filesArray: filesArray, func: 'get', obj: 'Directory'
					});
					resolve(filesArray);
				});
			});
		}

		/**
   * @description Get synced files list from firebase
   */

	}, {
		key: 'sync',
		value: function sync(callback) {
			// TODO: get files list from firebase
			logger.debug({
				description: 'Directory sync called.',
				func: 'sync', obj: 'Directory'
			});
			this.listenerCallback = callback;
			return this.fbRef.on('value', this.listenerCallback);
		}

		/**
   * @description Get synced files list from firebase
   */

	}, {
		key: 'unsync',
		value: function unsync() {
			// TODO: get files list from firebase
			logger.debug({
				description: 'Directory sync called.',
				func: 'sync', obj: 'Directory'
			});
			return this.fbRef.off('value', this.listenerCallback);
		}

		/**
   * @description Add a new file or files
   * @param {Object|Array} fileData - Array of objects or single object containing file data
   * @param {Object} fileData.path - Path of file relative to project
   */

	}, {
		key: 'addFile',
		value: function addFile(path, content) {
			var file = new _File2.default(this.project, path, content);
			return file.save();
		}

		/**
   * @description Add a folder
   * @param {string} path - Path of where the folder should be saved
   * @param {String} name - optionally provide name of folder
   */

	}, {
		key: 'addFolder',
		value: function addFolder(path) {
			var folder = new _Folder2.default(this.project, path);
			return folder.save();
		}

		/**
   * @description Add multiple files/folders to project files
   * @param {Array} files - Array of file objects to upload
   */

	}, {
		key: 'upload',
		value: function upload(files) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				resolve(console.log('files', files));
			});
			//TODO: Allow for options of where to add the file to
			if (!(0, _isArray2.default)(files)) {
				return this.addToFb(files);
			} else {
				var _ret = function () {
					logger.warn({
						description: 'Upload called with multiple files.', files: files,
						project: _this2.project, func: 'upload', obj: 'Directory'
					});
					var promises = [];
					(0, _each2.default)(files, function (file) {
						promises.push(_this2.addToFb(file));
					});
					return {
						v: Promise.all(promises).then(function (resultsArray) {
							logger.info({
								description: 'Directory uploaded successfully.', resultsArray: resultsArray,
								func: 'upload', obj: 'Directory'
							});
							return Promise.resolve(_this2);
						})
					};
				}();

				if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
			}
		}

		/**
   * @description Remove object from files (folder or file)
   */

	}, {
		key: 'remove',
		value: function remove(objData) {
			//TODO: Delete file from S3 as well if it exists
			return this.delFromFb(objData);
		}

		/**
   * @description Add a file to Firebase
   * @param {Object} fileData - Data object for new file
   * @param {String} fileData.path - Path of file within project
   * @param {String} fileData.content - Content of file
   */

	}, {
		key: 'addToFb',
		value: function addToFb(addData) {
			var _this3 = this;

			logger.debug({
				description: 'Add to fb called.', addData: addData,
				func: 'addToFb', obj: 'Directory'
			});
			if (!addData) {
				logger.debug({
					description: 'Object data is required to add.', addData: addData,
					func: 'addToFb', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Object data is required to add.'
				});
			}
			//Array of files/folder to upload
			if ((0, _isArray2.default)(addData)) {
				var _ret2 = function () {
					var promises = [];
					addData.forEach(function (file) {
						promises.push(_this3.addToFb(file));
					});
					return {
						v: Promise.all(promises)
					};
				}();

				if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
			}
			var size = addData.size;
			var path = addData.path;
			var name = addData.name;
			var type = addData.type;

			if (size) {
				return this.addLocalToFb(addData);
			}
			if (!path) {
				logger.error({
					description: 'Invalid file data. Path must be included.',
					func: 'addToFb', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Invalid file data. Path must be included.'
				});
			}
			if (type && type === 'folder') {
				return new _Folder2.default(this.project, path, name).save();
			} else {
				return new _File2.default(this.project, path, name).save();
			}
		}

		/**
   * @description Delete a file or folder from Firebase
   * @param {Object} objData - Data of file or folder
   * @param {String} path - Path of file or folder
   */

	}, {
		key: 'delFromFb',
		value: function delFromFb(path) {
			logger.debug({
				description: 'Del from fb called.', path: path,
				func: 'delFromFb', obj: 'Directory'
			});
			if (!path || !(0, _isString2.default)(path)) {
				logger.error({
					description: 'Invalid file path. Path must be included.',
					func: 'delFromFb', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Invalid file path. Path must be included to delete.'
				});
			}
			var file = new _File2.default(this.project, path);
			return new Promise(function (resolve, reject) {
				file.fbRef.remove(file, function (err) {
					if (err) {
						logger.error({
							description: 'Error deleting from Firebase.',
							func: 'delFromFb', obj: 'Directory'
						});
						return reject(err);
					}
					logger.info({
						description: 'Successfully deleted.',
						func: 'delFromFb', obj: 'Directory'
					});
					resolve({ message: 'Delete successful.' });
				});
			});
		}
	}, {
		key: 'fbRef',
		get: function get() {
			logger.debug({
				description: 'Url created for directory fbRef.',
				url: this.project.fbRef, func: 'fbRef', obj: 'Directory'
			});
			return this.project.fbRef;
		}
	}]);

	return Directory;
}();

exports.default = Directory;
module.exports = exports['default'];