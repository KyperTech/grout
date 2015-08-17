var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('firebase'), require('aws-sdk'), require('underscore')) : typeof define === 'function' && define.amd ? define(['firebase', 'aws-sdk', 'underscore'], factory) : global.MatterClient = factory(global.Firebase, global.AWS, global._);
})(this, function (Firebase, AWS, _) {
	'use strict';

	var request__superagent = undefined;
	if (typeof window.superagent == 'undefined') {
		console.error('Superagent is required to use Matter');
	} else {
		request__superagent = window.superagent;
	}

	//TODO: Import config from seperate file
	var request__config = {
		serverUrl: 'http://localhost:4000',
		tokenName: 'matter-client'
	};
	var request__request = {
		get: function get(endpoint, queryData) {
			var req = request__superagent.get(endpoint);
			if (queryData) {
				req.query(queryData);
			}
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		post: function post(endpoint, data) {
			var req = request__superagent.post(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		put: function put(endpoint, data) {
			var req = request__superagent.put(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		del: function del(endpoint, data) {
			var req = request__superagent.put(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		}

	};

	var request__default = request__request;

	function handleResponse(req) {
		return new Promise(function (resolve, reject) {
			req.end(function (err, res) {
				if (!err) {
					console.log('Response:', res);
					return resolve(res.body);
				} else {
					return reject(err);
				}
			});
		});
	}
	function addAuthHeader(req) {
		if (typeof window != 'undefined' && window.sessionStorage.getItem(request__config.tokenName)) {
			req = req.set('Authorization', 'Bearer ' + sessionStorage.getItem(request__config.tokenName));
			console.log('Set auth header');
		}
		return req;
	}

	var matter_client__user = undefined;
	var matter_client__token = undefined;
	var matter_client__config = {
		serverUrl: 'http://localhost:4000',
		tokenName: 'matter-client',
		fbUrl: 'https://pruvit.firebaseio.com/',
		aws: {
			region: 'us-east-1',
			cognito: {
				poolId: 'us-east-1:7f3bc1ff-8484-48dd-9e13-27e5cd3de982',
				params: {
					RoleArn: 'arn:aws:iam::823322155619:role/Cognito_HypercubeTestAuth_Role1'
				}
			}
		}
	};

	if (typeof Firebase == 'undefined') {
		console.error('Firebase is required to use Matter');
	}
	if (typeof AWS == 'undefined') {
		console.error('AWS is required to use Matter');
	}
	if (typeof _ == 'undefined') {
		console.error('Underscore is required to use Matter');
	}
	if (typeof request__default == 'undefined') {
		console.error('Request is required to use Matter');
	}
	/**
  * Application class.
  *
  */

	var Application = (function () {
		function Application(appData) {
			_classCallCheck(this, Application);

			this.name = appData.name;
			this.owner = appData.owner || null;
			this.collaborators = appData.collaborators || [];
			this.createdAt = appData.createdAt;
			this.updatedAt = appData.updatedAt;
			this.frontend = appData.frontend || {};
			this.backend = appData.backend || {};
			if (Firebase) {
				this.fbRef = new Firebase(matter_client__config.fbUrl + appData.name);
			}
		}

		//Actions for applications list

		//Get files list and convert to structure

		_createClass(Application, [{
			key: 'getStructure',
			value: function getStructure() {
				return this.getFiles().then(function (filesArray) {
					var childStruct = childrenStructureFromArray(filesArray);
					console.log('Child struct from array:', childStruct);
					return childStruct;
				}, function (err) {
					console.error('[Application.getStructure] Error getting files: ', err);
					return Promise.reject({ message: 'Error getting files.', error: err });
				});
			}

			//Get files list from S3
		}, {
			key: 'getFiles',
			value: function getFiles() {
				if (!this.frontend) {
					console.error('[Applicaiton.getFiles] Attempting to get objects for bucket without name.');
					return Promise.reject({ message: 'Bucket name required to get objects' });
				} else {
					//If AWS Credential do not exist, set them
					if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
						// console.info('AWS creds are being updated to make request');
						setAWSConfig();
					}
					var s3 = new AWS.S3();
					var listParams = { Bucket: bucketName };
					return s3.listObjects(listParams, function (err, data) {
						if (!err) {
							console.log('[Application.getObjects()] listObjects returned:', data);
							return Promise.resolve(data.Contents);
						} else {
							console.error('[Application.getObjects()] Error listing objects:', err);
							return Promise.reject(err);
						}
					});
				}
			}
		}, {
			key: 'publishFile',
			value: function publishFile(fileData) {
				if (!this.frontend) {
					console.error('Frontend data not available. Make sure to call .get().');
					return Promise.reject({ message: 'Front end data is required to publish file.' });
				}
				var saveParams = { Bucket: this.frontent.bucketName, Key: fileData.key, Body: fileData.content, ACL: 'public-read' };
				//Set contentType from fileData to ContentType parameter of new object
				if (fileData.contentType) {
					saveParams.ContentType = fileData.contentType;
				}
				// console.log('[$aws.$saveFiles] saveParams:', saveParams);
				return s3.putObject(saveParams, function (err, data) {
					//[TODO] Add putting object ACL (make public)
					if (!err) {
						console.log('[Application.publishFile()] file saved successfully. Returning:', data);
						return data;
					} else {
						console.error('[Application.publishFile()] Error saving file:', err);
						return Promise.reject(err);
					}
				});
			}
		}, {
			key: 'addStorage',
			value: function addStorage() {
				//TODO:Add storage bucket
				var endpoint = matter_client__config.serverUrl + '/apps/' + this.name + '/storage';
				return request__default.post(endpoint, appData).then(function (response) {
					console.log('[Application.addStorage()] Apps:', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[Application.addStorage()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'applyTemplate',
			value: function applyTemplate() {
				var endpoint = matter_client__config.serverUrl + '/apps/' + this.name + '/template';
				console.log('Applying templates to existing');
				// return request.post(endpoint, appData).then(function(response) {
				// 	console.log('[Application.addStorage()] Apps:', response);
				// 	if (!apps.isList) {
				// 		return new Application(response);
				// 	}
				// 	return response;
				// })['catch'](function(errRes) {
				// 	console.error('[Application.addStorage()] Error getting apps list: ', errRes);
				// 	return Promise.reject(errRes);
				// });
			}
		}]);

		return Application;
	})();

	var AppsAction = (function () {
		function AppsAction() {
			_classCallCheck(this, AppsAction);

			this.endpoint = matter_client__config.serverUrl + '/apps';
		}

		//Actions for specific application

		//Get applications or single application

		_createClass(AppsAction, [{
			key: 'get',
			value: function get() {
				return request__default.get(this.endpoint).then(function (response) {
					console.log('[MatterClient.apps().get()] App(s) data loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.apps().get()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				return request__default.post(this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().add()] Application added successfully: ', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.getApps()] Error adding application: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}]);

		return AppsAction;
	})();

	var AppAction = (function () {
		function AppAction(appName) {
			_classCallCheck(this, AppAction);

			if (appName) {
				this.name = appName;
				this.endpoint = matter_client__config.serverUrl + '/apps/' + this.name;
			} else {
				console.error('Application name is required to start an AppAction');
				throw new Error('Application name is required to start an AppAction');
			}
		}

		//Matter Client Class

		//Get applications or single application

		_createClass(AppAction, [{
			key: 'get',
			value: function get() {
				return request__default.get(this.endpoint).then(function (response) {
					console.log('[MatterClient.app().get()] App(s) data loaded:', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.app().get()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Update an application
		}, {
			key: 'update',
			value: function update(appData) {
				return request__default.put(this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().update()] App:', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.apps().update()] Error updating app: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Delete an application
		}, {
			key: 'del',
			value: function del(appData) {
				return request__default['delete'](this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().del()] Apps:', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.apps().del()] Error deleting app: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getFiles',
			value: function getFiles() {
				return this.get().then(function (app) {
					app.getFiles().then(function (filesArray) {
						return filesArray;
					})['catch'](function (err) {
						console.error('[MatterClient.app().getFiles()] Error getting application files: ', err);
						return Promise.reject(err);
					});
				})['catch'](function (err) {
					console.error('[MatterClient.app().getFiles()] Error getting application: ', err);
					return Promise.reject(err);
				});
			}
		}, {
			key: 'getStructure',
			value: function getStructure() {
				return this.get().then(function (app) {
					return app.getStructure().then(function (structure) {
						console.log('Structure loaded: ', structure);
						return structure;
					})['catch'](function (err) {
						console.error('[MatterClient.app().getStructure()] Error getting application structure: ', err);
						return Promise.reject(err);
					});
				})['catch'](function (err) {
					console.error('[MatterClient.app().getStructure()] Error getting application: ', err);
					return Promise.reject(err);
				});
			}
		}]);

		return AppAction;
	})();

	var MatterClient = (function () {
		function MatterClient() {
			_classCallCheck(this, MatterClient);
		}

		_createClass(MatterClient, [{
			key: 'signup',

			//Signup a new user
			value: function signup(signupData) {
				return request__default.post(matter_client__config.serverUrl + '/signup', signupData).then(function (response) {
					console.log(response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.signup()] Error signing up:', errRes);
					return Promise.reject(errRes);
				});
			}

			//Login a user
		}, {
			key: 'login',
			value: function login(loginData) {
				if (!loginData || !loginData.password || !loginData.username) {
					console.error('Username/Email and Password are required to login.');
					return Promise.reject({ message: 'Username/Email and Password are required to login.' });
				}
				return request__default.put(matter_client__config.serverUrl + '/login', loginData).then(function (response) {
					//TODO: Save token locally
					console.log('[MatterClient.login()]: Login response: ', response);
					matter_client__token = response.token;
					if (window.sessionStorage.getItem(matter_client__config.tokenName) === null) {
						window.sessionStorage.setItem(matter_client__config.tokenName, response.token);
						console.log('[MatterClient.login()]: token set to storage:', window.sessionStorage.getItem(matter_client__config.tokenName));
					}
					setAuthHeader();
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.login()] Error logging in: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'logout',
			value: function logout() {
				return request__default.put(matter_client__config.serverUrl + '/logout', {}).then(function (response) {
					console.log('[MatterClient.logout()] Logout successful: ', response);
					if (typeof window != 'undefined' && typeof window.sessionStorage.getItem(matter_client__config.tokenName) != null) {
						//Clear session storage
						window.sessionStorage.clear();
					}
					return response.body;
				})['catch'](function (errRes) {
					if (errRes.status && errRes.status == 401) {
						if (typeof window != 'undefined' && window.sessionStorage.getItem(matter_client__config.tokenName) != null) {
							//Clear session storage
							window.sessionStorage.clear();
						}
						return;
					}
					console.error('[MatterClient.logout()] Error logging out: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getCurrentUser',
			value: function getCurrentUser() {
				//TODO: Check Current user variable
				return request__default.get(matter_client__config.serverUrl + '/user', {}).then(function (response) {
					//TODO: Save user information locally
					console.log('[MatterClient.getCurrentUser()] Current User:', response);
					matter_client__user = response;
					return matter_client__user;
				})['catch'](function (errRes) {
					console.error('[MatterClient.getCurrentUser()] Error getting current user: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getAuthToken',
			value: function getAuthToken() {
				if (typeof window == 'undefined' || typeof window.sessionStorage.getItem(matter_client__config.tokenName) == 'undefined') {
					return null;
				}
				return window.sessionStorage.getItem(matter_client__config.tokenName);
			}

			//TODO: Use getter/setter to make this not a function
			//Start a new AppsAction
		}, {
			key: 'apps',
			value: function apps() {
				console.log('New AppsAction:', new AppsAction());
				return new AppsAction();
			}

			//Start a new app action
		}, {
			key: 'app',
			value: function app(appName) {
				console.log('New AppAction:', new AppAction(appName));
				return new AppAction(appName);
			}
		}]);

		return MatterClient;
	})();

	;

	var File = (function () {
		function File(fileData) {
			_classCallCheck(this, File);

			this.type = 'file';
			this.path = fileData.path;
			var pathArray = this.path.split('/');
			this.name = pathArray[pathArray.length - 1];
			var re = /(?:\.([^.]+))?$/;
			this.ext = re.exec(this.name)[1];
			console.log('new file constructed:', this);
		}

		_createClass(File, [{
			key: 'getTypes',
			value: function getTypes() {
				//Get content type and file type from extension
			}
		}, {
			key: 'open',
			value: function open() {
				//TODO:Return file contents
			}
		}, {
			key: 'openWithFirepad',
			value: function openWithFirepad(divId) {
				//TODO:Create new Firepad instance within div
			}
		}, {
			key: 'getDefaultContent',
			value: function getDefaultContent() {}
		}]);

		return File;
	})();

	var Folder = function Folder(fileData) {
		_classCallCheck(this, Folder);

		this.type = 'folder';
		//TODO: Add path
	};

	var matter_client = MatterClient;

	//------------------ Utility Functions ------------------//

	// AWS Config
	function setAWSConfig() {
		AWS.config.update({
			credentials: new AWS.CognitoIdentityCredentials({
				IdentityPoolId: matter_client__config.aws.cognito.poolId
			}),
			region: matter_client__config.aws.region
		});
	}
	//Convert from array file structure (from S3) to 'children' structure used in Editor GUI (angular-tree-control)
	//Examples for two files (index.html and /testFolder/file.js):
	//Array structure: [{path:'index.html'}, {path:'testFolder/file.js'}]
	//Children Structure [{type:'folder', name:'testfolder', children:[{path:'testFolder/file.js', name:'file.js', filetype:'javascript', contentType:'application/javascript'}]}]
	function childrenStructureFromArray(fileArray) {
		// console.log('childStructureFromArray called:', fileArray);
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
		if (_.has(file, 'path')) {
			//Coming from files already having path (structure)
			pathArray = file.path.split('/');
		} else {
			//Coming from aws
			pathArray = file.Key.split('/');
			// console.log('file before pick:', file);
			file = _.pick(file, 'Key');
			file.path = file.Key;
			file.name = file.Key;
		}
		var currentObj = file;
		if (pathArray.length == 1) {
			currentObj.name = pathArray[0];
			if (!_.has(currentObj, 'type')) {
				currentObj.type = 'file';
			}
			currentObj.path = pathArray[0];
			return currentObj;
		} else {
			var finalObj = {};
			_.each(pathArray, function (loc, ind, list) {
				if (ind != list.length - 1) {
					//Not the last loc
					currentObj.name = loc;
					currentObj.path = _.first(list, ind + 1).join('/');
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
	function combineLikeObjs() {
		var takenNames = [];
		var finishedArray = [];
		_.each(mappedArray, function (obj, ind, list) {
			if (takenNames.indexOf(obj.name) == -1) {
				takenNames.push(obj.name);
				finishedArray.push(obj);
			} else {
				var likeObj = _.findWhere(mappedArray, { name: obj.name });
				//Combine children of like objects
				likeObj.children = _.union(obj.children, likeObj.children);
				likeObj.children = combineLikeObjs(likeObj.children);
				// console.log('extended obj:',likeObj);
			}
		});
		return finishedArray;
	}

	return matter_client;
});
//# sourceMappingURL=matter-client.js.map