var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash'), require('jwt-decode'), require('superagent'), require('firebase')) : typeof define === 'function' && define.amd ? define(['lodash', 'jwt-decode', 'superagent', 'firebase'], factory) : global.Grout = factory(global._, global.jwtDecode, global.superagent, global.Firebase);
})(this, function (_, jwtDecode, superagent, Firebase) {
	'use strict';

	_ = 'default' in _ ? _['default'] : _;
	jwtDecode = 'default' in jwtDecode ? jwtDecode['default'] : jwtDecode;
	superagent = 'default' in superagent ? superagent['default'] : superagent;
	Firebase = 'default' in Firebase ? Firebase['default'] : Firebase;

	var _config = {
		serverUrl: 'http://tessellate.elasticbeanstalk.com',
		tokenName: 'tessellate',
		tokenDataName: 'tessellate-tokenData',
		tokenUserDataName: 'tessellate-currentUser'
	};

	var ____logger = {
		log: function log(logData) {
			var msgArgs = buildMessageArgs(logData);
			if (_config.envName == 'local') {
				console.log(logData);
			} else {
				console.log.apply(console, msgArgs);
			}
		},
		info: function info(logData) {
			var msgArgs = buildMessageArgs(logData);
			if (_config.envName == 'local') {
				console.info(logData);
			} else {
				console.info.apply(console, msgArgs);
			}
		},
		warn: function warn(logData) {
			var msgArgs = buildMessageArgs(logData);
			if (_config.envName == 'local') {
				console.warn(logData);
			} else {
				console.warn.apply(console, msgArgs);
			}
		},
		debug: function debug(logData) {
			var msgArgs = buildMessageArgs(logData);
			if (_config.envName == 'local') {
				console.log(logData);
			} else {
				console.log.apply(console, msgArgs);
			}
		},
		error: function error(logData) {
			var msgArgs = buildMessageArgs(logData);
			if (_config.envName == 'local') {
				console.error(logData);
			} else {
				console.error.apply(console, msgArgs);
				//TODO: Log to external logger
			}
		}
	};

	function buildMessageArgs(logData) {
		var msgStr = '';
		var msgObj = {};
		//TODO: Attach time stamp
		if (_.isObject(logData)) {
			if (_.has(logData, 'func')) {
				if (_.has(logData, 'obj')) {
					msgStr += '[' + logData.obj + '.' + logData.func + '()] ';
				} else if (_.has(logData, 'file')) {
					msgStr += '[' + logData.file + ' > ' + logData.func + '()] ';
				} else {
					msgStr += '[' + logData.func + '()] ';
				}
			}
			//Print each key and its value other than obj and func
			_.each(_.omit(_.keys(logData)), function (key, ind, list) {
				if (key != 'func' && key != 'obj') {
					if (key == 'description' || key == 'message') {
						msgStr += logData[key];
					} else if (_.isString(logData[key])) {
						// msgStr += key + ': ' + logData[key] + ', ';
						msgObj[key] = logData[key];
					} else {
						//Print objects differently
						// msgStr += key + ': ' + logData[key] + ', ';
						msgObj[key] = logData[key];
					}
				}
			});
			msgStr += '\n';
		} else if (_.isString(logData)) {
			msgStr = logData;
		}
		var msg = [msgStr, msgObj];

		return msg;
	}

	var data = {};
	var storage = Object.defineProperties({
		/**
   * @description
   * Safley sets item to session storage.
   *
   * @param {String} itemName The items name
   * @param {String} itemValue The items value
   *
   */
		item: function item(itemName, itemValue) {
			return this.setItem(itemName, itemValue);
		},
		/**
   * @description
   * Safley sets item to session storage. Alias: item()
   *
   * @param {String} itemName The items name
   * @param {String} itemValue The items value
   *
   */
		setItem: function setItem(itemName, itemValue) {
			data[itemName] = itemValue;
			if (this.localExists) {
				//Convert object to string
				if (_.isObject(itemValue)) {
					itemValue = JSON.stringify(itemValue);
				}
				window.sessionStorage.setItem(itemName, itemValue);
			}
		},

		/**
   * @description
   * Safley gets an item from session storage. Alias: item()
   *
   * @param {String} itemName The items name
   *
   * @return {String}
   *
   */
		getItem: function getItem(itemName) {
			if (data[itemName]) {
				return data[itemName];
			} else if (this.localExists) {
				var itemStr = window.sessionStorage.getItem(itemName);
				//Check that str is not null before parsing
				if (itemStr) {
					var isObj = false;
					var itemObj = null;
					//Try parsing to object
					try {
						itemObj = JSON.parse(itemStr);
						isObj = true;
					} catch (err) {
						// logger.log({message: 'String could not be parsed.', error: err, func: 'getItem', obj: 'storage'});
						//Parsing failed, this must just be a string
						isObj = false;
					}
					if (isObj) {
						return itemObj;
					}
				}
				return itemStr;
			} else {
				return null;
			}
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
			if (data[itemName]) {
				data[itemName] = null;
			}
			if (this.localExists) {
				try {
					//Clear session storage
					window.sessionStorage.removeItem(itemName);
				} catch (err) {
					____logger.error({ description: 'Error removing item from session storage', error: err, obj: 'storage', func: 'removeItem' });
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
   */
		clear: function clear() {
			//TODO: Only remove used items
			data = {};
			if (this.localExists) {
				try {
					//Clear session storage
					window.sessionStorage.clear();
				} catch (err) {
					____logger.warn('Session storage could not be cleared.', err);
				}
			}
		}

	}, {
		localExists: {
			get: function get() {
				var testKey = 'test';
				if (typeof window != 'undefined' && typeof window.sessionStorage != 'undefined') {
					try {
						window.sessionStorage.setItem(testKey, '1');
						window.sessionStorage.removeItem(testKey);
						return true;
					} catch (err) {
						____logger.error({ description: 'Error saving to session storage', error: err, obj: 'storage', func: 'localExists' });
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

	function decodeToken(tokenStr) {
		var tokenData = undefined;
		if (tokenStr && tokenStr != '') {
			try {
				tokenData = jwtDecode(tokenStr);
			} catch (err) {
				____logger.error({ description: 'Error decoding token.', data: tokenData, error: err, func: 'decodeToken', file: 'token' });
				throw new Error('Invalid token string.');
			}
		}
		return tokenData;
	}
	var token = Object.defineProperties({
		save: function save(tokenStr) {
			this.string = tokenStr;
		},
		'delete': function _delete() {
			storage.removeItem(_config.tokenName);
			storage.removeItem(_config.tokenDataName);
			____logger.log({ description: 'Token was removed.', func: 'delete', obj: 'token' });
		}
	}, {
		string: {
			get: function get() {
				return storage.getItem(_config.tokenName);
			},
			set: function set(tokenStr) {
				____logger.log({ description: 'Token was set.', token: tokenStr, func: 'string', obj: 'token' });
				this.data = jwtDecode(tokenStr);
				storage.setItem(_config.tokenName, tokenStr);
			},
			configurable: true,
			enumerable: true
		},
		data: {
			get: function get() {
				if (storage.getItem(_config.tokenDataName)) {
					return storage.getItem(_config.tokenDataName);
				} else {
					return decodeToken(this.string);
				}
			},
			set: function set(tokenData) {
				if (_.isString(tokenData)) {
					var tokenStr = tokenData;
					tokenData = decodeToken(tokenStr);
					____logger.info({ description: 'Token data was set as string. Decoding token.', token: tokenStr, tokenData: tokenData, func: 'data', obj: 'token' });
				} else {
					____logger.log({ description: 'Token data was set.', data: tokenData, func: 'data', obj: 'token' });
					storage.setItem(_config.tokenDataName, tokenData);
				}
			},
			configurable: true,
			enumerable: true
		}
	});

	var __request = {
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
					// logger.log({description: 'Response:', response:res, func:'handleResponse', file: 'request'});
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
		if (token.string) {
			req = req.set('Authorization', 'Bearer ' + token.string);
			console.info({ message: 'Set auth header', func: 'addAuthHeader', file: 'request' });
		}
		return req;
	}

	var Matter = (function () {
		/* Constructor
   * @param {string} appName Name of application
   */

		function Matter(appName, opts) {
			_classCallCheck(this, Matter);

			if (!appName) {
				____logger.error({ description: 'Application name requires to use Matter.', func: 'constructor', obj: 'Matter' });
				throw new Error('Application name is required to use Matter');
			} else {
				this.name = appName;
			}
			if (opts) {
				this.options = opts;
			}
		}

		/* Endpoint getter
   *
   */

		_createClass(Matter, [{
			key: 'signup',

			/* Signup
    *
    */
			value: function signup(signupData) {
				return __request.post(this.endpoint + '/signup', signupData).then(function (response) {
					____logger.log({ description: 'Account request successful.', signupData: signupData, response: response, func: 'signup', obj: 'Matter' });
					if (_.has(response, 'account')) {
						return response.account;
					} else {
						____logger.warn({ description: 'Account was not contained in signup response.', signupData: signupData, response: response, func: 'signup', obj: 'Matter' });
						return response;
					}
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error requesting signup.', signupData: signupData, error: errRes, func: 'signup', obj: 'Matter' });
					return Promise.reject(errRes);
				});
			}

			/** Login
    *
    */
		}, {
			key: 'login',
			value: function login(loginData) {
				var _this = this;

				if (!loginData || !loginData.password || !loginData.username) {
					____logger.error({ description: 'Username/Email and Password are required to login', func: 'login', obj: 'Matter' });
					return Promise.reject({ message: 'Username/Email and Password are required to login' });
				}
				return __request.put(this.endpoint + '/login', loginData).then(function (response) {
					if (_.has(response, 'data') && _.has(response.data, 'status') && response.data.status == 409) {
						____logger.warn({ description: 'Account not found.', response: response, func: 'login', obj: 'Matter' });
						return Promise.reject(response.data);
					} else {
						____logger.log({ description: 'Successful login.', response: response, func: 'login', obj: 'Matter' });
						if (_.has(response, 'token')) {
							_this.token.string = response.token;
						}
						if (_.has(response, 'account')) {
							_this.storage.setItem(_config.tokenUserDataName, response.account);
						}
						return response.account;
					}
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error requesting login.', error: errRes, status: errRes.status, func: 'login', obj: 'Matter' });
					if (errRes.status == 409 || errRes.status == 400) {
						errRes = errRes.response.text;
					}
					return Promise.reject(errRes);
				});
			}

			/** Logout
    */
		}, {
			key: 'logout',
			value: function logout() {
				var _this2 = this;

				return __request.put(this.endpoint + '/logout').then(function (response) {
					____logger.log({ description: 'Logout successful.', response: response, func: 'logout', obj: 'Matter' });
					_this2.currentUser = null;
					_this2.token['delete']();
					return response;
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error requesting log out: ', error: errRes, func: 'logout', obj: 'Matter' });
					_this2.storage.removeItem(_config.tokenUserDataName);
					_this2.token['delete']();
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'getCurrentUser',
			value: function getCurrentUser() {
				var _this3 = this;

				if (this.storage.item(_config.tokenUserDataName)) {
					return Promise.resove(this.storage.getItem(_config.tokenUserDataName));
				} else {
					if (this.isLoggedIn) {
						return __request.get(this.endpoint + '/user').then(function (response) {
							//TODO: Save user information locally
							____logger.log({ description: 'Current User Request responded.', responseData: response, func: 'currentUser', obj: 'Matter' });
							_this3.currentUser = response;
							return response;
						})['catch'](function (errRes) {
							if (err.status == 401) {
								____logger.warn({ description: 'Called for current user without token.', error: errRes, func: 'currentUser', obj: 'Matter' });
								return Promise.resolve(null);
							} else {
								____logger.error({ description: 'Error requesting current user.', error: errRes, func: 'currentUser', obj: 'Matter' });
								return Promise.reject(errRes);
							}
						});
					} else {
						return Promise.resolve(null);
					}
				}
			}
		}, {
			key: 'updateProfile',

			/** updateProfile
    */
			value: function updateProfile(updateData) {
				var _this4 = this;

				if (!this.isLoggedIn) {
					____logger.error({ description: 'No current user profile to update.', func: 'updateProfile', obj: 'Matter' });
					return Promise.reject({ message: 'Must be logged in to update profile.' });
				}
				//Send update request
				____logger.warn({ description: 'Calling update endpoint.', endpoint: this.endpoint + '/user/' + this.token.data.username, func: 'updateProfile', obj: 'Matter' });
				return __request.put(this.endpoint + '/user/' + this.token.data.username, updateData).then(function (response) {
					____logger.log({ description: 'Update profile request responded.', responseData: response, func: 'updateProfile', obj: 'Matter' });
					_this4.currentUser = response;
					return response;
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error requesting current user.', error: errRes, func: 'updateProfile', obj: 'Matter' });
					return Promise.reject(errRes);
				});
			}

			/** updateProfile
    */
		}, {
			key: 'isInGroup',

			//Check that user is in a single group or in all of a list of groups
			value: function isInGroup(checkGroups) {
				var _this5 = this;

				if (!this.isLoggedIn) {
					____logger.log({ description: 'No logged in user to check.', func: 'isInGroup', obj: 'Matter' });
					return false;
				}
				//Check if user is
				if (checkGroups && _.isString(checkGroups)) {
					var _ret = (function () {
						var groupName = checkGroups;
						//Single role or string list of roles
						var groupsArray = groupName.split(',');
						if (groupsArray.length > 1) {
							//String list of groupts
							____logger.info({ description: 'String list of groups.', list: groupsArray, func: 'isInGroup', obj: 'Matter' });
							return {
								v: _this5.isInGroups(groupsArray)
							};
						} else {
							//Single group
							var groups = _this5.token.data.groups || [];
							____logger.log({ description: 'Checking if user is in group.', group: groupName, userGroups: _this5.token.data.groups || [], func: 'isInGroup', obj: 'Matter' });
							return {
								v: _.any(groups, function (group) {
									return groupName == group.name;
								})
							};
						}
					})();

					if (typeof _ret === 'object') return _ret.v;
				} else if (checkGroups && _.isArray(checkGroups)) {
					//Array of roles
					//Check that user is in every group
					____logger.info({ description: 'Array of groups.', list: checkGroups, func: 'isInGroup', obj: 'Matter' });
					return this.isInGroups(checkGroups);
				} else {
					return false;
				}
				//TODO: Handle string and array inputs
			}
		}, {
			key: 'isInGroups',
			value: function isInGroups(checkGroups) {
				var _this6 = this;

				//Check if user is in any of the provided groups
				if (checkGroups && _.isArray(checkGroups)) {
					return _.map(checkGroups, function (group) {
						if (_.isString(group)) {
							//Group is string
							return _this6.isInGroup(group);
						} else {
							//Group is object
							return _this6.isInGroup(group.name);
						}
					});
				} else if (checkGroups && _.isString(checkGroups)) {
					//TODO: Handle spaces within string list
					var groupsArray = checkGroups.split(',');
					if (groupsArray.length > 1) {
						return this.isInGroups(groupsArray);
					}
					return this.isInGroup(groupsArray[0]);
				} else {
					____logger.error({ description: 'Invalid groups list.', func: 'isInGroups', obj: 'Matter' });
				}
			}
		}, {
			key: 'endpoint',
			get: function get() {
				var serverUrl = _config.serverUrl;
				if (_.has(this, 'options') && this.options.localServer) {
					serverUrl = 'http://localhost:4000';
					____logger.info({ description: 'LocalServer option was set to true. Now server url is local server.', url: serverUrl, func: 'endpoint', obj: 'Matter' });
				}
				if (this.name == 'tessellate') {
					//Remove url if host is server
					if (window && _.has(window, 'location') && window.location.host == serverUrl) {
						serverUrl = '';
						____logger.info({ description: 'Host is Server, serverUrl simplified!', url: serverUrl, func: 'endpoint', obj: 'Matter' });
					}
				} else {
					serverUrl = _config.serverUrl + '/apps/' + this.name;
					____logger.info({ description: 'Server url set.', url: serverUrl, func: 'endpoint', obj: 'Matter' });
				}
				return serverUrl;
			}
		}, {
			key: 'currentUser',
			set: function set(userData) {
				____logger.log({ description: 'Current User set.', user: userData, func: 'currentUser', obj: 'Matter' });
				this.storage.setItem(_config.tokenUserDataName, userData);
			},
			get: function get() {
				if (this.storage.getItem(_config.tokenUserDataName)) {
					return this.storage.getItem(_config.tokenUserDataName);
				} else {
					return null;
				}
			}
		}, {
			key: 'storage',
			get: function get() {
				return storage;
			}

			/** updateProfile
    */
		}, {
			key: 'token',
			get: function get() {
				return token;
			}
		}, {
			key: 'utils',
			get: function get() {
				return { logger: ____logger, request: __request, storage: storage };
			}
		}, {
			key: 'isLoggedIn',
			get: function get() {
				return this.token.string ? true : false;
			}
		}]);

		return Matter;
	})();

	var config = {
		serverUrl: 'http://tessellate.elasticbeanstalk.com',
		tokenName: 'grout',
		fbUrl: 'https://pruvit.firebaseio.com/',
		appName: 'tessellate',
		matterOptions: {
			localServer: true
		},
		aws: {
			region: 'us-east-1',
			cognito: {
				poolId: 'us-east-1:72a20ffd-c638-48b0-b234-3312b3e64b2e',
				params: {
					AuthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateUnauth_Role',
					UnauthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateAuth_Role'
				}
			}
		}
	};

	var matter = new Matter(config.appName, config.matterOptions);

	//Actions for specific user

	var GroupAction = (function () {
		function GroupAction(userName) {
			_classCallCheck(this, GroupAction);

			//Call matter with name and settings
			if (userName) {
				this.username = userName;
			} else {
				console.error('Username is required to start an GroupAction');
				throw new Error('Username is required to start an GroupAction');
			}
		}

		_createClass(GroupAction, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				return matter.utils.request.get(this.userEndpoint).then(function (response) {
					console.log('[MatterClient.user().get()] App(s) data loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.user().get()] Error getting users list: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Update an userlication
		}, {
			key: 'update',
			value: function update(userData) {
				return matter.utils.request.put(this.userEndpoint, userData).then(function (response) {
					console.log('[MatterClient.users().update()] App:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().update()] Error updating user: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Delete an userlication
			//TODO: Only do matter.utils.request if deleting personal account
		}, {
			key: 'del',
			value: function del(userData) {
				console.error('Deleting a user is currently disabled.');
				// return matter.utils.request.delete(this.endpoint, userData).then((response) => {
				// 	console.log('[MatterClient.users().del()] Apps:', response);
				// 	return new User(response);
				// })['catch']((errRes) => {
				// 	console.error('[MatterClient.users().del()] Error deleting user: ', errRes);
				// 	return Promise.reject(errRes);
				// });
			}
		}, {
			key: 'userEndpoint',
			get: function get() {
				return matter.endpoint + '/users/' + this.username;
			}
		}]);

		return GroupAction;
	})();

	var ___logger = matter.utils.logger;
	//Actions for users list

	var GroupsAction = (function () {
		function GroupsAction() {
			_classCallCheck(this, GroupsAction);
		}

		_createClass(GroupsAction, [{
			key: 'get',

			//Get users or single application
			value: function get() {
				console.log({ description: 'Users get called.', func: 'get', obj: 'GroupsAction' });
				return matter.utils.request.get(this.usersEndpoint).then(function (response) {
					console.log('users loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('error getting users');
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				return this.utils.request.post(this.usersEndpoint, appData).then(function (response) {
					console.log('[MatterClient.users().add()] Application added successfully: ', response);
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
				var searchEndpoint = this.usersEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				if (!query || query == '') {
					___logger.log({ description: 'Null query, returning empty array.', func: 'search', obj: 'GroupsAction' });
					return Promise.resolve([]);
				}
				return matter.utils.request.get(searchEndpoint).then(function (response) {
					console.log('[MatterClient.users().search()] Users(s) data loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().search()] Error getting users list: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'usersEndpoint',
			get: function get() {
				return matter.endpoint + '/users';
			}
		}]);

		return GroupsAction;
	})();

	var __logger = matter.utils.logger;
	//Actions for users list

	var UsersAction = (function () {
		function UsersAction() {
			_classCallCheck(this, UsersAction);
		}

		/**
   * Application class.
   *
   */

		_createClass(UsersAction, [{
			key: 'get',

			//Get users or single application
			value: function get() {
				console.log({ description: 'Users get called.', func: 'get', obj: 'UsersAction' });
				return matter.utils.request.get(this.usersEndpoint).then(function (response) {
					console.log('users loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('error getting users');
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				return this.utils.request.post(this.usersEndpoint, appData).then(function (response) {
					console.log('[MatterClient.users().add()] Application added successfully: ', response);
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
				var searchEndpoint = this.usersEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				if (!query || query == '') {
					__logger.log({ description: 'Null query, returning empty array.', func: 'search', obj: 'UsersAction' });
					return Promise.resolve([]);
				}
				return matter.utils.request.get(searchEndpoint).then(function (response) {
					console.log('[MatterClient.users().search()] Users(s) data loaded:', response);
					return response;
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().search()] Error getting users list: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'usersEndpoint',
			get: function get() {
				return matter.endpoint + '/users';
			}
		}]);

		return UsersAction;
	})();

	var _Application = (function () {
		function _Application(appData) {
			_classCallCheck(this, _Application);

			//Call matter with name and settings
			this.name = appData.name;
			this.owner = appData.owner || null;
			this.collaborators = appData.collaborators || [];
			this.createdAt = appData.createdAt;
			this.updatedAt = appData.updatedAt;
			this.frontend = appData.frontend || {};
			this.backend = appData.backend || {};
			this.groups = appData.groups || null;
			this.directories = appData.directories || null;
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
						// console.info('AWS creds are being updated to make matter.utils.request');
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
				return matter.utils.request.post(endpoint, appData).then(function (response) {
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
				// return matter.utils.request.post(endpoint, appData).then(function(response) {
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
		}, {
			key: 'user',
			value: function user(userData) {
				//TODO: Handle userData being a string or object
				//TODO: Handle this being an application's users action
				return new UserAction(userData);
			}
		}, {
			key: 'group',
			value: function group(groupData) {
				//TODO: Handle this being an application's group action
				return new GroupAction(groupData);
			}
		}, {
			key: 'users',
			get: function get() {
				//TODO: Handle this being an application's users action
				return new UsersAction();
			}
		}, {
			key: 'groups',
			get: function get() {
				//TODO: Handle this being an application's groups action
				return new GroupsAction();
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

			//Call matter with name and settings
			if (appName) {
				this.name = appName;
			} else {
				console.error('Application name is required to start an AppAction');
				throw new Error('Application name is required to start an AppAction');
			}
		}

		//Actions for applications list

		_createClass(AppAction, [{
			key: 'get',

			//Get applications or single application
			value: function get() {
				return matter.utils.request.get(this.appEndpoint).then(function (response) {
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
				return matter.utils.request.put(this.appEndpoint, appData).then(function (response) {
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
				return matter.utils.request['delete'](this.appEndpoint, appData).then(function (response) {
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
		}, {
			key: 'appEndpoint',
			get: function get() {
				return matter.endpoint + '/apps/' + this.name;
			}
		}]);

		return AppAction;
	})();

	var AppsAction = (function () {
		function AppsAction() {
			_classCallCheck(this, AppsAction);
		}

		/**
   * User class.
   *
   */

		_createClass(AppsAction, [{
			key: 'get',

			//Get applications or single application
			value: function get() {
				console.warn('matter.utils:', matter.utils);
				return matter.utils.request.get(this.appsEndpoint).then(function (response) {
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
				return matter.utils.request.post(this.appsEndpoint, appData).then(function (response) {
					console.log('[MatterClient.apps().add()] Application added successfully: ', response);
					return new Application(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.getApps()] Error adding application: ', errRes);
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'appsEndpoint',

			//Call matter with name and settings
			get: function get() {
				console.log('matter.endpoint is currently:', matter.endpoint);
				return matter.endpoint + '/apps';
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

			//Call matter with name and settings
			if (userName) {
				this.username = userName;
			} else {
				console.error('Username is required to start an UserAction');
				throw new Error('Username is required to start an UserAction');
			}
		}

		_createClass(UserAction, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				return matter.utils.request.get(this.userEndpoint).then(function (response) {
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
				return matter.utils.request.put(this.userEndpoint, userData).then(function (response) {
					console.log('[MatterClient.users().update()] App:', response);
					return new User(response);
				})['catch'](function (errRes) {
					console.error('[MatterClient.users().update()] Error updating user: ', errRes);
					return Promise.reject(errRes);
				});
			}

			//Delete an userlication
			//TODO: Only do matter.utils.request if deleting personal account
		}, {
			key: 'del',
			value: function del(userData) {
				console.error('Deleting a user is currently disabled.');
				// return matter.utils.request.delete(this.endpoint, userData).then((response) => {
				// 	console.log('[MatterClient.users().del()] Apps:', response);
				// 	return new User(response);
				// })['catch']((errRes) => {
				// 	console.error('[MatterClient.users().del()] Error deleting user: ', errRes);
				// 	return Promise.reject(errRes);
				// });
			}
		}, {
			key: 'userEndpoint',
			get: function get() {
				return matter.endpoint + '/users/' + this.username;
			}
		}]);

		return UserAction;
	})();

	var _request = matter.utils.request;
	var _logger = matter.utils.logger;
	//Actions for specific user

	var TemplateAction = (function () {
		function TemplateAction(templateName) {
			_classCallCheck(this, TemplateAction);

			//Call matter with name and settings
			if (templateName) {
				this.name = templateName;
			} else {
				_logger.error({ description: 'Template name is required to start a TemplateAction', func: 'construcotr', obj: '' });
				throw new Error('Template name is required to start a TemplateAction');
			}
		}

		_createClass(TemplateAction, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				_logger.log({ description: 'Get template called.', name: this.name, func: 'get', obj: 'TemplateAction' });
				return _request.get(this.templateEndpoint).then(function (response) {
					_logger.log({ description: 'Get template responded.', response: response, func: 'get', obj: 'TemplateAction' });
					return response;
				})['catch'](function (errRes) {
					_logger.error({ description: 'Error getting template.', error: errRes, func: 'get', obj: 'TemplateAction' });
					return Promise.reject(errRes);
				});
			}

			//Update an userlication
		}, {
			key: 'update',
			value: function update(templateData) {
				_logger.log({ description: 'Update template called.', templateData: templateData, func: 'update', obj: 'TemplateAction' });
				return _request.put(this.templateEndpoint, templateData).then(function (response) {
					_logger.log({ description: 'Update template responded.', response: response, templateData: templateData, func: 'update', obj: 'TemplateAction' });
					//TODO: Return template object
					return response;
				})['catch'](function (errRes) {
					_logger.error({ description: 'Error updating template.', error: errRes, func: 'update', obj: 'TemplateAction' });
					return Promise.reject(errRes);
				});
			}

			//Delete a template
		}, {
			key: 'del',
			value: function del(templateData) {
				_logger.log({ description: 'Delete template called.', templateData: templateData, func: 'del', obj: 'TemplateAction' });
				return _request['delete'](this.endpoint, templateData).then(function (response) {
					_logger.log({ description: 'Template deleted successfully.', response: response, func: 'del', obj: 'TemplateAction' });
					//TODO: Return template object
					return response;
				})['catch'](function (errRes) {
					_logger.error({ description: 'Error deleting template.', error: errRes, func: 'del', obj: 'TemplateAction' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'templateEndpoint',
			get: function get() {
				return matter.endpoint + '/templates/' + this.name;
			}
		}]);

		return TemplateAction;
	})();

	var logger = matter.utils.logger;
	var request = matter.utils.request;

	//Actions for templates list

	var TemplatesAction = (function () {
		function TemplatesAction() {
			_classCallCheck(this, TemplatesAction);
		}

		/**Grout Client Class
   * @ description Extending matter provides token storage and login/logout/signup capabilities
   */

		_createClass(TemplatesAction, [{
			key: 'get',

			//Get templates or single application
			value: function get() {
				logger.log({ description: 'Get template called.', func: 'get', obj: 'TemplatesAction' });
				return request.get(this.templatesEndpoint).then(function (response) {
					logger.log({ description: 'Templates loaded.', response: response, func: 'get', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					logger.error({ description: 'Error getting templates.', error: errRes, func: 'get', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				logger.log({ description: 'Add template called.', func: 'add', obj: 'TemplatesAction' });
				return request.post(this.templatesEndpoint, appData).then(function (response) {
					logger.log({ description: 'Templates added successfully.', func: 'add', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					logger.error({ description: 'Error adding template.', error: errRes, func: 'add', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}

			//Search with partial of username
		}, {
			key: 'search',
			value: function search(query) {
				logger.log({ description: 'Search template called.', query: query, func: 'search', obj: 'TemplatesAction' });
				var searchEndpoint = this.templatesEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				logger.log({ description: 'Search endpoint created.', endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
				return request.get(searchEndpoint).then(function (response) {
					logger.log({ description: 'Template(s) found successfully.', response: response, endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					logger.log({ description: 'Error searching for templates.', query: query, error: errRes, endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'templatesEndpoint',
			get: function get() {
				return matter.endpoint + '/templates';
			}
		}]);

		return TemplatesAction;
	})();

	var Grout = (function (_Matter) {
		_inherits(Grout, _Matter);

		//TODO: Use getter/setter to make this not a function

		function Grout() {
			_classCallCheck(this, Grout);

			//Call matter with tessellate
			_get(Object.getPrototypeOf(Grout.prototype), 'constructor', this).call(this, config.appName, config.matterOptions);
		}

		//Start a new Apps Action

		_createClass(Grout, [{
			key: 'app',

			//Start a new App action
			value: function app(appName) {
				console.log('New AppAction:', new AppAction(appName));
				return new AppAction(appName);
			}

			//Start a new Apps Action
		}, {
			key: 'template',

			//Start a new App action
			value: function template(appName) {
				console.log('New TemplateAction:', new TemplateAction(appName));
				return new TemplateAction(appName);
			}

			//Start a new Users action
		}, {
			key: 'user',

			//Start a new User action
			value: function user(username) {
				return new UserAction(username);
			}
		}, {
			key: 'apps',
			get: function get() {
				console.log('New AppsAction object:', new AppsAction());
				return new AppsAction();
			}
		}, {
			key: 'templates',
			get: function get() {
				console.log('New TemplatesAction object:', new TemplatesAction());
				return new TemplatesAction();
			}
		}, {
			key: 'users',
			get: function get() {
				return new UsersAction();
			}
		}]);

		return Grout;
	})(Matter);

	;

	return Grout;
});
//# sourceMappingURL=grout.js.map