'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _Project = require('./Project');

var _Project2 = _interopRequireDefault(_Project);

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
		value: function addFile(objData) {
			//TODO: Allow for options of where to add the file to
			if ((0, _lodash.isArray)(objData)) {
				return this.upload(objData);
			}
			var file = new _File2.default(this.project, path, name);
			return file.save();
		}

		/**
   * @description Add a folder
   * @param {string} path - Path of where the folder should be saved
   * @param {String} name - optionally provide name of folder
   */

	}, {
		key: 'addFolder',
		value: function addFolder(path, name) {
			var folder = new _Folder2.default(this.project, path, name);
			return folder.save();
		}

		/**
   * @description Add multiple files/folders to project files
   * @param {Array} filesData - Array of file objects to upload
   */

	}, {
		key: 'upload',
		value: function upload(filesData) {
			var _this2 = this;

			//TODO: Allow for options of where to add the file to
			if (!(0, _lodash.isArray)(filesData)) {
				return this.addToFb(filesData);
			} else {
				var _ret = function () {
					logger.warn({
						description: 'Upload called with multiple files.', filesData: filesData,
						project: _this2.project, func: 'upload', obj: 'Directory'
					});
					var promises = [];
					(0, _lodash.each)(filesData, function (file) {
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
			if ((0, _lodash.isArray)(addData)) {
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
		value: function delFromFb(data) {
			logger.debug({
				description: 'Del from fb called.', data: data,
				func: 'delFromFb', obj: 'Directory'
			});
			if (!data || !data.path) {
				logger.error({
					description: 'Invalid file data. Path must be included.',
					func: 'delFromFb', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Invalid file data. Path must be included.'
				});
			}
			var file = new _File2.default({ project: this.project, data: data });
			return new Promise(function (resolve, reject) {
				file.fbRef.remove(fileData, function (err) {
					if (!err) {
						resolve(fileData);
					} else {
						reject(err);
					}
				});
			});
		}

		/**
   * @description Upload a local file to Firebase
   * @param {File} file - Local file with content to be uploaded
   */
		//  TODO: Handle folders

	}, {
		key: 'addLocalToFb',
		value: function addLocalToFb(data) {
			var _this4 = this;

			logger.debug({
				description: 'Add local to fb called.', data: data,
				func: 'addLocalToFb', obj: 'Directory'
			});
			if (!data) {
				logger.error({
					description: 'File is required to upload to Firebase.',
					func: 'addLocalToFb', obj: 'Directory'
				});
				return Promise.reject({
					message: 'File is required to upload to Firebase.'
				});
			}
			return getContentFromFile(data).then(function (content) {
				logger.debug({
					description: 'Content loaded from local file.', content: content,
					func: 'addLocalToFb', obj: 'Directory'
				});
				data.content = content;
				data.path = data.name;
				var file = new _File2.default({ project: _this4.project, data: data });
				logger.info({
					description: 'File object created.', file: file,
					func: 'addLocalToFb', obj: 'Directory'
				});
				return file.save();
			});
		}
	}, {
		key: 'getFrontEnd',
		value: function getFrontEnd() {
			var _this5 = this;

			if (this.project && this.project.frontend) {
				return Promise.resolve(this.project);
			}
			logger.warn({
				description: 'Directory Frontend data not available. Calling .get().',
				project: this.project, func: 'getFromS3', obj: 'Directory'
			});
			return this.project.get().then(function (applicationData) {
				logger.log({
					description: 'Directory get returned.',
					data: applicationData, func: 'getFromS3', obj: 'Directory'
				});
				_this5.project = applicationData;
				if ((0, _lodash.has)(applicationData, 'frontend')) {
					return _this5.get();
				}
				logger.error({
					description: 'Directory does not have Frontend to get files from.',
					func: 'getFromS3', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Directory does not have frontend to get files from.'
				});
			}, function (err) {
				logger.error({
					description: 'Directory Frontend data not available. Make sure to call .get().',
					error: err, func: 'getFromS3', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Bucket name required to get objects'
				});
			});
		}

		/**
   * @description Get files list from S3
   */

	}, {
		key: 'getFromS3',
		value: function getFromS3() {
			if (!this.project || !this.project.frontend || !this.project.frontend.bucketName) {
				logger.warn({
					description: 'Directory Frontend data not available. Calling .get().',
					project: this.project, func: 'getFromS3', obj: 'Directory'
				});
				return this.getFrontEnd().then(this.getFromS3);
			}
			var s3 = S3.init();
			s3.listObjects({ bucket: this.project.frontend.bucketName }).then(function (filesList) {
				logger.info({
					description: 'Directory list loaded.', filesList: filesList,
					func: 'get', obj: 'Directory'
				});
				return filesList;
			}, function (error) {
				logger.error({
					description: 'Error getting files from S3.',
					error: error, func: 'get', obj: 'Directory'
				});
				return Promise.reject(error);
			});
		}

		/**
   * @description build child structure from files list
   */

	}, {
		key: 'buildStructure',
		value: function buildStructure() {
			logger.debug({
				description: 'Build Structure called.',
				func: 'buildStructure', obj: 'Directory'
			});
			return this.get().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Directory'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Directory'
				});
				return childStruct;
			}, function (error) {
				logger.error({
					description: 'Error getting application files.',
					error: error, func: 'buildStructure', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Error getting files.',
					error: error
				});
			});
		}

		/**
   * @description sync file structure from Firebase
   */

	}, {
		key: 'syncStructure',
		value: function syncStructure() {
			//TODO: Determine if it is worth storing this in the built structure
			logger.debug({
				description: 'Build Structure called.',
				func: 'syncStructure', obj: 'Directory'
			});
			return this.sync().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStruct: childStruct, func: 'syncStructure', obj: 'Directory'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStruct: childStruct, func: 'syncStructure', obj: 'Directory'
				});
				return childStruct;
			}, function (error) {
				logger.error({
					description: 'Error getting application files.',
					error: error, func: 'syncStructure', obj: 'Directory'
				});
				return Promise.reject({
					message: 'Error getting files.',
					error: error
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
//------------------ Utility Functions ------------------//

exports.default = Directory;
function getContentFromFile(fileData) {
	//Get initial content from local file
	logger.debug({
		description: 'getContentFromFile called', fileData: fileData,
		func: 'getContentFromFile', obj: 'Directory'
	});
	return new Promise(function (resolve) {
		try {
			var reader = new FileReader();
			logger.debug({
				description: 'reader created', reader: reader,
				func: 'getContentFromFile', obj: 'Directory'
			});
			reader.onload = function (e) {
				var contents = e.target.result;
				logger.debug({
					description: 'Contents loaded', contents: contents,
					func: 'getContentFromFile', obj: 'Directory'
				});
				resolve(contents);
			};
			reader.readAsText(fileData);
		} catch (error) {
			logger.error({
				description: 'Error getting file contents.', error: error,
				func: 'getContentFromFile', obj: 'Directory'
			});
			reject(error);
		}
	});
}
module.exports = exports['default'];