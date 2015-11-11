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

//Actions for directories list

var DirectoriesAction = (function () {
	function DirectoriesAction(actionData) {
		_classCallCheck(this, DirectoriesAction);

		//Check to see if action is for a specific app
		if (actionData && _lodash2['default'].isObject(actionData) && _lodash2['default'].has(actionData, 'app')) {
			this.app = actionData.app;
			logger.log({ description: 'Provided app data set to app parameter.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
		} else if (actionData && _lodash2['default'].isString(actionData)) {
			this.app = { name: actionData };
			logger.log({ description: 'App name provided as string was set.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
		}
		logger.info({ description: 'New directories action.', action: this, providedData: actionData, func: 'constructor', obj: 'DirectoriesAction' });
	}

	_createClass(DirectoriesAction, [{
		key: 'get',

		//Get users or single application
		value: function get() {
			logger.debug({ description: 'Directories get called.', action: this, func: 'get', obj: 'DirectoriesAction' });
			return request.get(this.directoriesEndpoint).then(function (response) {
				logger.info({ descrption: 'Directories loaded successfully.', response: response, func: 'get', obj: 'DirectoriesAction' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ descrption: 'error getting users', error: errRes, func: 'get', obj: 'DirectoriesAction' });
				return Promise.reject(errRes);
			});
		}

		//Add an application
	}, {
		key: 'add',
		value: function add(appData) {
			logger.debug({ description: 'Add directory called.', action: this, appData: appData, func: 'get', obj: 'DirectoriesAction' });
			return request.post(this.directoriesEndpoint, appData).then(function (response) {
				logger.log({ description: 'Application added successfully.', response: response, func: 'add', obj: 'DirectoriesAction' });
				//TODO: Return list of group objects
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error adding group.', error: errRes, func: 'add', obj: 'DirectoriesAction' });
				return Promise.reject(errRes);
			});
		}

		//Search with partial of directory name
	}, {
		key: 'search',
		value: function search(query) {
			var searchEndpoint = this.directoriesEndpoint + '/search/';
			if (query && _lodash2['default'].isString(query)) {
				searchEndpoint += query;
			}
			if (!query || query == '') {
				logger.debug({ description: 'Null query, returning empty array.', func: 'search', obj: 'DirectoriesAction' });
				return Promise.resolve([]);
			}
			return request.get(searchEndpoint).then(function (response) {
				logger.log({ description: 'Found directories based on search.', response: response, func: 'search', obj: 'DirectoriesAction' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error searching directories.', error: errRes, func: 'search', obj: 'DirectoriesAction' });
				return Promise.reject(errRes);
			});
		}
	}, {
		key: 'directoriesEndpoint',
		get: function get() {
			var endpointArray = [_classesMatter2['default'].endpoint, 'directories'];
			//Check for app groups action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({ description: 'Directories endpoint built.', endpoint: endpointStr, func: 'directoriesEndpoint', obj: 'DirectoriesAction' });
			return endpointStr;
		}
	}]);

	return DirectoriesAction;
})();

exports['default'] = DirectoriesAction;
module.exports = exports['default'];