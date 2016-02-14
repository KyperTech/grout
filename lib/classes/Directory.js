'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _File2 = require('./File');

var _File3 = _interopRequireDefault(_File2);

var _Folder = require('./Folder');

var _Folder2 = _interopRequireDefault(_Folder);

var _jszip = require('jszip');

var _jszip2 = _interopRequireDefault(_jszip);

var _nodeSafeFilesaver = require('node-safe-filesaver');

var _nodeSafeFilesaver2 = _interopRequireDefault(_nodeSafeFilesaver);

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
  * @description File within directory
  */


	_createClass(Directory, [{
		key: 'File',
		value: function File(path) {
			var file = new _File3.default(this.project, path);
			logger.debug({
				description: 'Projects file action called.',
				path: path, project: this, file: file,
				func: 'File', obj: 'Directory'
			});
			return file;
		}

		/**
   * @description Firebase reference of directory
   */

	}, {
		key: 'get',


		/**
   * @description Get directory
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
					_this.fbData = filesSnap.val();
					resolve(_this);
				});
			});
		}

		/**
   * @description Download files from firebase
   */

	}, {
		key: 'downloadFiles',
		value: function downloadFiles() {
			var _this2 = this;

			logger.debug({
				description: 'Download files called.',
				func: 'downloadFiles', obj: 'Directory'
			});

			return this.get().then(function (directory) {
				directory = directory.fbData;
				var zip = new _jszip2.default();
				var promiseArray = [];
				var handleZip = function handleZip(fbChildren) {
					(0, _each2.default)(fbChildren, function (child) {
						if (!child.meta || child.meta.entityType === 'folder') {
							delete child.meta;
							return handleZip(child);
						}
						var promise = _this2.File(child.meta.path).getContent().then(function (content) {
							return zip.file(child.meta.path, content);
						});
						promiseArray.push(promise);
					});
				};
				handleZip(directory);
				return Promise.all(promiseArray).then(function () {
					var content = zip.generate({ type: 'blob' });
					return _nodeSafeFilesaver2.default.saveAs(content, _this2.project.name + '-devShare-export.zip');
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
			var file = new _File3.default(this.project, path, content);
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
			var _this3 = this;

			//TODO: Allow for options of where to add the file to
			if (!(0, _isArray2.default)(files)) {
				return this.addToFb(files);
			} else {
				var _ret = function () {
					logger.warn({
						description: 'Upload called with multiple files.', files: files,
						project: _this3.project, func: 'upload', obj: 'Directory'
					});
					var promises = [];
					(0, _each2.default)(files, function (file) {
						promises.push(_this3.addToFb(file));
					});
					return {
						v: Promise.all(promises).then(function (resultsArray) {
							logger.info({
								description: 'Directory uploaded successfully.', resultsArray: resultsArray,
								func: 'upload', obj: 'Directory'
							});
							return Promise.resolve(_this3);
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
			var _this4 = this;

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
						promises.push(_this4.addToFb(file));
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
				return new _File3.default(this.project, path, name).save();
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
			var file = new _File3.default(this.project, path);
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