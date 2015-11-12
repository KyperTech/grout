Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

//Convenience vars
var logger = _Matter2['default'].utils.logger;

var Files = (function () {
	function Files(filesData) {
		_classCallCheck(this, Files);

		if (filesData && _lodash2['default'].isObject(filesData) && _lodash2['default'].has(filesData, 'app')) {
			//Data is object containing directory data
			this.app = filesData.app;
		} else if (filesData && _lodash2['default'].isString(filesData)) {
			//Data is string name
			this.app = { name: filesData };
		} else if (filesData && _lodash2['default'].isArray(filesData)) {
			//TODO: Handle an array of files being passed as data
			logger.error({ description: 'Action data object with name is required to start a Files Action.', func: 'constructor', obj: 'Files' });
			throw new Error('Files Data object with application is required to start a Files action.');
		} else {
			logger.error({ description: 'Action data object with name is required to start a Files Action.', func: 'constructor', obj: 'Files' });
			throw new Error('Files Data object with name is required to start a Files action.');
		}
		logger.debug({ description: 'Files object constructed.', func: 'constructor', obj: 'Files' });
	}

	_createClass(Files, [{
		key: 'publish',
		value: function publish() {
			//TODO: Publish all files
		}
	}, {
		key: 'get',
		value: function get() {
			var _this = this;

			if (!this.app.frontend || !this.app.frontend.bucketName) {
				logger.warn({ description: 'Application Frontend data not available. Calling .get().', app: this.app, func: 'get', obj: 'Files' });
				return this.app.get().then(function (applicationData) {
					logger.log({ description: 'Application get returned.', data: applicationData, func: 'get', obj: 'Files' });
					_this.app = applicationData;
					if (_lodash2['default'].has(applicationData, 'frontend')) {
						return _this.get();
					} else {
						logger.error({
							description: 'Application does not have Frontend to get files from.',
							func: 'get', obj: 'Files'
						});
						return Promise.reject({ message: 'Application does not have frontend to get files from.' });
					}
				}, function (err) {
					logger.error({
						description: 'Application Frontend data not available. Make sure to call .get().',
						error: err, func: 'get', obj: 'Files'
					});
					return Promise.reject({ message: 'Bucket name required to get objects' });
				});
			} else {
				var _ret = (function () {
					if (typeof _awsSdk2['default'] == 'undefined') {
						logger.error({
							description: 'AWS is required to load files.',
							func: 'get', obj: 'Files'
						});
						return {
							v: Promise.reject({ message: 'AWS is required to load files.' })
						};
					}
					//If AWS Credential do not exist, set them
					if (typeof _awsSdk2['default'].config.credentials == 'undefined' || !_awsSdk2['default'].config.credentials) {
						// logger.info('AWS creds are being updated to make request');
						setAWSConfig();
					}
					var s3 = new _awsSdk2['default'].S3();
					var listParams = { Bucket: _this.app.frontend.bucketName };
					return {
						v: new Promise(function (resolve, reject) {
							s3.listObjects(listParams, function (err, data) {
								if (!err) {
									logger.info({ description: 'Files list loaded.', filesData: data, func: 'get', obj: 'Files' });
									return resolve(data.Contents);
								} else {
									logger.error({ description: 'Error getting files from S3.', error: err, func: 'get', obj: 'Files' });
									return reject(err);
								}
							});
						})
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			}
		}
	}, {
		key: 'add',
		value: function add() {
			//TODO: Add a file to files list
		}
	}, {
		key: 'del',
		value: function del() {
			//TODO: Delete a file from files list
		}
	}, {
		key: 'buildStructure',
		value: function buildStructure() {
			logger.debug({ description: 'Build Structure called.', func: 'buildStructure', obj: 'Application' });
			return this.get().then(function (filesArray) {
				var childStruct = childrenStructureFromArray(filesArray);
				//TODO: have child objects have correct classes (file/folder)
				logger.log({ description: 'Child struct from array.', childStructure: childStruct, func: 'buildStructure', obj: 'Application' });
				return childStruct;
			}, function (err) {
				logger.error({ description: 'Error getting application files.', error: err, func: 'buildStructure', obj: 'Application' });
				return Promise.reject({ message: 'Error getting files.', error: err });
			});
		}

		//ALIAS FOR buildStructure
		// get structure() {
		// 	return this.buildStructure();
		// }
	}]);

	return Files;
})();

exports['default'] = Files;

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
//Convert from array file structure (from S3) to 'children' structure used in Editor GUI (angular-tree-control)
//Examples for two files (index.html and /testFolder/file.js):
//Array structure: [{path:'index.html'}, {path:'testFolder/file.js'}]
//Children Structure [{type:'folder', name:'testfolder', children:[{path:'testFolder/file.js', name:'file.js', filetype:'javascript', contentType:'application/javascript'}]}]
function childrenStructureFromArray(fileArray) {
	// logger.log('childStructureFromArray called:', fileArray);
	//Create a object for each file that stores the file in the correct 'children' level
	var mappedStructure = fileArray.map(function (file) {
		return buildStructureObject(file);
	});
	return combineLikeObjs(mappedStructure);
}
//Convert file with key into a folder/file children object
function buildStructureObject(file) {
	var pathArray;
	// console.log('buildStructureObject with:', file);
	if (_lodash2['default'].has(file, 'path')) {
		//Coming from files already having path (structure)
		pathArray = file.path.split('/');
	} else {
		//Coming from aws
		pathArray = file.Key.split('/');
		// console.log('file before pick:', file);
		file = _lodash2['default'].pick(file, 'Key');
		file.path = file.Key;
		file.name = file.Key;
	}
	var currentObj = file;
	if (pathArray.length == 1) {
		currentObj.name = pathArray[0];
		if (!_lodash2['default'].has(currentObj, 'type')) {
			currentObj.type = 'file';
		}
		currentObj.path = pathArray[0];
		return currentObj;
	} else {
		var finalObj = {};
		_lodash2['default'].each(pathArray, function (loc, ind, list) {
			if (ind != list.length - 1) {
				//Not the last loc
				currentObj.name = loc;
				currentObj.path = _lodash2['default'].take(list, ind + 1).join('/');
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
//Recursivley combine children of object's that have the same names
function combineLikeObjs(mappedArray) {
	var takenNames = [];
	var finishedArray = [];
	_lodash2['default'].each(mappedArray, function (obj) {
		if (takenNames.indexOf(obj.name) == -1) {
			takenNames.push(obj.name);
			finishedArray.push(obj);
		} else {
			var likeObj = _lodash2['default'].findWhere(mappedArray, { name: obj.name });
			//Combine children of like objects
			likeObj.children = _lodash2['default'].union(obj.children, likeObj.children);
			likeObj.children = combineLikeObjs(likeObj.children);
			// logger.log('extended obj:',likeObj);
		}
	});
	return finishedArray;
}
module.exports = exports['default'];