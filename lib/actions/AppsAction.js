Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _classesMatter = require('../classes/Matter');

var _classesMatter2 = _interopRequireDefault(_classesMatter);

var request = _classesMatter2['default'].utils.request;
var logger = _classesMatter2['default'].utils.logger;

//Actions for applications list

var AppsAction = (function () {
	function AppsAction() {
		_classCallCheck(this, AppsAction);
	}

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
			return _classesMatter2['default'].utils.request.post(this.appsEndpoint, appData).then(function (response) {
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
			return _classesMatter2['default'].endpoint + '/apps';
		}
	}]);

	return AppsAction;
})();

exports['default'] = AppsAction;
module.exports = exports['default'];