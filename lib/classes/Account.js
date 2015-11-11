Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _classesMatter = require('../classes/Matter');

var _classesMatter2 = _interopRequireDefault(_classesMatter);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var request = _classesMatter2['default'].utils.request;
var logger = _classesMatter2['default'].utils.logger;

//Actions for specific user

var Account = (function () {
	function Account(accountData) {
		_classCallCheck(this, Account);

		//Call matter with name and settings
		if (accountData && _lodash2['default'].isObject(accountData) && _lodash2['default'].has(accountData, 'username')) {
			_lodash2['default'].extend(this, accountData);
		} else if (accountData && _lodash2['default'].isString(accountData)) {
			this.username = accountData;
		} else {
			logger.error({
				description: 'AccountData is required to start an AccountAction',
				func: 'constructor', obj: 'Account'
			});
			throw new Error('username is required to start an AccountAction');
		}
	}

	//Build endpoint based on accountData

	_createClass(Account, [{
		key: 'get',

		//Get a user
		value: function get() {
			logger.debug({ description: 'Account data loaded successfully.', func: 'get', obj: 'Account' });
			return request.get(this.accountEndpoint).then(function (response) {
				logger.info({ description: 'Account data loaded successfully.', response: response, func: 'get', obj: 'Account' });
				return new Account(response);
			})['catch'](function (errRes) {
				logger.error({ description: 'Error getting user.', error: errRes, func: 'get', obj: 'Account' });
				return Promise.reject(errRes);
			});
		}

		//Update a Account
	}, {
		key: 'update',
		value: function update(accountData) {
			logger.debug({ description: 'Update user called.', accountData: accountData, func: 'update', obj: 'Account' });
			return request.put(this.accountEndpoint, accountData).then(function (response) {
				logger.info({ description: 'Account updated successfully.', func: 'update', obj: 'Account' });
				//TODO: Extend this with current info before returning
				return new Account(response);
			})['catch'](function (errRes) {
				logger.error({ description: 'Error updating user.', func: 'update', obj: 'Account' });
				return Promise.reject(errRes);
			});
		}

		//Delete a Account
	}, {
		key: 'del',
		value: function del(accountData) {
			logger.debug({ description: 'Delete user called.', func: 'del', obj: 'Account' });
			return request.del(this.accountEndpoint, accountData).then(function (response) {
				logger.info({ description: 'Delete user successful.', response: response, func: 'del', obj: 'Account' });
				return new Account(response);
			})['catch'](function (errRes) {
				logger.error({ description: 'Error deleting user.', accountData: accountData, error: errRes, func: 'del', obj: 'Account' });
				return Promise.reject(errRes);
			});
		}
	}, {
		key: 'accountEndpoint',
		get: function get() {
			var endpointArray = [_classesMatter2['default'].endpoint, 'accounts', this.username];
			//Check for app account action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({ description: 'Account Endpoint built.', endpoint: endpointStr, func: 'accountEndpoint', obj: 'Account' });
			return endpointStr;
		}
	}]);

	return Account;
})();

exports['default'] = Account;
module.exports = exports['default'];