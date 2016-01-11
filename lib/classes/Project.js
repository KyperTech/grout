'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); //Internal libs and config

//Actions and Classes

//External Libs

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _actions = require('../actions');

var _Group2 = require('./Group');

var _Group3 = _interopRequireDefault(_Group2);

var _Files = require('./Files');

var _Files2 = _interopRequireDefault(_Files);

var _File2 = require('./File');

var _File3 = _interopRequireDefault(_File2);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Convenience vars
var _matter$utils = _Matter2.default.utils;
var request = _matter$utils.request;
var logger = _matter$utils.logger;
/**
 * Project class.
 *
 */

var Project = (function () {
	function Project(appData) {
		_classCallCheck(this, Project);

		if (!appData || !(0, _lodash.isObject)(appData) && !(0, _lodash.isString)(appData)) {
			logger.error({
				description: 'Project object created.', project: this,
				func: 'constructor', obj: 'Project'
			});
		}
		if ((0, _lodash.isString)(appData)) {
			this.name = appData;
			logger.log({
				description: 'Project object created without owner.', project: this,
				func: 'constructor', obj: 'Project'
			});
		} else {
			(0, _lodash.extend)(this, appData);
		}
		logger.debug({
			description: 'Project object created.', project: this,
			func: 'constructor', obj: 'Project'
		});
	}
	/**
  * @description Project endpoint on Tessellate server
  * @return {String}
  */

	_createClass(Project, [{
		key: 'get',

		/**
   * @description Get project data
   */
		value: function get() {
			logger.debug({
				description: 'Project get called.', func: 'get', obj: 'Project'
			});
			return request.get(this.endpoint).then(function (response) {
				var project = new Project(response);
				logger.info({
					description: 'Project loaded successfully.',
					response: response, project: project, func: 'get', obj: 'Project'
				});
				return project;
			})['catch'](function (error) {
				logger.error({
					description: 'Error getting Project.',
					message: error.response.text, error: error,
					func: 'get', obj: 'Project'
				});
				return Promise.reject(error.response.text || error.response);
			});
		}
		/**
   * @description Update project data
   */

	}, {
		key: 'update',
		value: function update(updateData) {
			logger.debug({
				description: 'Project update called.',
				func: 'update', obj: 'Project'
			});
			return request.put(this.endpoint, updateData).then(function (response) {
				logger.info({
					description: 'Project updated successfully.',
					response: response, func: 'update', obj: 'Project'
				});
				return new Project(response);
			})['catch'](function (error) {
				logger.error({
					description: 'Error updating project.',
					error: error, func: 'update', obj: 'Project'
				});
				return Promise.reject(error.response.text || error.response);
			});
		}
		/**
   * @description Add static file hosting storage (currrently though AWS S3)
   */

	}, {
		key: 'addStorage',
		value: function addStorage() {
			logger.debug({
				description: 'Project add storage called.', project: this,
				func: 'addStorage', obj: 'Project'
			});
			return request.post(this.endpoint + '/storage', {}).then(function (response) {
				var project = new Project(response);
				logger.info({
					description: 'Storage successfully added to project.',
					response: response, project: project, func: 'addStorage', obj: 'Project'
				});
				return project;
			})['catch'](function (error) {
				logger.error({
					description: 'Error adding storage to project.',
					error: error, func: 'addStorage', obj: 'Project'
				});
				return Promise.reject(error.response.text || error.response);
			});
		}
		/**
   * @description Apply a template to Project
   */

	}, {
		key: 'applyTemplate',
		value: function applyTemplate(template) {
			var _this = this;

			logger.debug({
				description: 'Applying template to project.',
				func: 'applyTemplate', obj: 'Project'
			});
			return request.post(this.endpoint, { template: template }).then(function (response) {
				logger.info({
					description: 'Template successfully applied to project.',
					response: response, project: _this,
					func: 'applyTemplate', obj: 'Project'
				});
				return new Project(response);
			})['catch'](function (error) {
				logger.error({
					description: 'Error applying template to project.',
					error: error, project: _this,
					func: 'applyTemplate', obj: 'Project'
				});
				return Promise.reject(error.response.text || error.response);
			});
		}
		/**
   * @description Add collaborators to Project
   * @param {Array|String} collabs - Array list of Ids, or a string list of ids
   */

	}, {
		key: 'addCollaborators',
		value: function addCollaborators(collabs) {
			logger.debug({
				description: 'Add collaborators called', collabs: collabs,
				project: this, func: 'addCollaborators', obj: 'Project'
			});
			this.collaborators = collabs;
			//Handle string of ids
			if (!(0, _lodash.isArray)(collabs) && (0, _lodash.isString)(collabs)) {
				this.collaborators = collabs.replace(' ').split(',');
			}
			logger.log({
				description: 'Collaborators list added to project, calling update.',
				project: this, func: 'addCollaborators', obj: 'Project'
			});
			return this.update(this);
		}
		//Files object that contains files methods

	}, {
		key: 'File',
		value: function File(data) {
			logger.debug({
				description: 'Projects file action called.',
				data: data, project: this,
				func: 'file', obj: 'Project'
			});
			return new _File3.default({ project: this, data: data });
		}
	}, {
		key: 'User',
		value: function User(data) {
			logger.debug({
				description: 'Projects user action called.',
				data: data, project: this, func: 'user', obj: 'Project'
			});
			return new _actions.Account({ project: this, data: data });
		}
	}, {
		key: 'Account',
		value: function Account(data) {
			logger.debug({
				description: 'Projects account action called.',
				data: data, project: this,
				func: 'user', obj: 'Project'
			});
			return new _actions.Account({ project: this, data: data });
		}
	}, {
		key: 'Group',
		value: function Group(data) {
			logger.debug({
				description: 'Projects group action called.',
				data: data, project: this,
				func: 'group', obj: 'Project'
			});
			return new _Group3.default({ project: this, data: data });
		}
	}, {
		key: 'endpoint',
		get: function get() {
			if (this.name === 'tessellate') {
				logger.debug({
					description: 'Project is tessellate. Using matter endpoint.',
					project: this, func: 'endpoint', obj: 'Project'
				});
				return _Matter2.default.endpoint;
			}
			var projectEndpoint = _Matter2.default.endpoint + '/apps/' + this.name;
			logger.debug({
				description: 'Project endpoint created.',
				projectEndpoint: projectEndpoint, func: 'endpoint', obj: 'Project'
			});
			return projectEndpoint;
		}
		/**
   * @description Project files Firebase Url
   * @return {String}
   */

	}, {
		key: 'fbUrl',
		get: function get() {
			if ((0, _lodash.has)(_config2.default, 'fbUrl') && (0, _lodash.has)(this, 'name')) {
				if ((0, _lodash.has)(this, 'owner')) {
					return _config2.default.fbUrl + '/files/' + this.owner + '/' + this.name;
				}
				return _config2.default.fbUrl + '/' + this.name;
			}
		}
		/**
   * @description Generate Firebase reference based on project url
   */

	}, {
		key: 'fbRef',
		get: function get() {
			if (this.fbUrl) {
				return new _firebase2.default(this.fbUrl);
			}
		}
	}, {
		key: 'Files',
		get: function get() {
			logger.debug({
				description: 'Projects files action called.',
				project: this, func: 'files', obj: 'Project'
			});
			return new _Files2.default({ project: this });
		}
	}, {
		key: 'Users',
		get: function get() {
			logger.debug({
				description: 'Projects users action called.',
				project: this, func: 'user', obj: 'Project'
			});
			return new _actions.Accounts({ project: this });
		}
	}, {
		key: 'Accounts',
		get: function get() {
			logger.debug({
				description: 'Projects account action called.',
				project: this, func: 'user', obj: 'Project'
			});
			return new _actions.Accounts({ project: this });
		}
	}, {
		key: 'Groups',
		get: function get() {
			logger.debug({
				description: 'Projects groups action called.',
				project: this, func: 'groups', obj: 'Project'
			});
			return new _actions.Groups({ project: this });
		}
	}]);

	return Project;
})();

exports.default = Project;
module.exports = exports['default'];