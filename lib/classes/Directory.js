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

//Actions for specific directory

var Directory = (function () {
	function Directory(actionData) {
		_classCallCheck(this, Directory);

		if (actionData && _lodash2['default'].isObject(actionData) && (_lodash2['default'].has(actionData, 'directoryName') || _lodash2['default'].has(actionData, 'name'))) {
			//Data is object containing directory data
			this.name = actionData.directoryName || actionData.name;
			if (_lodash2['default'].has(actionData, 'appName')) {
				this.appName = actionData.appName;
			}
		} else if (actionData && _lodash2['default'].isString(actionData)) {
			//Data is string name
			this.name = actionData;
		} else {
			logger.error({
				description: 'Action data object with name is required to start a Directory Action.',
				func: 'constructor', obj: 'Directory'
			});
			throw new Error('Directory Data object with name is required to start a Directory action.');
		}
	}

	_createClass(Directory, [{
		key: 'get',

		//Get userlications or single userlication
		value: function get() {
			return request.get(this.directoryEndpoint).then(function (response) {
				logger.info({
					description: 'Directory data loaded successfully.',
					response: response, func: 'get', obj: 'Directory'
				});
				return response;
			})['catch'](function (errRes) {
				logger.info({
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
			logger.debug({
				description: 'Directory updated called.',
				directoryData: directoryData, func: 'update', obj: 'Directory'
			});
			return _Matter2['default'].utils.request.put(this.directoryEndpoint, directoryData).then(function (response) {
				logger.info({
					description: 'Directory updated successfully.',
					directoryData: directoryData, response: response,
					func: 'update', obj: 'Directory'
				});
				return response;
			})['catch'](function (errRes) {
				logger.error({
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
			logger.debug({
				description: 'Delete directory called.',
				directoryData: directoryData, func: 'del', obj: 'Directory'
			});
			return request['delete'](this.directoryEndpoint, directoryData).then(function (response) {
				logger.info({
					description: 'Directory deleted successfully.',
					directoryData: directoryData, func: 'del', obj: 'Directory'
				});
				return response;
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error deleting directory.',
					error: errRes, func: 'del', obj: 'Directory'
				});
				return Promise.reject(errRes);
			});
		}
	}, {
		key: 'directoryEndpoint',
		get: function get() {
			var endpointArray = [_Matter2['default'].endpoint, 'directories', this.name];
			//Check for app account action
			if (_lodash2['default'].has(this, 'app') && _lodash2['default'].has(this.app, 'name')) {
				endpointArray.splice(1, 0, 'apps', this.app.name);
			}
			//Create string from endpointArray
			var endpointStr = endpointArray.join('/');
			logger.log({
				description: 'Directory endpoint built.',
				endpoint: endpointStr, func: 'directoryEndpoint',
				obj: 'Directory'
			});
			return endpointStr;
		}
	}]);

	return Directory;
})();

exports['default'] = Directory;
module.exports = exports['default'];