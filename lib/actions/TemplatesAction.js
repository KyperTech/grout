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

var logger = _classesMatter2['default'].utils.logger;
var request = _classesMatter2['default'].utils.request;

//Actions for templates list

var TemplatesAction = (function () {
	function TemplatesAction() {
		_classCallCheck(this, TemplatesAction);
	}

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
			if (query && _lodash2['default'].isString(query)) {
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
			var endpointArray = [_classesMatter2['default'].endpoint, 'templates'];
			//Check for app groups action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				// endpointArray.splice(1, 0, 'apps', this.app.name);
				logger.log({ description: 'Templates action is not currently supported for a specific application.', func: 'accountsEndpoint', obj: 'AccountsAction' });
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({ description: 'Templates endpoint built.', endpoint: endpointStr, func: 'templatesEndpoint', obj: 'TemplatesAction' });
			return endpointStr;
		}
	}]);

	return TemplatesAction;
})();

exports['default'] = TemplatesAction;
module.exports = exports['default'];