var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('superagent'), require('underscore'), require('firebase')) : typeof define === 'function' && define.amd ? define(['superagent', 'underscore', 'firebase'], factory) : global.Grout = factory(global.superagent, global._, global.Firebase);
})(this, function (superagent, _, Firebase) {
	'use strict';

	superagent = 'default' in superagent ? superagent['default'] : superagent;
	_ = 'default' in _ ? _['default'] : _;
	Firebase = 'default' in Firebase ? Firebase['default'] : Firebase;

	var config = {
		serverUrl: 'hypercube.elasticbeanstalk.com',
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
	//Set server to local server if developing
	if (typeof window != 'undefined' && (window.location.hostname == '' || window.location.hostname == 'localhost')) {
		config.serverUrl = 'http://localhost:4000';
	}

	var storage = Object.defineProperties({
		/**
   * @description
   * Safley sets item to session storage.
   *
   * @param {String} itemName The items name
   * @param {String} itemValue The items value
   *
   *  @private
   */
		setItem: function setItem(itemName, itemValue) {
			//TODO: Handle itemValue being an object instead of a string
			if (this.exists) {
				window.sessionStorage.setItem(itemName, itemValue);
			}
		},
		/**
   * @description
   * Safley gets an item from session storage.
   *
   * @param {String} itemName The items name
   *
   * @return {String}
   *
   */
		getItem: function getItem(itemName) {
			if (this.exists) {
				return window.sessionStorage.getItem(itemName);
			}
			return null;
		},
		/**
   * @description
   * Safley removes item from session storage.
   *
   * @param {String} itemName - The items name
   *
   */
		removeItem: function removeItem(itemName) {
			//TODO: Only remove used items
			if (this.exists) {
				try {
					//Clear session storage
					window.sessionStorage.removeItem(itemName);
				} catch (err) {
					console.warn('Item could not be removed from session storage.', err);
				}
			}
		},
		/**
   * @description
   * Safley removes item from session storage.
   *
   * @param {String} itemName the items name
   * @param {String} itemValue the items value
   *
   *  @private
   */
		clear: function clear() {
			//TODO: Only remove used items
			if (this.exists) {
				try {
					//Clear session storage
					window.sessionStorage.clear();
				} catch (err) {
					console.warn('Session storage could not be cleared.', err);
				}
			}
		}

	}, {
		exists: {
			get: function get() {
				var testKey = 'test';
				if (typeof window != 'undefined') {
					try {
						window.sessionStorage.setItem(testKey, '1');
						window.sessionStorage.removeItem(testKey);
						return true;
					} catch (err) {
						console.warn('Session storage does not exist.', err);
						return false;
					}
				} else {
					return false;
				}
			},
			configurable: true,
			enumerable: true
		}
	});

	var request = {
		get: function get(endpoint, queryData) {
			var req = superagent.get(endpoint);
			if (queryData) {
				req.query(queryData);
			}
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		post: function post(endpoint, data) {
			var req = superagent.post(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		put: function put(endpoint, data) {
			var req = superagent.put(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		},
		del: function del(endpoint, data) {
			var req = superagent.put(endpoint).send(data);
			req = addAuthHeader(req);
			return handleResponse(req);
		}

	};

	function handleResponse(req) {
		return new Promise(function (resolve, reject) {
			req.end(function (err, res) {
				if (!err) {
					// console.log('Response:', res);
					return resolve(res.body);
				} else {
					if (err.status == 401) {
						console.warn('Unauthorized. You must be signed into make this request.');
					}
					return reject(err);
				}
			});
		});
	}
	function addAuthHeader(req) {
		if (storage.getItem(config.tokenName)) {
			req = req.set('Authorization', 'Bearer ' + storage.getItem(config.tokenName));
			console.log('Set auth header');
		}
		return req;
	}

	/**
  * Application class.
  *
  */

	var _Application = (function () {
		function _Application(appData) {
			_classCallCheck(this, _Application);

			this.name = appData.name;
			this.owner = appData.owner || null;
			this.collaborators = appData.collaborators || [];
			this.createdAt = appData.createdAt;
			this.updatedAt = appData.updatedAt;
			this.frontend = appData.frontend || {};
			this.backend = appData.backend || {};
			if (Firebase) {
				this.fbRef = new Firebase(config.fbUrl + appData.name);
			}
		}

		//------------------ Utility Functions ------------------//

		// AWS Config

		//Get files list and convert to structure

		_createClass(_Application, [{
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
				if (!this.frontend || !this.frontend.bucketName) {
					console.error('[Applicaiton.getFiles] Attempting to get objects for bucket without name.');
					return Promise.reject({ message: 'Bucket name required to get objects' });
				} else {
					//If AWS Credential do not exist, set them
					if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
						// console.info('AWS creds are being updated to make request');
						setAWSConfig();
					}
					var s3 = new AWS.S3();
					var listParams = { Bucket: this.frontend.bucketName };
					return new Promise(function (resolve, reject) {
						s3.listObjects(listParams, function (err, data) {
							if (!err) {
								console.log('[Application.getObjects()] listObjects returned:', data);
								return resolve(data.Contents);
							} else {
								console.error('[Application.getObjects()] Error listing objects:', err);
								return reject(err);
							}
						});
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
				var endpoint = config.serverUrl + '/apps/' + this.name + '/storage';
				return request.post(endpoint, appData).then(function (response) {
					console.log('[Application.addStorage()] Apps:', response);
					return new _Application(response);
				})['catch'](function (errRes) {
					console.error('[Application.addStorage()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'applyTemplate',
			value: function applyTemplate() {
				var endpoint = config.serverUrl + '/apps/' + this.name + '/template';
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

		return _Application;
	})();

	function setAWSConfig() {
		AWS.config.update({
			credentials: new AWS.CognitoIdentityCredentials({
				IdentityPoolId: config.aws.cognito.poolId
			}),
			region: config.aws.region
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
	function combineLikeObjs(mappedArray) {
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

	//Actions for specific application

	var AppAction = (function () {
		function AppAction(appName) {
			_classCallCheck(this, AppAction);

			if (appName) {
				this.name = appName;
				this.endpoint = config.serverUrl + '/apps/' + this.name;
			} else {
				console.error('Application name is required to start an AppAction');
				throw new Error('Application name is required to start an AppAction');
			}
		}

		//Actions for applications list

		//Get applications or single application

		_createClass(AppAction, [{
			key: 'get',
			value: function get() {
				return request.get(this.endpoint).then(function (response) {
					console.log('[MatterClient.app().get()] App(s) data loaded:', response);
					return new _Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.app().get()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Update an application
		}, {
			key: 'update',
			value: function update(appData) {
				return request.put(this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().update()] App:', response);
					return new _Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.apps().update()] Error updating app: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Delete an application
		}, {
			key: 'del',
			value: function del(appData) {
				return request['delete'](this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().del()] Apps:', response);
					return new _Application(response);
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

	var AppsAction = (function () {
		function AppsAction() {
			_classCallCheck(this, AppsAction);

			this.endpoint = config.serverUrl + '/apps';
		}

		/**
   * User class.
   *
   */

		//Get applications or single application

		_createClass(AppsAction, [{
			key: 'get',
			value: function get() {
				return request.get(this.endpoint).then(function (response) {
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
				return request.post(this.endpoint, appData).then(function (response) {
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

	var User = (function () {
		function User(userData) {
			_classCallCheck(this, User);

			this.name = userData.name;
			this.username = userData.username;
			this.createdAt = userData.createdAt;
			this.updatedAt = userData.updatedAt;
		}

		//Actions for specific user

		_createClass(User, [{
			key: 'app',
			value: function app(appName) {
				//TODO: Attach owner as well ?
				return new AppAction(appName);
			}
		}, {
			key: 'apps',
			get: function get() {
				return new AppsAction();
			}
		}]);

		return User;
	})();

	var UserAction = (function () {
		function UserAction(userName) {
			_classCallCheck(this, UserAction);

			if (userName) {
				this.name = userName;
				this.endpoint = config.serverUrl + '/users/' + this.name;
			} else {
				console.error('Username is required to start an UserAction');
				throw new Error('Username is required to start an UserAction');
			}
		}

		//Actions for applications list

		//Get userlications or single userlication

		_createClass(UserAction, [{
			key: 'get',
			value: function get() {
				return request.get(this.endpoint).then(function (response) {
					console.log('[MatterClient.user().get()] App(s) data loaded:', response);
					return new User(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.user().get()] Error getting users list: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Update an userlication
		}, {
			key: 'update',
			value: function update(userData) {
				return request.put(this.endpoint, userData).then(function (response) {
					console.log('[MatterClient.users().update()] App:', response);
					return new User(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().update()] Error updating user: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Delete an userlication
			//TODO: Only do request if deleting personal account
		}, {
			key: 'del',
			value: function del(userData) {
				console.error('Deleting a user is currently disabled.');
				// return request.delete(this.endpoint, userData).then((response) => {
				// 	console.log('[MatterClient.users().del()] Apps:', response);
				// 	return new User(response);
				// })['catch']((errRes) => {
				// 	console.error('[MatterClient.users().del()] Error deleting user: ', errRes);
				// 	return Promise.reject(errRes);
				// });
			}
		}]);

		return UserAction;
	})();

	var UsersAction = (function () {
		function UsersAction() {
			_classCallCheck(this, UsersAction);

			this.endpoint = config.serverUrl + '/users';
		}

		//Get applications or single application

		_createClass(UsersAction, [{
			key: 'get',
			value: function get(query) {
				var userEndpoint = this.endpoint;
				if (query && !_.isString(query)) {
					var msg = 'Get only handles username as a string';
					console.error(msg);
					return Promise.reject({ message: msg });
				}
				if (query) {
					userEndpoint = userEndpoint + '/' + query;
				}
				return request.get(userEndpoint).then(function (response) {
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
				return request.post(this.endpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().add()] Application added successfully: ', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.getApps()] Error adding application: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Search with partial of username
		}, {
			key: 'search',
			value: function search(query) {
				console.log('search called:', query);
				var searchEndpoint = this.endpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				console.log('searchEndpoint:', searchEndpoint);
				return request.get(searchEndpoint).then(function (response) {
					console.log('[MatterClient.users().search()] Users(s) data loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().search()] Error getting apps list: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}]);

		return UsersAction;
	})();

	var user = undefined;
	var token = undefined;

	//Matter Client Class

	var Grout = (function () {
		function Grout() {
			_classCallCheck(this, Grout);
		}

		_createClass(Grout, [{
			key: 'signup',

			//Signup a new user
			value: function signup(signupData) {
				return request.post(config.serverUrl + '/signup', signupData).then(function (response) {
					console.log(response);
					return response;
				})['catch'](function (errRes) {
					console.error('[Grout.signup()] Error signing up:', errRes);
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
				return request.put(config.serverUrl + '/login', loginData).then(function (response) {
					//TODO: Save token locally
					console.log('[Grout.login()]: Login response: ', response);
					token = response.token;
					if (storage.getItem(config.tokenName) === null) {
						storage.setItem(config.tokenName, response.token);
						console.log('[Grout.login()]: token set to storage:', storage.getItem(config.tokenName));
					}
					return response;
				})['catch'](function (errRes) {
					console.error('[Grout.login()] Error logging in: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'logout',
			value: function logout() {
				return request.put(config.serverUrl + '/logout', {}).then(function (response) {
					console.log('[Grout.logout()] Logout successful: ', response);
					if (typeof window != 'undefined' && typeof storage.getItem(config.tokenName) != null) {
						//Clear session storage
						storage.clear();
					}
					return response.body;
				})['catch'](function (errRes) {
					if (errRes.status && errRes.status == 401) {
						if (typeof window != 'undefined' && storage.getItem(config.tokenName) != null) {
							//Clear session storage
							storage.clear();
						}
						return;
					}
					console.error('[Grout.logout()] Error logging out: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getCurrentUser',
			value: function getCurrentUser() {
				//TODO: Check Current user variable
				return request.get(config.serverUrl + '/user', {}).then(function (response) {
					//TODO: Save user information locally
					console.log('[Grout.getCurrentUser()] Current User:', response);
					user = response;
					return user;
				})['catch'](function (errRes) {
					console.error('[Grout.getCurrentUser()] Error getting current user: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getAuthToken',
			value: function getAuthToken() {
				if (typeof window == 'undefined' || typeof storage.getItem(config.tokenName) == 'undefined') {
					return null;
				}
				return storage.getItem(config.tokenName);
			}

			//TODO: Use getter/setter to make this not a function
			//Start a new AppsAction
		}, {
			key: 'app',

			//Start a new app action
			value: function app(appName) {
				console.log('New AppAction:', new AppAction(appName));
				return new AppAction(appName);
			}
		}, {
			key: 'user',
			value: function user(username) {
				return new UserAction(username);
			}
		}, {
			key: 'apps',
			get: function get() {
				console.log('New AppsAction:', new AppsAction());
				return new AppsAction();
			}
		}, {
			key: 'users',
			get: function get() {
				return new UsersAction();
			}
		}]);

		return Grout;
	})();

	;

	return Grout;
});
//# sourceMappingURL=grout.js.map