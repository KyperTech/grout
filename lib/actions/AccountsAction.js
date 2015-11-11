Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classesMatter = require('../classes/Matter');

var _classesMatter2 = _interopRequireDefault(_classesMatter);

var _classesAccount = require('../classes/Account');

var _classesAccount2 = _interopRequireDefault(_classesAccount);

var logger = _classesMatter2['default'].utils.logger;
//Actions for accounts list

var AccountsAction = (function () {
	function AccountsAction(actionData) {
		_classCallCheck(this, AccountsAction);

		//Check to see if action is for a specific app
		if (actionData && _lodash2['default'].isObject(actionData) && _lodash2['default'].has(actionData, 'app')) {
			this.app = actionData.app;
			logger.log({ description: 'Provided app data set to app parameter.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
		} else if (actionData && _lodash2['default'].isString(actionData)) {
			this.app = { name: actionData };
			logger.log({ description: 'App name provided as string was set.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
		}
		logger.info({ description: 'New Accounts action.', action: this, providedData: actionData, func: 'constructor', obj: 'AccountsAction' });
	}

	_createClass(AccountsAction, [{
		key: 'get',

		//Get accounts or single application
		value: function get() {
			logger.log({ description: 'Accounts get called.', func: 'get', obj: 'AccountsAction' });
			return _classesMatter2['default'].utils.request.get(this.accountsEndpoint).then(function (response) {
				logger.info({ description: 'Accounts loaded successfully.', func: 'get', obj: 'AccountsAction' });
				return response;
			})['catch'](function (errRes) {
				logger.info({ description: 'Error getting accounts.', error: errRes, func: 'get', obj: 'AccountsAction' });
				return Promise.reject(errRes.message || 'Error getting accounts.');
			});
		}

		//Add an application
	}, {
		key: 'add',
		value: function add(accountData) {
			logger.info({ description: 'Account add called.', accountData: accountData, func: 'add', obj: 'AccountsAction' });
			return this.utils.request.post(this.accountsEndpoint, accountData).then(function (response) {
				logger.info({ description: 'Account added successfully.', response: response, newAccount: new _classesAccount2['default'](response), func: 'add', obj: 'AccountsAction' });
				return new _classesAccount2['default'](response);
			})['catch'](function (errRes) {
				logger.error({ description: 'Account add called.', error: errRes, accountData: accountData, func: 'add', obj: 'AccountsAction' });
				return Promise.reject(errRes.message || 'Error adding account.');
			});
		}

		//Search with partial of accountname
	}, {
		key: 'search',
		value: function search(query) {
			logger.log({ description: 'Accounts search called.', query: query, func: 'search', obj: 'AccountsAction' });
			var searchEndpoint = this.accountsEndpoint + '/search/';
			if (query && _lodash2['default'].isString(query)) {
				searchEndpoint += query;
			}
			if (!query || query == '') {
				logger.log({ description: 'Null query, returning empty array.', func: 'search', obj: 'AccountsAction' });
				return Promise.resolve([]);
			}
			return _classesMatter2['default'].utils.request.get(searchEndpoint).then(function (response) {
				logger.log({ description: 'Accounts search responded.', response: response, query: query, func: 'search', obj: 'AccountsAction' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error searching Accounts.', error: errRes, query: query, func: 'search', obj: 'AccountsAction' });
				return Promise.reject(errRes.message || 'Error searching accounts.');
			});
		}
	}, {
		key: 'accountsEndpoint',
		get: function get() {
			var endpointArray = [_classesMatter2['default'].endpoint, 'accounts'];
			//Check for app account action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				//Splice apps, appName into index 1
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({ description: 'Accounts Endpoint built.', endpoint: endpointStr, func: 'accountsEndpoint', obj: 'AccountsAction' });
			return endpointStr;
		}
	}]);

	return AccountsAction;
})();

exports['default'] = AccountsAction;
module.exports = exports['default'];