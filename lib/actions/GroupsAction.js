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

var request = _classesMatter2['default'].utils.request;
var logger = _classesMatter2['default'].utils.logger;

//Actions for users list

var GroupsAction = (function () {
	function GroupsAction(actionData) {
		_classCallCheck(this, GroupsAction);

		//Check to see if action is for a specific app
		if (actionData && _lodash2['default'].isObject(actionData) && _lodash2['default'].has(actionData, 'app')) {
			this.app = actionData.app;
			logger.log({
				description: 'Provided app data set to app parameter.',
				action: this, providedData: actionData,
				func: 'constructor', obj: 'GroupsAction'
			});
		} else if (actionData && _lodash2['default'].isString(actionData)) {
			this.app = { name: actionData };
			logger.log({
				description: 'App name provided as string was set.',
				action: this, providedData: actionData,
				func: 'constructor', obj: 'GroupsAction'
			});
		}
		logger.info({
			description: 'New Groups action.', action: this,
			providedData: actionData, func: 'constructor', obj: 'GroupsAction'
		});
	}

	_createClass(GroupsAction, [{
		key: 'get',

		//Get users or single application
		value: function get() {
			logger.log({
				description: 'Get group called.',
				func: 'get', obj: 'GroupsAction'
			});
			return request.get(this.groupsEndpoint).then(function (response) {
				logger.info({
					description: 'Groups loaded successfully.',
					response: response, func: 'get', obj: 'GroupsAction'
				});
				return response;
			})['catch'](function (errRes) {
				logger.info({
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
			logger.debug({
				description: 'Add group called.', groupData: groupData,
				func: 'add', obj: 'GroupsAction'
			});
			if (_lodash2['default'].isString(groupData)) {
				//Group data is string
				newGroupData = { name: groupData };
			}
			logger.debug({
				description: 'Add group called.', newGroupData: newGroupData,
				func: 'add', obj: 'GroupsAction'
			});
			return request.post(this.groupsEndpoint, newGroupData).then(function (response) {
				logger.log({
					description: 'Group added to application successfully.',
					response: response, func: 'add', obj: 'GroupsAction'
				});
				//TODO: Return list of group objects
				return response;
			})['catch'](function (errRes) {
				logger.error({
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
			logger.debug({
				description: 'Search groups called.', query: query,
				func: 'search', obj: 'GroupsAction'
			});
			if (!query || query == '' || !_lodash2['default'].isString(query)) {
				logger.log({
					description: 'Null or invalid query, returning empty array.',
					func: 'search', obj: 'GroupsAction'
				});
				return Promise.resolve([]);
			}
			var searchEndpoint = this.groupsEndpoint + '/search/' + query;
			logger.debug({
				description: 'Search endpoint created.',
				endpoint: searchEndpoint, func: 'search', obj: 'GroupsAction'
			});
			return request.get(searchEndpoint).then(function (response) {
				logger.log({
					description: 'Found groups based on search.',
					response: response, func: 'search', obj: 'GroupsAction'
				});
				return response;
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error searching groups.',
					error: errRes, func: 'search', obj: 'GroupsAction'
				});
				return Promise.reject(errRes);
			});
		}
	}, {
		key: 'groupsEndpoint',
		get: function get() {
			var endpointArray = [_classesMatter2['default'].endpoint, 'groups'];
			//Check for app groups action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({
				description: 'Groups Endpoint built.', endpoint: endpointStr,
				func: 'groupsEndpoint', obj: 'GroupsAction'
			});
			return endpointStr;
		}
	}]);

	return GroupsAction;
})();

exports['default'] = GroupsAction;
module.exports = exports['default'];