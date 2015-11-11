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

var Template = (function () {
	function Template(templateData) {
		_classCallCheck(this, Template);

		//Call matter with name and settings
		if (templateData && _lodash2['default'].isString(templateData)) {
			this.name = templateData;
		} else {
			logger.error({
				description: 'Template data is required to start a Template action.',
				func: 'constructor', obj: 'Template'
			});
			throw new Error('Template data is required to start a Template action.');
		}
	}

	_createClass(Template, [{
		key: 'get',

		//Get userlications or single userlication
		value: function get() {
			logger.log({ description: 'Get template called.', name: this.name, func: 'get', obj: 'Template' });
			return request.get(this.templateEndpoint).then(function (response) {
				logger.log({ description: 'Get template responded.', response: response, func: 'get', obj: 'Template' });
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error getting template.', error: errRes, func: 'get', obj: 'Template' });
				return Promise.reject(errRes);
			});
		}

		//Update an userlication
	}, {
		key: 'update',
		value: function update(templateData) {
			logger.log({ description: 'Update template called.', templateData: templateData, func: 'update', obj: 'Template' });
			return request.put(this.templateEndpoint, templateData).then(function (response) {
				logger.log({ description: 'Update template responded.', response: response, templateData: templateData, func: 'update', obj: 'Template' });
				//TODO: Return template object
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error updating template.', error: errRes, func: 'update', obj: 'Template' });
				return Promise.reject(errRes);
			});
		}

		//Delete a template
	}, {
		key: 'del',
		value: function del(templateData) {
			logger.log({ description: 'Delete template called.', templateData: templateData, func: 'del', obj: 'Template' });
			return request['delete'](this.endpoint, templateData).then(function (response) {
				logger.log({ description: 'Template deleted successfully.', response: response, func: 'del', obj: 'Template' });
				//TODO: Return template object
				return response;
			})['catch'](function (errRes) {
				logger.error({ description: 'Error deleting template.', error: errRes, func: 'del', obj: 'Template' });
				return Promise.reject(errRes);
			});
		}
	}, {
		key: 'templateEndpoint',
		get: function get() {
			return _Matter2['default'].endpoint + '/templates/' + this.name;
		}
	}]);

	return Template;
})();

exports['default'] = Template;
module.exports = exports['default'];