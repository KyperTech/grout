var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('kyper-matter'), require('lodash'), require('aws-sdk'), require('firebase')) : typeof define === 'function' && define.amd ? define(['kyper-matter', 'lodash', 'aws-sdk', 'firebase'], factory) : global.Grout = factory(global.Matter, global._, global.AWS, global.Firebase);
})(this, function (Matter, _, AWS, Firebase) {
	'use strict';

	Matter = 'default' in Matter ? Matter['default'] : Matter;
	_ = 'default' in _ ? _['default'] : _;
	AWS = 'default' in AWS ? AWS['default'] : AWS;
	Firebase = 'default' in Firebase ? Firebase['default'] : Firebase;

	var config = {
		serverUrl: 'http://tessellate.elasticbeanstalk.com',
		tokenName: 'grout',
		fbUrl: 'https://kyper-tech.firebaseio.com/tessellate',
		appName: 'tessellate',
		matterOptions: {
			localServer: false
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

	var ________request = matter.utils.request;
	var ___________logger = matter.utils.logger;

	//Actions for specific directory

	var _Directory = (function () {
		function _Directory(actionData) {
			_classCallCheck(this, _Directory);

			if (actionData && _.isObject(actionData) && (_.has(actionData, 'directoryName') || _.has(actionData, 'name'))) {
				//Data is object containing directory data
				this.name = actionData.directoryName || actionData.name;
				if (_.has(actionData, 'appName')) {
					this.appName = actionData.appName;
				}
			} else if (actionData && _.isString(actionData)) {
				//Data is string name
				this.name = actionData;
			} else {
				___________logger.error({
					description: 'Action data object with name is required to start a Directory Action.',
					func: 'constructor', obj: 'Directory'
				});
				throw new Error('Directory Data object with name is required to start a Directory action.');
			}
		}

		_createClass(_Directory, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				return ________request.get(this.directoryEndpoint).then(function (response) {
					___________logger.info({
						description: 'Directory data loaded successfully.',
						response: response, func: 'get', obj: 'Directory'
					});
					return response;
				})['catch'](function (errRes) {
					___________logger.info({
						description: 'Error getting directory.',
						error: errRes, func: 'get', obj: 'Directory'
					});
					return Promise.reject(errRes);
				});
			}

			//Update an Directory
		}, {
			key: 'update',
			value: function update(directoryData) {
				___________logger.debug({
					description: 'Directory updated called.',
					directoryData: directoryData, func: 'update', obj: 'Directory'
				});
				return matter.utils.request.put(this.directoryEndpoint, directoryData).then(function (response) {
					___________logger.info({
						description: 'Directory updated successfully.',
						directoryData: directoryData, response: response,
						func: 'update', obj: 'Directory'
					});
					return response;
				})['catch'](function (errRes) {
					___________logger.error({
						description: 'Error updating directory.',
						directoryData: directoryData, error: errRes,
						func: 'update', obj: 'Directory'
					});
					return Promise.reject(errRes);
				});
			}

			//Delete an Directory
		}, {
			key: 'del',
			value: function del(directoryData) {
				___________logger.debug({
					description: 'Delete directory called.',
					directoryData: directoryData, func: 'del', obj: 'Directory'
				});
				return ________request['delete'](this.directoryEndpoint, directoryData).then(function (response) {
					___________logger.info({
						description: 'Directory deleted successfully.',
						directoryData: directoryData, func: 'del', obj: 'Directory'
					});
					return response;
				})['catch'](function (errRes) {
					___________logger.error({
						description: 'Error deleting directory.',
						error: errRes, func: 'del', obj: 'Directory'
					});
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'directoryEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'directories', this.name];
				//Check for app account action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				___________logger.log({
					description: 'Directory endpoint built.',
					endpoint: endpointStr, func: 'directoryEndpoint',
					obj: 'Directory'
				});
				return endpointStr;
			}
		}]);

		return _Directory;
	})();

	var _______request = matter.utils.request;
	var __________logger = matter.utils.logger;

	//Actions for directories list

	var DirectoriesAction = (function () {
		function DirectoriesAction(actionData) {
			_classCallCheck(this, DirectoriesAction);

			//Check to see if action is for a specific app
			if (actionData && _.isObject(actionData) && _.has(actionData, 'app')) {
				this.app = actionData.app;
				__________logger.log({ description: 'Provided app data set to app parameter.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
			} else if (actionData && _.isString(actionData)) {
				this.app = { name: actionData };
				__________logger.log({ description: 'App name provided as string was set.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
			}
			__________logger.info({ description: 'New directories action.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
		}

		_createClass(DirectoriesAction, [{
			key: 'get',

			//Get users or single application
			value: function get() {
				__________logger.debug({ description: 'Directories get called.', action: this, func: 'get', obj: 'DirectoriesAction' });
				return _______request.get(this.directoriesEndpoint).then(function (response) {
					__________logger.info({ descrption: 'Directories loaded successfully.', response: response, func: 'get', obj: 'DirectoriesAction' });
					return response;
				})['catch'](function (errRes) {
					__________logger.error({ descrption: 'error getting users', error: errRes, func: 'get', obj: 'DirectoriesAction' });
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				__________logger.debug({ description: 'Add directory called.', action: this, appData: appData, func: 'get', obj: 'DirectoriesAction' });
				return _______request.post(this.directoriesEndpoint, appData).then(function (response) {
					__________logger.log({ description: 'Application added successfully.', response: response, func: 'add', obj: 'DirectoriesAction' });
					//TODO: Return list of group objects
					return response;
				})['catch'](function (errRes) {
					__________logger.error({ description: 'Error adding group.', error: errRes, func: 'add', obj: 'DirectoriesAction' });
					return Promise.reject(errRes);
				});
			}

			//Search with partial of directory name
		}, {
			key: 'search',
			value: function search(query) {
				var searchEndpoint = this.directoriesEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				if (!query || query == '') {
					__________logger.debug({ description: 'Null query, returning empty array.', func: 'search', obj: 'DirectoriesAction' });
					return Promise.resolve([]);
				}
				return _______request.get(searchEndpoint).then(function (response) {
					__________logger.log({ description: 'Found directories based on search.', response: response, func: 'search', obj: 'DirectoriesAction' });
					return response;
				})['catch'](function (errRes) {
					__________logger.error({ description: 'Error searching directories.', error: errRes, func: 'search', obj: 'DirectoriesAction' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'directoriesEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'directories'];
				//Check for app groups action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				__________logger.log({ description: 'Directories endpoint built.', endpoint: endpointStr, func: 'directoriesEndpoint', obj: 'DirectoriesAction' });
				return endpointStr;
			}
		}]);

		return DirectoriesAction;
	})();

	var ______request = matter.utils.request;
	var _________logger = matter.utils.logger;

	//Actions for specific user

	var _Group = (function () {
		function _Group(actionData) {
			_classCallCheck(this, _Group);

			//Call matter with name and settings
			if (actionData && _.isObject(actionData) && _.has(actionData, 'groupData')) {
				//Data is object containing group data
				this.name = _.isObject(actionData.groupData) ? actionData.groupData.name : actionData.groupData;
				if (_.has(actionData, 'app')) {
					this.app = actionData.app;
				}
			} else if (actionData && _.isString(actionData)) {
				//Data is string name
				this.name = actionData;
			} else {
				_________logger.error({ description: 'Action data is required to start a Group Action.', func: 'constructor', obj: 'Group' });
				throw new Error('Username is required to start an Group');
			}
		}

		_createClass(_Group, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				return ______request.get(this.groupEndpoint).then(function (response) {
					_________logger.info({ description: 'Group data loaded successfully.', response: response, func: 'get', obj: 'Group' });
					return response;
				})['catch'](function (errRes) {
					_________logger.info({ description: 'Error getting group.', error: errRes, func: 'get', obj: 'Group' });
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}

			//Update an Group
		}, {
			key: 'update',
			value: function update(groupData) {
				_________logger.log({ description: 'Group updated called.', groupData: groupData, func: 'update', obj: 'Group' });
				return matter.utils.request.put(this.groupEndpoint, groupData).then(function (response) {
					_________logger.info({ description: 'Group updated successfully.', groupData: groupData, response: response, func: 'update', obj: 'Group' });
					return response;
				})['catch'](function (errRes) {
					_________logger.error({ description: 'Error updating group.', groupData: groupData, error: errRes, func: 'update', obj: 'Group' });
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}

			//Delete an Group
		}, {
			key: 'del',
			value: function del(groupData) {
				_________logger.log({ description: 'Delete group called.', groupData: groupData, func: 'del', obj: 'Group' });
				return ______request.del(this.groupEndpoint, {}).then(function (response) {
					_________logger.info({ description: 'Group deleted successfully.', groupData: groupData, func: 'del', obj: 'Group' });
					return response;
				})['catch'](function (errRes) {
					_________logger.error({ description: 'Error deleting group.', error: errRes, text: errRes.response.text, groupData: groupData, func: 'del', obj: 'Group' });
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}

			//Update an Group
		}, {
			key: 'addAccounts',
			value: function addAccounts(accountsData) {
				_________logger.log({ description: 'Group updated called.', accountsData: accountsData, func: 'update', obj: 'Group' });
				var accountsArray = accountsData;
				//Handle provided data being a string list
				if (_.isString(accountsData)) {
					accountsArray = accountsData.split(',');
				}
				//Check item in array to see if it is a string (username) instead of _id
				if (_.isString(accountsArray[0])) {
					_________logger.error({ description: 'Accounts array only currently supports account._id not account.username.', accountsData: accountsData, func: 'update', obj: 'Group' });
					return Promise.reject({ message: 'Accounts array only currently supports account._id not account.username.' });
				}
				_________logger.log({ description: 'Updating group with accounts array.', accountsArray: accountsArray, func: 'update', obj: 'Group' });
				return this.update({ accounts: accountsArray }).then(function (response) {
					_________logger.info({ description: 'Account(s) added to group successfully.', response: response, func: 'addAccounts', obj: 'Group' });
					return response;
				})['catch'](function (errRes) {
					_________logger.error({ description: 'Error addAccountseting group.', error: errRes, func: 'addAccounts', obj: 'Group' });
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}
		}, {
			key: 'groupEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'groups', this.name];
				//Check for app account action

				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				_________logger.log({ description: 'Group Endpoint built.', endpoint: endpointStr, func: 'groupEndpoint', obj: 'Group' });
				return endpointStr;
			}
		}]);

		return _Group;
	})();

	var _____request = matter.utils.request;
	var ________logger = matter.utils.logger;

	//Actions for users list

	var GroupsAction = (function () {
		function GroupsAction(actionData) {
			_classCallCheck(this, GroupsAction);

			//Check to see if action is for a specific app
			if (actionData && _.isObject(actionData) && _.has(actionData, 'app')) {
				this.app = actionData.app;
				________logger.log({
					description: 'Provided app data set to app parameter.',
					action: this, providedData: actionData,
					func: 'constructor', obj: 'GroupsAction'
				});
			} else if (actionData && _.isString(actionData)) {
				this.app = { name: actionData };
				________logger.log({
					description: 'App name provided as string was set.',
					action: this, providedData: actionData,
					func: 'constructor', obj: 'GroupsAction'
				});
			}
			________logger.info({
				description: 'New Groups action.', action: this,
				providedData: actionData, func: 'constructor', obj: 'GroupsAction'
			});
		}

		_createClass(GroupsAction, [{
			key: 'get',

			//Get users or single application
			value: function get() {
				________logger.log({
					description: 'Get group called.',
					func: 'get', obj: 'GroupsAction'
				});
				return _____request.get(this.groupsEndpoint).then(function (response) {
					________logger.info({
						description: 'Groups loaded successfully.',
						response: response, func: 'get', obj: 'GroupsAction'
					});
					return response;
				})['catch'](function (errRes) {
					________logger.info({
						description: 'Error getting groups.', error: errRes,
						func: 'get', obj: 'GroupsAction'
					});
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(groupData) {
				var newGroupData = groupData;
				________logger.debug({
					description: 'Add group called.', groupData: groupData,
					func: 'add', obj: 'GroupsAction'
				});
				if (_.isString(groupData)) {
					//Group data is string
					newGroupData = { name: groupData };
				}
				________logger.debug({
					description: 'Add group called.', newGroupData: newGroupData,
					func: 'add', obj: 'GroupsAction'
				});
				return _____request.post(this.groupsEndpoint, newGroupData).then(function (response) {
					________logger.log({
						description: 'Group added to application successfully.',
						response: response, func: 'add', obj: 'GroupsAction'
					});
					//TODO: Return list of group objects
					return response;
				})['catch'](function (errRes) {
					________logger.error({
						description: 'Error adding group.',
						error: errRes, func: 'add', obj: 'GroupsAction'
					});
					return Promise.reject(errRes);
				});
			}

			//Search with partial of username
		}, {
			key: 'search',
			value: function search(query) {
				________logger.debug({
					description: 'Search groups called.', query: query,
					func: 'search', obj: 'GroupsAction'
				});
				if (!query || query == '' || !_.isString(query)) {
					________logger.log({
						description: 'Null or invalid query, returning empty array.',
						func: 'search', obj: 'GroupsAction'
					});
					return Promise.resolve([]);
				}
				var searchEndpoint = this.groupsEndpoint + '/search/' + query;
				________logger.debug({
					description: 'Search endpoint created.',
					endpoint: searchEndpoint, func: 'search', obj: 'GroupsAction'
				});
				return _____request.get(searchEndpoint).then(function (response) {
					________logger.log({
						description: 'Found groups based on search.',
						response: response, func: 'search', obj: 'GroupsAction'
					});
					return response;
				})['catch'](function (errRes) {
					________logger.error({
						description: 'Error searching groups.',
						error: errRes, func: 'search', obj: 'GroupsAction'
					});
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'groupsEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'groups'];
				//Check for app groups action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				________logger.log({
					description: 'Groups Endpoint built.', endpoint: endpointStr,
					func: 'groupsEndpoint', obj: 'GroupsAction'
				});
				return endpointStr;
			}
		}]);

		return GroupsAction;
	})();

	var ____request = matter.utils.request;
	var _______logger = matter.utils.logger;

	//Actions for specific user

	var _Account = (function () {
		function _Account(accountData) {
			_classCallCheck(this, _Account);

			//Call matter with name and settings
			if (accountData && _.isObject(accountData) && _.has(accountData, 'username')) {
				_.extend(this, accountData);
			} else if (accountData && _.isString(accountData)) {
				this.username = accountData;
			} else {
				_______logger.error({
					description: 'AccountData is required to start an AccountAction',
					func: 'constructor', obj: 'Account'
				});
				throw new Error('username is required to start an AccountAction');
			}
		}

		//Build endpoint based on accountData

		_createClass(_Account, [{
			key: 'get',

			//Get a user
			value: function get() {
				_______logger.debug({ description: 'Account data loaded successfully.', func: 'get', obj: 'Account' });
				return ____request.get(this.accountEndpoint).then(function (response) {
					_______logger.info({ description: 'Account data loaded successfully.', response: response, func: 'get', obj: 'Account' });
					return new _Account(response);
				})['catch'](function (errRes) {
					_______logger.error({ description: 'Error getting user.', error: errRes, func: 'get', obj: 'Account' });
					return Promise.reject(errRes);
				});
			}

			//Update a Account
		}, {
			key: 'update',
			value: function update(accountData) {
				_______logger.debug({ description: 'Update user called.', accountData: accountData, func: 'update', obj: 'Account' });
				return ____request.put(this.accountEndpoint, accountData).then(function (response) {
					_______logger.info({ description: 'Account updated successfully.', func: 'update', obj: 'Account' });
					//TODO: Extend this with current info before returning
					return new _Account(response);
				})['catch'](function (errRes) {
					_______logger.error({ description: 'Error updating user.', func: 'update', obj: 'Account' });
					return Promise.reject(errRes);
				});
			}

			//Delete a Account
		}, {
			key: 'del',
			value: function del(accountData) {
				_______logger.debug({ description: 'Delete user called.', func: 'del', obj: 'Account' });
				return ____request.del(this.accountEndpoint, accountData).then(function (response) {
					_______logger.info({ description: 'Delete user successful.', response: response, func: 'del', obj: 'Account' });
					return new _Account(response);
				})['catch'](function (errRes) {
					_______logger.error({ description: 'Error deleting user.', accountData: accountData, error: errRes, func: 'del', obj: 'Account' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'accountEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'accounts', this.username];
				//Check for app account action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				_______logger.log({ description: 'Account Endpoint built.', endpoint: endpointStr, func: 'accountEndpoint', obj: 'Account' });
				return endpointStr;
			}
		}]);

		return _Account;
	})();

	var ______logger = matter.utils.logger;
	//Actions for accounts list

	var AccountsAction = (function () {
		function AccountsAction(actionData) {
			_classCallCheck(this, AccountsAction);

			//Check to see if action is for a specific app
			if (actionData && _.isObject(actionData) && _.has(actionData, 'app')) {
				this.app = actionData.app;
				______logger.log({ description: 'Provided app data set to app parameter.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
			} else if (actionData && _.isString(actionData)) {
				this.app = { name: actionData };
				______logger.log({ description: 'App name provided as string was set.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
			}
			______logger.info({ description: 'New Accounts action.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
		}

		_createClass(AccountsAction, [{
			key: 'get',

			//Get accounts or single application
			value: function get() {
				______logger.log({ description: 'Accounts get called.', func: 'get', obj: 'AccountsAction' });
				return matter.utils.request.get(this.accountsEndpoint).then(function (response) {
					______logger.info({ description: 'Accounts loaded successfully.', func: 'get', obj: 'AccountsAction' });
					return response;
				})['catch'](function (errRes) {
					______logger.info({ description: 'Error getting accounts.', error: errRes, func: 'get', obj: 'AccountsAction' });
					return Promise.reject(errRes.message || 'Error getting accounts.');
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(accountData) {
				______logger.info({ description: 'Account add called.', accountData: accountData, func: 'add', obj: 'AccountsAction' });
				return this.utils.request.post(this.accountsEndpoint, accountData).then(function (response) {
					______logger.info({ description: 'Account added successfully.', response: response, newAccount: new _Account(response), func: 'add', obj: 'AccountsAction' });
					return new _Account(response);
				})['catch'](function (errRes) {
					______logger.error({ description: 'Account add called.', error: errRes, accountData: accountData, func: 'add', obj: 'AccountsAction' });
					return Promise.reject(errRes.message || 'Error adding account.');
				});
			}

			//Search with partial of accountname
		}, {
			key: 'search',
			value: function search(query) {
				______logger.log({ description: 'Accounts search called.', query: query, func: 'search', obj: 'AccountsAction' });
				var searchEndpoint = this.accountsEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				if (!query || query == '') {
					______logger.log({ description: 'Null query, returning empty array.', func: 'search', obj: 'AccountsAction' });
					return Promise.resolve([]);
				}
				return matter.utils.request.get(searchEndpoint).then(function (response) {
					______logger.log({ description: 'Accounts search responded.', response: response, query: query, func: 'search', obj: 'AccountsAction' });
					return response;
				})['catch'](function (errRes) {
					______logger.error({ description: 'Error searching Accounts.', error: errRes, query: query, func: 'search', obj: 'AccountsAction' });
					return Promise.reject(errRes.message || 'Error searching accounts.');
				});
			}
		}, {
			key: 'accountsEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'accounts'];
				//Check for app account action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					//Splice apps, appName into index 1
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				______logger.log({ description: 'Accounts Endpoint built.', endpoint: endpointStr, func: 'accountsEndpoint', obj: 'AccountsAction' });
				return endpointStr;
			}
		}]);

		return AccountsAction;
	})();

	var ___request = matter.utils.request;
	var _____logger = matter.utils.logger;
	//Actions for specific user

	var _Template = (function () {
		function _Template(templateData) {
			_classCallCheck(this, _Template);

			//Call matter with name and settings
			if (templateData && _.isString(templateData)) {
				this.name = templateData;
			} else {
				_____logger.error({
					description: 'Template data is required to start a Template action.',
					func: 'constructor', obj: 'Template'
				});
				throw new Error('Template data is required to start a Template action.');
			}
		}

		_createClass(_Template, [{
			key: 'get',

			//Get userlications or single userlication
			value: function get() {
				_____logger.log({ description: 'Get template called.', name: this.name, func: 'get', obj: 'Template' });
				return ___request.get(this.templateEndpoint).then(function (response) {
					_____logger.log({ description: 'Get template responded.', response: response, func: 'get', obj: 'Template' });
					return response;
				})['catch'](function (errRes) {
					_____logger.error({ description: 'Error getting template.', error: errRes, func: 'get', obj: 'Template' });
					return Promise.reject(errRes);
				});
			}

			//Update an userlication
		}, {
			key: 'update',
			value: function update(templateData) {
				_____logger.log({ description: 'Update template called.', templateData: templateData, func: 'update', obj: 'Template' });
				return ___request.put(this.templateEndpoint, templateData).then(function (response) {
					_____logger.log({ description: 'Update template responded.', response: response, templateData: templateData, func: 'update', obj: 'Template' });
					//TODO: Return template object
					return response;
				})['catch'](function (errRes) {
					_____logger.error({ description: 'Error updating template.', error: errRes, func: 'update', obj: 'Template' });
					return Promise.reject(errRes);
				});
			}

			//Delete a template
		}, {
			key: 'del',
			value: function del(templateData) {
				_____logger.log({ description: 'Delete template called.', templateData: templateData, func: 'del', obj: 'Template' });
				return ___request['delete'](this.endpoint, templateData).then(function (response) {
					_____logger.log({ description: 'Template deleted successfully.', response: response, func: 'del', obj: 'Template' });
					//TODO: Return template object
					return response;
				})['catch'](function (errRes) {
					_____logger.error({ description: 'Error deleting template.', error: errRes, func: 'del', obj: 'Template' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'templateEndpoint',
			get: function get() {
				return matter.endpoint + '/templates/' + this.name;
			}
		}]);

		return _Template;
	})();

	var ____logger = matter.utils.logger;
	var __request = matter.utils.request;

	//Actions for templates list

	var TemplatesAction = (function () {
		function TemplatesAction() {
			_classCallCheck(this, TemplatesAction);
		}

		//Convenience vars

		_createClass(TemplatesAction, [{
			key: 'get',

			//Get templates or single application
			value: function get() {
				____logger.log({ description: 'Get template called.', func: 'get', obj: 'TemplatesAction' });
				return __request.get(this.templatesEndpoint).then(function (response) {
					____logger.log({ description: 'Templates loaded.', response: response, func: 'get', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error getting templates.', error: errRes, func: 'get', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				____logger.log({ description: 'Add template called.', func: 'add', obj: 'TemplatesAction' });
				return __request.post(this.templatesEndpoint, appData).then(function (response) {
					____logger.log({ description: 'Templates added successfully.', func: 'add', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					____logger.error({ description: 'Error adding template.', error: errRes, func: 'add', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}

			//Search with partial of username
		}, {
			key: 'search',
			value: function search(query) {
				____logger.log({ description: 'Search template called.', query: query, func: 'search', obj: 'TemplatesAction' });
				var searchEndpoint = this.templatesEndpoint + '/search/';
				if (query && _.isString(query)) {
					searchEndpoint += query;
				}
				____logger.log({ description: 'Search endpoint created.', endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
				return __request.get(searchEndpoint).then(function (response) {
					____logger.log({ description: 'Template(s) found successfully.', response: response, endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
					return response;
				})['catch'](function (errRes) {
					____logger.log({ description: 'Error searching for templates.', query: query, error: errRes, endpoint: searchEndpoint, func: 'search', obj: 'TemplatesAction' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'templatesEndpoint',
			get: function get() {
				var endpointArray = [matter.endpoint, 'templates'];
				//Check for app groups action
				if (_.has(this, 'app') && _.has(this.app, 'name')) {
					// endpointArray.splice(1, 0, 'apps', this.app.name);
					____logger.log({ description: 'Templates action is not currently supported for a specific application.', func: 'accountsEndpoint', obj: 'AccountsAction' });
				}
				//Create string from endpointArray
				var endpointStr = endpointArray.join('/');
				____logger.log({ description: 'Templates endpoint built.', endpoint: endpointStr, func: 'templatesEndpoint', obj: 'TemplatesAction' });
				return endpointStr;
			}
		}]);

		return TemplatesAction;
	})();

	var ___logger = matter.utils.logger;

	var _File = (function () {
		function _File(actionData) {
			_classCallCheck(this, _File);

			if (actionData && _.isObject(actionData) && _.has(actionData, 'fileData') && _.has(actionData, 'app')) {
				_.extend(this, actionData.fileData);
				this.app = actionData.app;
				this.pathArray = this.path.split('/');
				//Get name from data or from pathArray
				this.name = _.has(actionData.fileData, 'name') ? actionData.fileData.name : this.pathArray[this.pathArray.length - 1];
			} else if (actionData && !_.isObject(actionData)) {
				___logger.error({ description: 'File data is not an object. File data must be an object that includes path and appName.', func: 'constructor', obj: 'File' });
				//TODO: Get appName from path data?
				throw new Error('File data must be an object that includes path and appName.');
			} else {
				___logger.error({ description: 'File data that includes path and app is needed to create a File action.', func: 'constructor', obj: 'File' });
				throw new Error('File data with path and app is needed to create file action.');
			}
			this.type = 'file';
			___logger.debug({ description: 'File object constructed.', file: this, func: 'constructor', obj: 'File' });
		}

		//------------------ Utility Functions ------------------//

		// AWS Config

		_createClass(_File, [{
			key: 'get',
			value: function get() {
				var _this = this;

				if (!this.app || !this.app.frontend) {
					___logger.log({ description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File' });
					return this.app.get().then(function (appData) {
						_this.app = appData;
						___logger.log({ description: 'Application get successful. Getting file.', app: appData, func: 'get', obj: 'File' });
						return _this.get();
					}, function (err) {
						___logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', error: err, func: 'get', obj: 'File' });
						return Promise.reject({ message: 'Front end data is required to get file.' });
					});
				} else {
					var _ret = (function () {
						//If AWS Credential do not exist, set them
						if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
							___logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
							_setAWSConfig();
						}
						var s3 = new AWS.S3();
						var saveParams = {
							Bucket: _this.app.frontend.bucketName,
							Key: _this.path
						};
						//Set contentType from actionData to ContentType parameter of new object
						if (_this.contentType) {
							saveParams.ContentType = _this.contentType;
						}
						___logger.debug({ description: 'File get params built.', saveParams: saveParams, file: _this, func: 'get', obj: 'File' });
						return {
							v: new Promise(function (resolve, reject) {
								s3.getObject(saveParams, function (err, data) {
									//[TODO] Add putting object ACL (make public)
									if (!err) {
										___logger.info({ description: 'File loaded successfully.', fileData: data, func: 'get', obj: 'File' });
										if (_.has(data, 'Body')) {
											___logger.info({ description: 'File has content.', fileData: data.Body.toString(), func: 'get', obj: 'File' });
											resolve(data.Body.toString());
										} else {
											resolve(data);
										}
									} else {
										___logger.error({ description: 'Error loading file from S3.', error: err, func: 'get', obj: 'File' });
										return reject(err);
									}
								});
							})
						};
					})();

					if (typeof _ret === 'object') return _ret.v;
				}
			}

			//Alias for get
		}, {
			key: 'open',
			value: function open() {
				return this.get();
			}
		}, {
			key: 'publish',
			value: function publish(fileData) {
				var _this2 = this;

				//TODO: Publish file to application
				___logger.debug({ description: 'File publish called.', file: this, fileData: fileData, func: 'publish', obj: 'File' });
				if (!this.app.frontend) {
					___logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', func: 'publish', obj: 'File' });
					return Promise.reject({ message: 'Front end data is required to publish file.' });
				} else {
					var _ret2 = (function () {
						if (!_.has(fileData, ['content', 'path'])) {
							___logger.error({ description: 'File data including path and content required to publish.', func: 'publish', obj: 'File' });
							return {
								v: Promise.reject({ message: 'File data including path and content required to publish.' })
							};
						}
						var saveParams = {
							Bucket: _this2.app.frontend.bucketName,
							Key: fileData.path,
							Body: fileData.content,
							ACL: 'public-read'
						};
						//Set contentType from fileData to ContentType parameter of new object
						if (_this2.contentType) {
							saveParams.ContentType = _this2.contentType;
						}
						//If AWS Credential do not exist, set them
						if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
							___logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
							_setAWSConfig();
						}
						var s3 = new AWS.S3();

						___logger.debug({ description: 'File publish params built.', saveParams: saveParams, fileData: _this2, func: 'publish', obj: 'File' });
						return {
							v: new Promise(function (resolve, reject) {
								s3.putObject(saveParams, function (err, data) {
									//[TODO] Add putting object ACL (make public)
									if (!err) {
										___logger.log({ description: 'File saved successfully.', response: data, func: 'publish', obj: 'File' });
										resolve(data);
									} else {
										___logger.error({ description: 'Error saving file to S3.', error: err, func: 'publish', obj: 'File' });
										reject(err);
									}
								});
							})
						};
					})();

					if (typeof _ret2 === 'object') return _ret2.v;
				}
			}
		}, {
			key: 'del',
			value: function del() {
				var _this3 = this;

				if (!this.app || !this.app.frontend) {
					___logger.log({ description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File' });
					return this.app.get().then(function (appData) {
						_this3.app = appData;
						___logger.log({ description: 'Application get successful. Getting file.', app: appData, func: 'get', obj: 'File' });
						return _this3.get();
					}, function (err) {
						___logger.error({ description: 'Application Frontend data not available. Make sure to call .get().', error: err, func: 'get', obj: 'File' });
						return Promise.reject({ message: 'Front end data is required to get file.' });
					});
				} else {
					var _ret3 = (function () {
						//If AWS Credential do not exist, set them
						if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
							___logger.debug({ description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File' });
							_setAWSConfig();
						}
						var s3 = new AWS.S3();
						var saveParams = {
							Bucket: _this3.app.frontend.bucketName,
							Key: _this3.path
						};
						//Set contentType from actionData to ContentType parameter of new object
						if (_this3.contentType) {
							saveParams.ContentType = _this3.contentType;
						}
						___logger.debug({ description: 'File get params built.', saveParams: saveParams, file: _this3, func: 'get', obj: 'File' });
						return {
							v: new Promise(function (resolve, reject) {
								s3.deleteObject(saveParams, function (err, data) {
									//[TODO] Add putting object ACL (make public)
									if (!err) {
										___logger.info({ description: 'File loaded successfully.', fileData: data, func: 'get', obj: 'File' });
										if (_.has(data, 'Body')) {
											___logger.info({ description: 'File has content.', fileData: data.Body.toString(), func: 'get', obj: 'File' });
											resolve(data.Body.toString());
										} else {
											resolve(data);
										}
									} else {
										___logger.error({ description: 'Error loading file from S3.', error: err, func: 'get', obj: 'File' });
										return reject(err);
									}
								});
							})
						};
					})();

					if (typeof _ret3 === 'object') return _ret3.v;
				}
			}
		}, {
			key: 'getTypes',
			value: function getTypes() {
				//Get content type and file type from extension
			}
		}, {
			key: 'openWithFirepad',
			value: function openWithFirepad() {
				//TODO:Create new Firepad instance within div
			}
		}, {
			key: 'getDefaultContent',
			value: function getDefaultContent() {
				//TODO: Fill with default data for matching file type
			}
		}, {
			key: 'ext',
			get: function get() {
				var re = /(?:\.([^.]+))?$/;
				this.ext = re.exec(this.name)[1];
			}
		}]);

		return _File;
	})();

	function _setAWSConfig() {
		AWS.config.update({
			credentials: new AWS.CognitoIdentityCredentials({
				IdentityPoolId: config.aws.cognito.poolId
			}),
			region: config.aws.region
		});
	}

	//Convenience vars
	var __logger = matter.utils.logger;

	var Files = (function () {
		function Files(filesData) {
			_classCallCheck(this, Files);

			if (filesData && _.isObject(filesData) && _.has(filesData, 'app')) {
				//Data is object containing directory data
				this.app = filesData.app;
			} else if (filesData && _.isString(filesData)) {
				//Data is string name
				this.app = { name: filesData };
			} else if (filesData && _.isArray(filesData)) {
				//TODO: Handle an array of files being passed as data
				__logger.error({ description: 'Action data object with name is required to start a Files Action.', func: 'constructor', obj: 'Files' });
				throw new Error('Files Data object with application is required to start a Files action.');
			} else {
				__logger.error({ description: 'Action data object with name is required to start a Files Action.', func: 'constructor', obj: 'Files' });
				throw new Error('Files Data object with name is required to start a Files action.');
			}
			__logger.debug({ description: 'Files object constructed.', func: 'constructor', obj: 'Files' });
		}

		//------------------ Utility Functions ------------------//

		// AWS Config

		_createClass(Files, [{
			key: 'publish',
			value: function publish() {
				//TODO: Publish all files
			}
		}, {
			key: 'get',
			value: function get() {
				var _this4 = this;

				if (!this.app.frontend || !this.app.frontend.bucketName) {
					__logger.warn({ description: 'Application Frontend data not available. Calling .get().', app: this.app, func: 'get', obj: 'Files' });
					return this.app.get().then(function (applicationData) {
						__logger.log({ description: 'Application get returned.', data: applicationData, func: 'get', obj: 'Files' });
						_this4.app = applicationData;
						if (_.has(applicationData, 'frontend')) {
							return _this4.get();
						} else {
							__logger.error({ description: 'Application does not have Frontend to get files from.', func: 'get', obj: 'Files' });
							return Promise.reject({ message: 'Application does not have frontend to get files from.' });
						}
					}, function (err) {
						__logger.error({
							description: 'Application Frontend data not available. Make sure to call .get().',
							error: err, func: 'get', obj: 'Files' });
						return Promise.reject({ message: 'Bucket name required to get objects' });
					});
				} else {
					var _ret4 = (function () {
						//If AWS Credential do not exist, set them
						if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
							// logger.info('AWS creds are being updated to make request');
							setAWSConfig();
						}
						var s3 = new AWS.S3();
						var listParams = { Bucket: _this4.app.frontend.bucketName };
						return {
							v: new Promise(function (resolve, reject) {
								s3.listObjects(listParams, function (err, data) {
									if (!err) {
										__logger.info({ description: 'Files list loaded.', filesData: data, func: 'get', obj: 'Files' });
										return resolve(data.Contents);
									} else {
										__logger.error({ description: 'Error getting files from S3.', error: err, func: 'get', obj: 'Files' });
										return reject(err);
									}
								});
							})
						};
					})();

					if (typeof _ret4 === 'object') return _ret4.v;
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
				__logger.debug({ description: 'Build Structure called.', func: 'buildStructure', obj: 'Application' });
				return this.get().then(function (filesArray) {
					var childStruct = childrenStructureFromArray(filesArray);
					//TODO: have child objects have correct classes (file/folder)
					__logger.log({ description: 'Child struct from array.', childStructure: childStruct, func: 'buildStructure', obj: 'Application' });
					return childStruct;
				}, function (err) {
					__logger.error({ description: 'Error getting application files.', error: err, func: 'buildStructure', obj: 'Application' });
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
					currentObj.path = _.take(list, ind + 1).join('/');
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
		_.each(mappedArray, function (obj) {
			if (takenNames.indexOf(obj.name) == -1) {
				takenNames.push(obj.name);
				finishedArray.push(obj);
			} else {
				var likeObj = _.findWhere(mappedArray, { name: obj.name });
				//Combine children of like objects
				likeObj.children = _.union(obj.children, likeObj.children);
				likeObj.children = combineLikeObjs(likeObj.children);
				// logger.log('extended obj:',likeObj);
			}
		});
		return finishedArray;
	}

	//Convenience vars
	var _request = matter.utils.request;
	var _logger = matter.utils.logger;

	/**
  * Application class.
  *
  */

	var Application = (function () {
		function Application(appData) {
			_classCallCheck(this, Application);

			//Setup application data based on input
			if (appData && _.isObject(appData)) {
				_.extend(this, appData);
			} else if (appData && _.isString(appData)) {
				this.name = appData;
			}
			if (Firebase && _.has(config, 'fbUrl') && _.has(this, 'name')) {
				this.fbRef = new Firebase(config.fbUrl + this.name);
			}
			// logger.debug({description: 'Application object created.', application: this, func: 'constructor', obj: 'Application'});
		}

		_createClass(Application, [{
			key: 'get',

			//Get applications or single application
			value: function get() {
				_logger.debug({
					description: 'Application get called.', func: 'get', obj: 'Application'
				});
				return _request.get(this.appEndpoint).then(function (response) {
					_logger.info({
						description: 'Application loaded successfully.', response: response,
						application: new Application(response), func: 'get', obj: 'Application'
					});
					return new Application(response);
				})['catch'](function (errRes) {
					_logger.error({
						description: 'Error getting Application.',
						message: errRes.response.text, error: errRes,
						func: 'get', obj: 'Application'
					});
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}

			//Update an application
		}, {
			key: 'update',
			value: function update(appData) {
				_logger.debug({
					description: 'Application update called.',
					func: 'update', obj: 'Application'
				});
				return _request.put(this.appEndpoint, appData).then(function (response) {
					_logger.info({
						description: 'Application updated successfully.',
						response: response, func: 'update', obj: 'Application'
					});
					return new Application(response);
				})['catch'](function (errRes) {
					_logger.error({
						description: 'Error updating application.',
						error: errRes, func: 'update', obj: 'Application'
					});
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}
		}, {
			key: 'addStorage',
			value: function addStorage() {
				_logger.debug({
					description: 'Application add storage called.', application: this,
					func: 'addStorage', obj: 'Application'
				});
				return _request.post(this.appEndpoint + '/storage', {}).then(function (response) {
					_logger.info({
						description: 'Storage successfully added to application.',
						response: response, application: new Application(response),
						func: 'addStorage', obj: 'Application'
					});
					return new Application(response);
				})['catch'](function (errRes) {
					_logger.error({
						description: 'Error adding storage to application.',
						error: errRes, func: 'addStorage', obj: 'Application'
					});
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}
		}, {
			key: 'applyTemplate',
			value: function applyTemplate() {
				var _this5 = this;

				_logger.error({
					description: 'Applying templates to existing applications is not currently supported.',
					func: 'applyTemplate', obj: 'Application'
				});
				return _request.post(this.appEndpoint, {}).then(function (response) {
					_logger.info({
						description: 'Template successfully applied to application.',
						response: response, application: _this5,
						func: 'applyTemplate', obj: 'Application'
					});
					return new Application(response);
				})['catch'](function (errRes) {
					_logger.error({
						description: 'Error applying template to application.',
						error: errRes, application: _this5,
						func: 'applyTemplate', obj: 'Application'
					});
					return Promise.reject(errRes.response.text || errRes.response);
				});
			}

			//Files object that contains files methods
		}, {
			key: 'File',
			value: function File(fileData) {
				_logger.debug({
					description: 'Applications file action called.',
					fileData: fileData, application: this,
					func: 'file', obj: 'Application'
				});
				return new _File({ app: this, fileData: fileData });
			}
		}, {
			key: 'User',
			value: function User(userData) {
				_logger.debug({
					description: 'Applications user action called.',
					userData: userData, application: this, func: 'user',
					obj: 'Application'
				});
				return new _Account({ app: this, userData: userData });
			}
		}, {
			key: 'Account',
			value: function Account(userData) {
				_logger.debug({
					description: 'Applications account action called.',
					userData: userData, application: this,
					func: 'user', obj: 'Application'
				});
				return new _Account({ app: this, userData: userData });
			}
		}, {
			key: 'Group',
			value: function Group(groupData) {
				_logger.debug({
					description: 'Applications group action called.',
					groupData: groupData, application: this,
					func: 'group', obj: 'Application'
				});
				return new _Group({ app: this, groupData: groupData });
			}
		}, {
			key: 'Directory',
			value: function Directory(directoryData) {
				_logger.debug({
					description: 'Applications directory action called.',
					directoryData: directoryData, application: this,
					func: 'directory', obj: 'Application'
				});
				return new _Directory({ app: this, directoryData: directoryData });
			}
		}, {
			key: 'appEndpoint',
			get: function get() {
				return matter.endpoint + '/apps/' + this.name;
			}
		}, {
			key: 'Files',
			get: function get() {
				_logger.debug({
					description: 'Applications files action called.',
					application: this, func: 'files', obj: 'Application'
				});
				return new Files({ app: this });
			}
		}, {
			key: 'Users',
			get: function get() {
				_logger.debug({
					description: 'Applications users action called.',
					application: this, func: 'user', obj: 'Application'
				});
				return new AccountsAction({ app: this });
			}
		}, {
			key: 'Accounts',
			get: function get() {
				_logger.debug({
					description: 'Applications account action called.',
					application: this, func: 'user', obj: 'Application'
				});
				return new AccountsAction({ app: this });
			}
		}, {
			key: 'Groups',
			get: function get() {
				_logger.debug({
					description: 'Applications groups action called.',
					application: this, func: 'groups', obj: 'Application'
				});
				return new GroupsAction({ app: this });
			}
		}, {
			key: 'Directories',
			get: function get() {
				_logger.debug({
					description: 'Applications directories action called.',
					application: this, func: 'directories', obj: 'Application'
				});
				return new DirectoriesAction({ app: this });
			}
		}]);

		return Application;
	})();

	var request = matter.utils.request;
	var logger = matter.utils.logger;

	//Actions for applications list

	var AppsAction = (function () {
		function AppsAction() {
			_classCallCheck(this, AppsAction);
		}

		/**Grout Client Class
   * @ description Extending matter provides token storage and login/logout/signup capabilities
   */

		_createClass(AppsAction, [{
			key: 'get',

			//Get applications or single application
			value: function get() {
				logger.debug({ description: 'Apps get called.', action: this, func: 'get', obj: 'AppsAction' });
				return request.get(this.appsEndpoint).then(function (response) {
					logger.info({ description: 'Apps data loaded successfully.', response: response, func: 'get', obj: 'AppsAction' });
					//TODO: Return application object
					// return new Application(response);
					return response;
				})['catch'](function (errRes) {
					logger.error({ description: 'Error getting apps data.', error: errRes, func: 'get', obj: 'AppsAction' });
					return Promise.reject(errRes);
				});
			}

			//Add an application
		}, {
			key: 'add',
			value: function add(appData) {
				logger.debug({ description: 'Application add called.', appData: appData, func: 'add', obj: 'AppsAction' });
				return matter.utils.request.post(this.appsEndpoint, appData).then(function (response) {
					logger.info({ description: 'Application added successfully.', response: response, func: 'add', obj: 'AppsAction' });
					// TODO: Return application object
					// return new Application(response);
					return response;
				})['catch'](function (errRes) {
					logger.error({ description: 'Error adding app.', error: errRes, func: 'add', obj: 'AppsAction' });
					return Promise.reject(errRes);
				});
			}
		}, {
			key: 'appsEndpoint',

			//Call matter with name and settings
			get: function get() {
				return matter.endpoint + '/apps';
			}
		}]);

		return AppsAction;
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
			key: 'App',

			//Start a new App action
			value: function App(appName) {
				this.utils.logger.debug({ description: 'Application action called.', appName: appName, template: new Application(appName), func: 'App', obj: 'Grout' });
				return new Application(appName);
			}

			//Start a new Apps Action
		}, {
			key: 'Template',

			//Start a new App action
			value: function Template(templateData) {
				this.utils.logger.debug({ description: 'Template Action called.', templateData: templateData, template: new _Template(templateData), func: 'Template', obj: 'Grout' });
				return new _Template(templateData);
			}

			//Start a new Accounts action
		}, {
			key: 'Account',

			//Start a new Account action
			value: function Account(userData) {
				this.utils.logger.debug({ description: 'Account Action called.', userData: userData, user: new _Account(userData), func: 'user', obj: 'Grout' });
				return new _Account(userData);
			}

			//ALIAS OF ACCOUNTS
			//Start a new Accounts action
		}, {
			key: 'User',

			//ALIAS OF ACCOUNT
			//Start a new Account action
			value: function User(userData) {
				this.utils.logger.debug({ description: 'Account Action called.', userData: userData, user: new _Account(userData), func: 'user', obj: 'Grout' });
				return new _Account(userData);
			}

			//Start a new Groups action
		}, {
			key: 'Group',

			//Start a new Group action
			value: function Group(groupData) {
				this.utils.logger.debug({
					description: 'Group Action called.', groupData: groupData,
					action: new _Group({ app: this, groupData: groupData }),
					func: 'group', obj: 'Grout'
				});
				return new _Group(groupData);
			}

			//Start a new Directories action
		}, {
			key: 'Directory',

			//Start a new Group action
			value: function Directory(directoryData) {
				this.utils.logger.debug({
					description: 'Directory Action called.', directoryData: directoryData,
					action: new _Directory(directoryData), func: 'directory', obj: 'Grout'
				});
				return new _Directory(directoryData);
			}
		}, {
			key: 'Apps',
			get: function get() {
				this.utils.logger.debug({
					description: 'Apps Action called.', action: new AppsAction(),
					func: 'Apps', obj: 'Grout'
				});
				return new AppsAction();
			}
		}, {
			key: 'Templates',
			get: function get() {
				this.utils.logger.debug({ description: 'Templates Action called.', action: new TemplatesAction(), func: 'Templates', obj: 'Grout' });
				return new TemplatesAction();
			}
		}, {
			key: 'Accounts',
			get: function get() {
				this.utils.logger.debug({ description: 'Account Action called.', action: new AccountsAction(), func: 'users', obj: 'Grout' });
				return new AccountsAction();
			}
		}, {
			key: 'Users',
			get: function get() {
				this.utils.logger.debug({ description: 'Accounts Action called.', action: new AccountsAction(), func: 'Users', obj: 'Grout' });
				return new AccountsAction();
			}
		}, {
			key: 'Groups',
			get: function get() {
				this.utils.logger.debug({
					description: 'Groups Action called.', action: new GroupsAction(), func: 'groups', obj: 'Grout'
				});
				return new GroupsAction();
			}
		}, {
			key: 'Directories',
			get: function get() {
				this.utils.logger.debug({
					description: 'Directories Action called.',
					action: new DirectoriesAction(), func: 'directories', obj: 'Grout'
				});
				return new DirectoriesAction();
			}
		}]);

		return Grout;
	})(Matter);

	return Grout;
});
//# sourceMappingURL=grout.js.map
