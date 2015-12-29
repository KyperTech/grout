'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _File = require('./File');

var _File2 = _interopRequireDefault(_File);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Convenience vars
var logger = _Matter2.default.utils.logger;

var Files = (function () {
	function Files(filesData) {
		_classCallCheck(this, Files);

		if (!filesData) {
			logger.error({
				description: 'Action data object with name is required to start a Files Action.',
				func: 'constructor', obj: 'Files'
			});
			throw new Error('Files Data object with name is required to start a Files action.');
		}
		this.app = (0, _lodash.has)(filesData, 'app') ? filesData.app : { name: filesData };
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
					logger.warn({
						description: 'Files loaded from firebase.',
						val: filesSnap.val(), func: 'get', obj: 'Files'
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
					logger.warn({
						description: 'Files array built.',
						val: filesArray, func: 'get', obj: 'Files'
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
			logger.log({
				description: 'Files get called.',
				func: 'get', obj: 'Files'
			});
			return new Promise(function (resolve) {
				_this2.fbRef.on('value', function (filesSnap) {
					logger.warn({
						description: 'Files loaded from firebase.',
						val: filesSnap.val(), func: 'get', obj: 'Files'
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
					logger.warn({
						description: 'Files array built.',
						val: filesArray, func: 'get', obj: 'Files'
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
		value: function add(fileData) {
			var _this3 = this;

			//TODO: Allow for options of where to add the file to
			if (!(0, _lodash.isArray)(fileData)) {
				return this.addToFb(fileData);
			} else {
				var _ret = (function () {
					logger.warn({
						description: 'Add called with multiple files.', files: files,
						app: _this3.app, func: 'upload', obj: 'Files'
					});
					var promises = [];
					(0, _lodash.each)(fileData, function (file) {
						promises.push(_this3.addToFb(file));
					});
					return {
						v: Promise.all(promises).then(function (resultsArray) {
							logger.warn({
								description: 'Files uploaded successfully.', resultsArray: resultsArray,
								func: 'upload', obj: 'Files'
							});
							return Promise.resolve(_this3);
						})
					};
				})();

				if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
			}
		}
	}, {
		key: 'upload',
		value: function upload(filesData) {
			return this.add(filesData);
		}
		/**
   * @description Delete file
   */

	}, {
		key: 'del',
		value: function del(fileData) {
			//TODO: Delete file from S3 as well if it exists
			return this.delFromFb(fileData);
		}
	}, {
		key: 'publish',
		value: function publish() {}
		//TODO: Publish all files

		/**
   * @description build child structure from files list
   */

	}, {
		key: 'buildStructure',
		value: function buildStructure() {
			logger.debug({
				description: 'Build Structure called.',
				func: 'buildStructure', obj: 'Application'
			});
			return this.get().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Application'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'buildStructure', obj: 'Application'
				});
				return childStruct;
			}, function (err) {
				logger.error({
					description: 'Error getting application files.',
					error: err, func: 'buildStructure', obj: 'Application'
				});
				return Promise.reject({
					message: 'Error getting files.',
					error: err
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
				func: 'syncStructure', obj: 'Application'
			});
			return this.sync().then(function (filesArray) {
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'syncStructure', obj: 'Application'
				});
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({
					description: 'Child struct from array.',
					childStructure: childStruct,
					func: 'syncStructure', obj: 'Application'
				});
				return childStruct;
			}, function (err) {
				logger.error({
					description: 'Error getting application files.',
					error: err, func: 'syncStructure', obj: 'Application'
				});
				return Promise.reject({
					message: 'Error getting files.',
					error: err
				});
			});
		}
		/**
   * @description Add a file to Firebase
   * @param {Object} fileData - Data object for new file
   * @param {String} fileData.path - Path of file within project
   * @param {String} fileData.content - Content of file
   */

	}, {
		key: 'addToFb',
		value: function addToFb(fileData) {
			if (!fileData || !fileData.path) {
				logger.error({
					description: 'Invalid file data. Path must be included.',
					func: 'addToFb', obj: 'Files'
				});
				return Promise.reject({
					message: 'Invalid file data. Path must be included.'
				});
			}
			var file = new _File2.default({ app: this.app, fileData: fileData });
			//TODO: Handle inital content setting
			return file.save();
		}
		/**
   * @description Delete a file from Firebase
   */

	}, {
		key: 'delFromFb',
		value: function delFromFb(fileData) {
			if (!fileData || !fileData.path) {
				logger.error({
					description: 'Invalid file data. Path must be included.',
					func: 'delFromFb', obj: 'Files'
				});
				return Promise.reject({ message: 'Invalid file data. Path must be included.' });
			}
			var file = new _File2.default({ app: this.app, fileData: fileData });
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
   * @description Get files list from S3
   */

	}, {
		key: 'getFromS3',
		value: function getFromS3() {
			var _this4 = this;

			if (!this.app.frontend || !this.app.frontend.bucketName) {
				logger.warn({
					description: 'Application Frontend data not available. Calling .get().',
					app: this.app, func: 'getFromS3', obj: 'Files'
				});
				return this.app.get().then(function (applicationData) {
					logger.log({
						description: 'Application get returned.',
						data: applicationData, func: 'getFromS3', obj: 'Files'
					});
					_this4.app = applicationData;
					if ((0, _lodash.has)(applicationData, 'frontend')) {
						return _this4.get();
					} else {
						logger.error({
							description: 'Application does not have Frontend to get files from.',
							func: 'getFromS3', obj: 'Files'
						});
						return Promise.reject({
							message: 'Application does not have frontend to get files from.'
						});
					}
				}, function (err) {
					logger.error({
						description: 'Application Frontend data not available. Make sure to call .get().',
						error: err, func: 'getFromS3', obj: 'Files'
					});
					return Promise.reject({
						message: 'Bucket name required to get objects'
					});
				});
			} else {
				var _ret2 = (function () {
					//If AWS Credentials do not exist, set them
					if (typeof _awsSdk2.default.config.credentials == 'undefined' || !_awsSdk2.default.config.credentials) {
						// logger.info('AWS creds are being updated to make request');
						setAWSConfig();
					}
					var s3 = new _awsSdk2.default.S3();
					var listParams = { Bucket: _this4.app.frontend.bucketName };
					return {
						v: new Promise(function (resolve, reject) {
							s3.listObjects(listParams, function (err, data) {
								if (!err) {
									logger.info({
										description: 'Files list loaded.', filesData: data,
										func: 'get', obj: 'Files'
									});
									return resolve(data.Contents);
								} else {
									logger.error({
										description: 'Error getting files from S3.',
										error: err, func: 'get', obj: 'Files'
									});
									return reject(err);
								}
							});
						})
					};
				})();

				if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
			}
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			return _config2.default.fbUrl + '/files/' + this.app.name;
		}
		/**
   * @description Firebase reference of files list
   */

	}, {
		key: 'fbRef',
		get: function get() {
			logger.log({
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
			logger.warn({
				description: 'Remove array started.',
				removeArray: removeArray, fbRefArray: this.fbRef.path.o, func: 'fbRef', obj: 'Files'
			});
			var pathArray = this.fbRef.path.o.splice(0, removeArray.length);
			logger.warn({
				description: 'Path array built.',
				pathArray: pathArray, func: 'fbRef', obj: 'Files'
			});
			return pathArray;
		}
	}]);

	return Files;
})();
//------------------ Utility Functions ------------------//
// AWS Config

exports.default = Files;
function setAWSConfig() {
	return _awsSdk2.default.config.update({
		credentials: new _awsSdk2.default.CognitoIdentityCredentials({
			IdentityPoolId: _config2.default.aws.cognito.poolId
		}),
		region: _config2.default.aws.region
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
				if (ind == 0) {
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