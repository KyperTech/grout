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

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

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

var Files = function () {
	function Files(filesData) {
		_classCallCheck(this, Files);

		if (!filesData || !(0, _lodash.has)(filesData, 'project')) {
			logger.error({
				description: 'Action data object with name is required to start a Files Action.',
				func: 'constructor', obj: 'Files'
			});
			throw new Error('Files Data object with name is required to start a Files action.');
		}
		(0, _lodash.extend)(this, filesData);
		logger.debug({
			description: 'Files object constructed.',
			func: 'constructor', obj: 'Files', files: this
		});
	}
	/**
  * @description Firebase URL for files list
  */

	_createClass(Files, [{
		key: 'get',

		/**
   * @description Get files list single time
   */
		value: function get() {
			var _this = this;

			logger.log({
				description: 'Files get called.',
				func: 'get', obj: 'Files'
			});
			return new Promise(function (resolve) {
				_this.fbRef.once('value', function (filesSnap) {
					logger.info({
						description: 'Files loaded from firebase.',
						func: 'get', obj: 'Files'
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
						description: 'Files array built.',
						filesArray: filesArray, func: 'get', obj: 'Files'
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
		value: function sync() {
			var _this2 = this;

			// TODO: get files list from firebase
			logger.debug({
				description: 'Files sync called.',
				func: 'sync', obj: 'Files'
			});
			return new Promise(function (resolve) {
				_this2.fbRef.on('value', function (filesSnap) {
					logger.info({
						description: 'Files synced with Firebase.',
						func: 'sync', obj: 'Files'
					});
					var filesArray = [];
					// let filesPathArray =  this.pathArrayFromFbRef;
					filesSnap.forEach(function (objSnap) {
						var objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : { path: objSnap.key() };
						//TODO: Have a better fallback for when meta does not exist
						// if (!objData.path) {
						// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
						// }
						objData.key = objSnap.key();
						filesArray.push(objData);
					});
					logger.log({
						description: 'Files array built.',
						filesArray: filesArray, func: 'get', obj: 'Files'
					});
					resolve(filesArray);
				});
			});
		}
		/**
   * @description Add a new file or files
   * @param {Object|Array} fileData - Array of objects or single object containing file data
   * @param {Object} fileData.path - Path of file relative to project
   */

	}, {
		key: 'add',
		value: function add(objData) {
			//TODO: Allow for options of where to add the file to
			if ((0, _lodash.isArray)(objData)) {
				return this.upload(objData);
			}
			return this.addToFb(objData);
		}
		/**
   * @description Add multiple files/folders to project files
   * @param {Array} filesData - Array of file objects to upload
   */

	}, {
		key: 'upload',
		value: function upload(filesData) {
			var _this3 = this;

			//TODO: Allow for options of where to add the file to
			if (!(0, _lodash.isArray)(filesData)) {
				return this.addToFb(filesData);
			} else {
				var _ret = function () {
					logger.warn({
						description: 'Upload called with multiple files.', filesData: filesData,
						project: _this3.project, func: 'upload', obj: 'Files'
					});
					var promises = [];
					(0, _lodash.each)(filesData, function (file) {
						promises.push(_this3.addToFb(file));
					});
					return {
						v: Promise.all(promises).then(function (resultsArray) {
							logger.info({
								description: 'Files uploaded successfully.', resultsArray: resultsArray,
								func: 'upload', obj: 'Files'
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
   * @description Alias for remove
   */

	}, {
		key: 'del',
		value: function del(objData) {
			//TODO: Delete file from S3 as well if it exists
			return this.remove(objData);
		}
	}, {
		key: 'publish',
		value: function publish() {
			//TODO: Publish all files
		}
	}, {
		key: 'addFolder',
		value: function addFolder(folderData) {
			console.log('folder data commin in hot', folderData);
			var dataObj = folderData;
			dataObj.app = this;
			var folder = new _Folder2.default({ project: this, name: dataObj.name, path: dataObj.path });
			return folder.save();
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
				func: 'addToFb', obj: 'Files'
			});
			if (!addData) {
				logger.debug({
					description: 'Object data is required to add.', addData: addData,
					func: 'addToFb', obj: 'Files'
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
					func: 'addToFb', obj: 'Files'
				});
				return Promise.reject({
					message: 'Invalid file data. Path must be included.'
				});
			}
			var newData = { project: this.project, data: { path: path } };
			if (name) {
				newData.data.name = name;
			}
			if (type && type === 'folder') {
				return new _Folder2.default(newData).save();
			} else {
				return new _File2.default(newData).save();
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
				func: 'delFromFb', obj: 'Files'
			});
			if (!data || !data.path) {
				logger.error({
					description: 'Invalid file data. Path must be included.',
					func: 'delFromFb', obj: 'Files'
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

	}, {
		key: 'addLocalToFb',
		value: function addLocalToFb(data) {
			var _this5 = this;

			logger.debug({
				description: 'Add local to fb called.', data: data,
				func: 'addLocalToFb', obj: 'Files'
			});
			if (!data) {
				logger.error({
					description: 'File is required to upload to Firebase.',
					func: 'addLocalToFb', obj: 'Files'
				});
				return Promise.reject({
					message: 'File is required to upload to Firebase.'
				});
			}
			return getContentFromFile(data).then(function (content) {
				logger.debug({
					description: 'Content loaded from local file.', content: content,
					func: 'addLocalToFb', obj: 'Files'
				});
				data.content = content;
				data.path = data.name;
				var file = new _File2.default({ project: _this5.project, data: data });
				logger.info({
					description: 'File object created.', file: file,
					func: 'addLocalToFb', obj: 'Files'
				});
				return file.save();
			});
		}
	}, {
		key: 'getFrontEnd',
		value: function getFrontEnd() {
			var _this6 = this;

			if (this.project && this.project.frontend) {
				return Promise.resolve(this.project);
			}
			logger.warn({
				description: 'Files Frontend data not available. Calling .get().',
				project: this.project, func: 'getFromS3', obj: 'Files'
			});
			return this.project.get().then(function (applicationData) {
				logger.log({
					description: 'Files get returned.',
					data: applicationData, func: 'getFromS3', obj: 'Files'
				});
				_this6.project = applicationData;
				if ((0, _lodash.has)(applicationData, 'frontend')) {
					return _this6.get();
				}
				logger.error({
					description: 'Files does not have Frontend to get files from.',
					func: 'getFromS3', obj: 'Files'
				});
				return Promise.reject({
					message: 'Files does not have frontend to get files from.'
				});
			}, function (err) {
				logger.error({
					description: 'Files Frontend data not available. Make sure to call .get().',
					error: err, func: 'getFromS3', obj: 'Files'
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
					description: 'Files Frontend data not available. Calling .get().',
					project: this.project, func: 'getFromS3', obj: 'Files'
				});
				return this.getFrontEnd().then(this.getFromS3);
			}
			var s3 = S3.init();
			s3.listObjects({ bucket: this.project.frontend.bucketName }).then(function (filesList) {
				logger.info({
					description: 'Files list loaded.', filesList: filesList,
					func: 'get', obj: 'Files'
				});
				return filesList;
			}, function (error) {
				logger.error({
					description: 'Error getting files from S3.',
					error: error, func: 'get', obj: 'Files'
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
				func: 'buildStructure', obj: 'Files'
			});
			return this.get().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Files'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Files'
				});
				return childStruct;
			}, function (error) {
				logger.error({
					description: 'Error getting application files.',
					error: error, func: 'buildStructure', obj: 'Files'
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
				func: 'syncStructure', obj: 'Files'
			});
			return this.sync().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStruct: childStruct, func: 'syncStructure', obj: 'Files'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStruct: childStruct, func: 'syncStructure', obj: 'Files'
				});
				return childStruct;
			}, function (error) {
				logger.error({
					description: 'Error getting application files.',
					error: error, func: 'syncStructure', obj: 'Files'
				});
				return Promise.reject({
					message: 'Error getting files.',
					error: error
				});
			});
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			if (!this.project.fbUrl) {
				logger.error({
					description: 'Project data is required for fbUrl.',
					func: 'constructor', obj: 'Files', files: this
				});
				throw new Error('Project data is required to create fbUrl.');
			}
			if (this.project.fbUrl) {
				return this.project.fbUrl;
			}
			var project = new _Project2.default(this.project);
			return project.fbUrl;
		}
		/**
   * @description Firebase reference of files list
   */

	}, {
		key: 'fbRef',
		get: function get() {
			logger.debug({
				description: 'Url created for files fbRef.',
				url: this.fbUrl, func: 'fbRef', obj: 'Files'
			});
			return new _firebase2.default(this.fbUrl);
		}
		/**
   * @description Path array that is built from Firebase Reference
   * @private
   */

	}, {
		key: 'pathArrayFromFbRef',
		get: function get() {
			//Handle fbUrls that have multiple levels
			var removeArray = _config2.default.fbUrl.replace('https://', '').split('/');
			removeArray.shift();
			var pathArray = this.fbRef.path.o.splice(0, removeArray.length);
			logger.info({
				description: 'Path array built.',
				pathArray: pathArray, func: 'fbRef', obj: 'Files'
			});
			return pathArray;
		}
	}]);

	return Files;
}();
//------------------ Utility Functions ------------------//

exports.default = Files;
function getContentFromFile(fileData) {
	//Get initial content from local file
	logger.debug({
		description: 'getContentFromFile called', fileData: fileData,
		func: 'getContentFromFile', obj: 'Files'
	});
	return new Promise(function (resolve) {
		try {
			var reader = new FileReader();
			logger.debug({
				description: 'reader created', reader: reader,
				func: 'getContentFromFile', obj: 'Files'
			});
			reader.onload = function (e) {
				var contents = e.target.result;
				logger.debug({
					description: 'Contents loaded', contents: contents,
					func: 'getContentFromFile', obj: 'Files'
				});
				resolve(contents);
			};
			reader.readAsText(fileData);
		} catch (error) {
			logger.error({
				description: 'Error getting file contents.', error: error,
				func: 'getContentFromFile', obj: 'Files'
			});
			reject(error);
		}
	});
}
/**
 * @description Convert from array file structure (from S3) to 'children' structure used in Editor GUI
 * @private
 * @example
 * //Array structure: [{path:'index.html'}, {path:'testFolder/file.js'}]
 * //Children Structure [{type:'folder', name:'testfolder', children:[{path:'testFolder/file.js', name:'file.js', filetype:'javascript', contentType:'application/javascript'}]}]
 * var flatArray = [{path:'index.html'}, {path:'testFolder/file.js'}];
 * var childrenStructure = childrenStructureFromArray(flatArray);
 */
function childrenStructureFromArray(fileArray) {
	// logger.log('childStructureFromArray called:', fileArray);
	//Create a object for each file that stores the file in the correct 'children' level
	var mappedStructure = fileArray.map(function (file) {
		return buildStructureObject(file);
	});
	return combineLikeObjs(mappedStructure);
}
/**
 * @description Convert file with key into a folder/file children object
 * @private
 */
function buildStructureObject(file) {
	var pathArray = undefined;
	// console.log('buildStructureObject with:', file);
	if ((0, _lodash.has)(file, 'path')) {
		//Coming from files already having path (structure)
		pathArray = file.path.split('/');
	} else if ((0, _lodash.has)(file, 'Key')) {
		//Coming from aws
		pathArray = file.Key.split('/');
		// console.log('file before pick:', file);
		file = (0, _lodash.pick)(file, 'Key');
		file.path = file.Key;
		file.name = file.Key;
	} else {
		logger.error({
			description: 'Invalid file.', file: file,
			func: 'buildStructureObject', obj: 'Files'
		});
	}
	var currentObj = file;
	if (pathArray.length == 1) {
		currentObj.name = pathArray[0];
		if (!(0, _lodash.has)(currentObj, 'type')) {
			currentObj.type = 'file';
		}
		currentObj.path = pathArray[0];
		return currentObj;
	} else {
		var finalObj = {};
		(0, _lodash.each)(pathArray, function (loc, ind, list) {
			if (ind != list.length - 1) {
				//Not the last loc
				currentObj.name = loc;
				currentObj.path = (0, _lodash.take)(list, ind + 1).join('/');
				currentObj.type = 'folder';
				currentObj.children = [{}];
				//TODO: Find out why this works
				if (ind === 0) {
					finalObj = currentObj;
				}
				currentObj = currentObj.children[0];
			} else {
				currentObj.type = 'file';
				currentObj.name = loc;
				currentObj.path = pathArray.join('/');
				if (file.$id) {
					currentObj.$id = file.$id;
				}
			}
		});
		return finalObj;
	}
}
/**
 * @description Recursivley combine children of object's that have the same names
 * @private
 */
function combineLikeObjs(mappedArray) {
	var takenNames = [];
	var finishedArray = [];
	(0, _lodash.each)(mappedArray, function (obj) {
		if (takenNames.indexOf(obj.name) == -1) {
			takenNames.push(obj.name);
			finishedArray.push(obj);
		} else {
			var likeObj = (0, _lodash.findWhere)(mappedArray, { name: obj.name });
			//Combine children of like objects
			likeObj.children = (0, _lodash.union)(obj.children, likeObj.children);
			likeObj.children = combineLikeObjs(likeObj.children);
			// logger.log('extended obj:',likeObj);
		}
	});
	return finishedArray;
}
module.exports = exports['default'];