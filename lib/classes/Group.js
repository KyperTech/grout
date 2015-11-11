Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var request = _Matter2['default'].utils.request;
var logger = _Matter2['default'].utils.logger;

//Actions for specific user

var Group = (function () {
	function Group(actionData) {
		_classCallCheck(this, Group);

		//Call matter with name and settings
		if (actionData && _lodash2['default'].isObject(actionData) && _lodash2['default'].has(actionData, 'groupData')) {
			//Data is object containing group data
			this.name = _lodash2['default'].isObject(actionData.groupData) ? actionData.groupData.name : actionData.groupData;
			if (_lodash2['default'].has(actionData, 'app')) {
				this.app = actionData.app;
			}
		} else if (actionData && _lodash2['default'].isString(actionData)) {
			//Data is string name
			this.name = actionData;
		} else {
			logger.error({ description: 'Action data is required to start a Group Action.', func: 'constructor', obj: 'Group' });
			throw new Error('Username is required to start an Group');
		}
	}

	_createClass(Group, [{
		key: 'get',

		//Get userlications or single userlication
		value: function get() {
			return request.get(this.groupEndpoint).then(function (response) {
				logger.info({ description: 'Group data loaded successfully.', response: response, func: 'get', obj: 'Group' });
				return response;
			})['catch'](function (errRes) {
				logger.info({ description: 'Error getting group.', error: errRes, func: 'get', obj: 'Group' });
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}

		//Update an Group
	}, {
		key: 'update',
		value: function update(groupData) {
			logger.log({ description: 'Group updated called.', groupData: groupData, func: 'update', obj: 'Group' });
			return _Matter2['default'].utils.request.put(this.groupEndpoint, groupData).then(function (response) {
				logger.info({ description: 'Group updated successfully.', groupData: groupData, response: response, func: 'update', obj: 'Group' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error updating group.', groupData: groupData, error: errRes, func: 'update', obj: 'Group' });
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}

		//Delete an Group
	}, {
		key: 'del',
		value: function del(groupData) {
			logger.log({ description: 'Delete group called.', groupData: groupData, func: 'del', obj: 'Group' });
			return request.del(this.groupEndpoint, {}).then(function (response) {
				logger.info({ description: 'Group deleted successfully.', groupData: groupData, func: 'del', obj: 'Group' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error deleting group.', error: errRes, text: errRes.response.text, groupData: groupData, func: 'del', obj: 'Group' });
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}

		//Update an Group
	}, {
		key: 'addAccounts',
		value: function addAccounts(accountsData) {
			logger.log({ description: 'Group updated called.', accountsData: accountsData, func: 'update', obj: 'Group' });
			var accountsArray = accountsData;
			//Handle provided data being a string list
			if (_lodash2['default'].isString(accountsData)) {
				accountsArray = accountsData.split(',');
			}
			//Check item in array to see if it is a string (username) instead of _id
			if (_lodash2['default'].isString(accountsArray[0])) {
				logger.error({ description: 'Accounts array only currently supports account._id not account.username.', accountsData: accountsData, func: 'update', obj: 'Group' });
				return Promise.reject({ message: 'Accounts array only currently supports account._id not account.username.' });
			}
			logger.log({ description: 'Updating group with accounts array.', accountsArray: accountsArray, func: 'update', obj: 'Group' });
			return this.update({ accounts: accountsArray }).then(function (response) {
				logger.info({ description: 'Account(s) added to group successfully.', response: response, func: 'addAccounts', obj: 'Group' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error addAccountseting group.', error: errRes, func: 'addAccounts', obj: 'Group' });
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}
	}, {
		key: 'groupEndpoint',
		get: function get() {
			var endpointArray = [_Matter2['default'].endpoint, 'groups', this.name];
			//Check for app account action

			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({ description: 'Group Endpoint built.', endpoint: endpointStr, func: 'groupEndpoint', obj: 'Group' });
			return endpointStr;
		}
	}]);

	return Group;
})();

exports['default'] = Group;
module.exports = exports['default'];