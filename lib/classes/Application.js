Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

//Internal libs and config

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

//Actions and Classes

var _actionsGroupsAction = require('../actions/GroupsAction');

var _actionsGroupsAction2 = _interopRequireDefault(_actionsGroupsAction);

var _Group2 = require('./Group');

var _Group3 = _interopRequireDefault(_Group2);

var _actionsDirectoriesAction = require('../actions/DirectoriesAction');

var _actionsDirectoriesAction2 = _interopRequireDefault(_actionsDirectoriesAction);

var _Directory2 = require('./Directory');

var _Directory3 = _interopRequireDefault(_Directory2);

var _actionsAccountsAction = require('../actions/AccountsAction');

var _actionsAccountsAction2 = _interopRequireDefault(_actionsAccountsAction);

var _Account2 = require('./Account');

var _Account3 = _interopRequireDefault(_Account2);

var _Files = require('./Files');

var _Files2 = _interopRequireDefault(_Files);

var _File2 = require('./File');

var _File3 = _interopRequireDefault(_File2);

//External Libs

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

//Convenience vars
var request = _Matter2['default'].utils.request;
var logger = _Matter2['default'].utils.logger;

/**
 * Application class.
 *
 */

var Application = (function () {
	function Application(appData) {
		_classCallCheck(this, Application);

		//Setup application data based on input
		if (appData && _lodash2['default'].isObject(appData)) {
			_lodash2['default'].extend(this, appData);
		} else if (appData && _lodash2['default'].isString(appData)) {
			this.name = appData;
		}
		if (_firebase2['default'] && _lodash2['default'].has(_config2['default'], 'fbUrl') && _lodash2['default'].has(this, 'name')) {
			this.fbRef = new _firebase2['default'](_config2['default'].fbUrl + this.name);
		}
		// logger.debug({description: 'Application object created.', application: this, func: 'constructor', obj: 'Application'});
	}

	_createClass(Application, [{
		key: 'get',

		//Get applications or single application
		value: function get() {
			logger.debug({
				description: 'Application get called.', func: 'get', obj: 'Application'
			});
			return request.get(this.appEndpoint).then(function (response) {
				logger.info({
					description: 'Application loaded successfully.', response: response,
					application: new Application(response), func: 'get', obj: 'Application'
				});
				return new Application(response);
			})['catch'](function (errRes) {
				logger.error({
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
			logger.debug({
				description: 'Application update called.',
				func: 'update', obj: 'Application'
			});
			return request.put(this.appEndpoint, appData).then(function (response) {
				logger.info({
					description: 'Application updated successfully.',
					response: response, func: 'update', obj: 'Application'
				});
				return new Application(response);
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error updating application.',
					error: errRes, func: 'update', obj: 'Application'
				});
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}
	}, {
		key: 'addStorage',
		value: function addStorage() {
			logger.debug({
				description: 'Application add storage called.', application: this,
				func: 'addStorage', obj: 'Application'
			});
			return request.post(this.appEndpoint + '/storage', {}).then(function (response) {
				logger.info({
					description: 'Storage successfully added to application.',
					response: response, application: new Application(response),
					func: 'addStorage', obj: 'Application'
				});
				return new Application(response);
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error adding storage to application.',
					error: errRes, func: 'addStorage', obj: 'Application'
				});
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}
	}, {
		key: 'applyTemplate',
		value: function applyTemplate() {
			var _this = this;

			logger.error({
				description: 'Applying templates to existing applications is not currently supported.',
				func: 'applyTemplate', obj: 'Application'
			});
			return request.post(this.appEndpoint, {}).then(function (response) {
				logger.info({
					description: 'Template successfully applied to application.',
					response: response, application: _this,
					func: 'applyTemplate', obj: 'Application'
				});
				return new Application(response);
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error applying template to application.',
					error: errRes, application: _this,
					func: 'applyTemplate', obj: 'Application'
				});
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}

		//Files object that contains files methods
	}, {
		key: 'File',
		value: function File(fileData) {
			logger.debug({
				description: 'Applications file action called.',
				fileData: fileData, application: this,
				func: 'file', obj: 'Application'
			});
			return new _File3['default']({ app: this, fileData: fileData });
		}
	}, {
		key: 'User',
		value: function User(userData) {
			logger.debug({
				description: 'Applications user action called.',
				userData: userData, application: this, func: 'user',
				obj: 'Application'
			});
			return new _Account3['default']({ app: this, userData: userData });
		}
	}, {
		key: 'Account',
		value: function Account(userData) {
			logger.debug({
				description: 'Applications account action called.',
				userData: userData, application: this,
				func: 'user', obj: 'Application'
			});
			return new _Account3['default']({ app: this, userData: userData });
		}
	}, {
		key: 'Group',
		value: function Group(groupData) {
			logger.debug({
				description: 'Applications group action called.',
				groupData: groupData, application: this,
				func: 'group', obj: 'Application'
			});
			return new _Group3['default']({ app: this, groupData: groupData });
		}
	}, {
		key: 'Directory',
		value: function Directory(directoryData) {
			logger.debug({
				description: 'Applications directory action called.',
				directoryData: directoryData, application: this,
				func: 'directory', obj: 'Application'
			});
			return new _Directory3['default']({ app: this, directoryData: directoryData });
		}
	}, {
		key: 'appEndpoint',
		get: function get() {
			return _Matter2['default'].endpoint + '/apps/' + this.name;
		}
	}, {
		key: 'Files',
		get: function get() {
			logger.debug({
				description: 'Applications files action called.',
				application: this, func: 'files', obj: 'Application'
			});
			return new _Files2['default']({ app: this });
		}
	}, {
		key: 'Users',
		get: function get() {
			logger.debug({
				description: 'Applications users action called.',
				application: this, func: 'user', obj: 'Application'
			});
			return new _actionsAccountsAction2['default']({ app: this });
		}
	}, {
		key: 'Accounts',
		get: function get() {
			logger.debug({
				description: 'Applications account action called.',
				application: this, func: 'user', obj: 'Application'
			});
			return new _actionsAccountsAction2['default']({ app: this });
		}
	}, {
		key: 'Groups',
		get: function get() {
			logger.debug({
				description: 'Applications groups action called.',
				application: this, func: 'groups', obj: 'Application'
			});
			return new _actionsGroupsAction2['default']({ app: this });
		}
	}, {
		key: 'Directories',
		get: function get() {
			logger.debug({
				description: 'Applications directories action called.',
				application: this, func: 'directories', obj: 'Application'
			});
			return new _actionsDirectoriesAction2['default']({ app: this });
		}
	}]);

	return Application;
})();

exports['default'] = Application;
module.exports = exports['default'];