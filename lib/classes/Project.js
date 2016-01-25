'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _ApiAction2 = require('./ApiAction');

var _ApiAction3 = _interopRequireDefault(_ApiAction2);

var _Group2 = require('./Group');

var _Group3 = _interopRequireDefault(_Group2);

var _Directory = require('./Directory');

var _Directory2 = _interopRequireDefault(_Directory);

var _File2 = require('./File');

var _File3 = _interopRequireDefault(_File2);

var _firebase = require('../utils/firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _matter$utils = _Matter2.default.utils;
var request = _matter$utils.request;
var logger = _matter$utils.logger;

var Project = function (_ApiAction) {
	_inherits(Project, _ApiAction);

	function Project(name, owner) {
		_classCallCheck(this, Project);

		if (!owner) {
			throw new Error('Owner is required to create a project');
		}
		if (!name) {
			throw new Error('Name is required to create a project');
		}
		var endpoint = owner ? owner + '/projects/' + name : 'projects/' + name;

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Project).call(this, endpoint, { owner: owner, name: name }));

		_this.owner = owner;
		_this.name = name;
		logger.debug({
			description: 'Project object created.', project: _this,
			func: 'constructor', obj: 'Project'
		});
		return _this;
	}
	/**
  * @description Generate Firebase reference based on project url
  */

	_createClass(Project, [{
		key: 'apiAction',

		/**
   * @description Start an Api action using project
   */
		value: function apiAction(actionEndpoint) {
			return new _ApiAction3.default(actionEndpoint, this);
		}

		/**
   * @description Add static file hosting storage to Project (currrently though AWS S3)
   */

	}, {
		key: 'addStorage',
		value: function addStorage() {
			var _this2 = this;

			logger.debug({
				description: 'Project add storage called.', project: this,
				func: 'addStorage', obj: 'Project'
			});
			return request.post(this.url + '/storage', {}).then(function (response) {
				logger.info({
					description: 'Storage successfully added to project.',
					response: response, func: 'addStorage', obj: 'Project'
				});
				_this2.frontend = response.frontend ? response.frontend : {};
				return _this2;
			})['catch'](function (error) {
				logger.error({
					description: 'Error adding storage to project.',
					error: error, func: 'addStorage', obj: 'Project'
				});
				return Promise.reject(error.response ? error.response.text : error);
			});
		}

		/**
   * @description Apply a template to Project
   */

	}, {
		key: 'applyTemplate',
		value: function applyTemplate(template) {
			var _this3 = this;

			logger.debug({
				description: 'Applying template to project.',
				func: 'applyTemplate', obj: 'Project'
			});
			if (!template) {
				logger.error({
					description: 'Template name is required to apply a template.',
					func: 'applyTemplate', obj: 'Project'
				});
				return Promise.reject('Template name is required to apply a template');
			}
			return request.post(this.url, { template: template }).then(function (response) {
				logger.info({
					description: 'Template successfully applied to project.',
					response: response, project: _this3,
					func: 'applyTemplate', obj: 'Project'
				});
				return _this3;
			})['catch'](function (error) {
				logger.error({
					description: 'Error applying template to project.', project: _this3,
					error: error, func: 'applyTemplate', obj: 'Project'
				});
				return Promise.reject(error.response ? error.response.text : error);
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
			//Handle string of ids
			if ((0, _isObject2.default)(collabs)) {
				collabs = [collabs];
			}
			this.collaborators = collabs;
			logger.log({
				description: 'Collaborators list added to project, calling update.',
				project: this, func: 'addCollaborators', obj: 'Project'
			});
			return this.update();
		}

		/**
   * @description Project's Directory
   */

	}, {
		key: 'File',

		/**
   * @description File within project
   */
		value: function File(path) {
			logger.debug({
				description: 'Projects file action called.',
				path: path, project: this,
				func: 'file', obj: 'Project'
			});
			return new _File3.default(this, path);
		}

		/**
   * @description Project's Accounts
   */

	}, {
		key: 'Account',

		/**
   * @description Account with project
   */
		value: function Account(username) {
			logger.debug({
				description: 'Projects account action called.',
				username: username, project: this, func: 'user', obj: 'Project'
			});
			return this.apiAction('accounts/' + username);
		}

		/**
   * @description Project's Groups
   */

	}, {
		key: 'Group',

		/**
   * @description Group within Project
   */
		value: function Group(groupName) {
			logger.debug({
				description: 'Projects group action called.',
				groupName: groupName, project: this, func: 'group', obj: 'Project'
			});
			return new _Group3.default(groupName, this);
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			return this.owner ? _firebase2.default.url(this.owner + '/' + this.name) : _firebase2.default.url('' + this.name);
		}

		/**
   * @description Generate Firebase reference based on project url
   */

	}, {
		key: 'fbRef',
		get: function get() {
			return this.owner ? _firebase2.default.ref(this.owner + '/' + this.name) : _firebase2.default.ref('' + this.name);
		}
	}, {
		key: 'Directory',
		get: function get() {
			logger.debug({
				description: 'Project files action called.',
				project: this, func: 'files', obj: 'Project'
			});
			return new _Directory2.default(this);
		}
	}, {
		key: 'Accounts',
		get: function get() {
			logger.debug({
				description: 'Projects account action called.',
				project: this, func: 'user', obj: 'Project'
			});
			return this.apiAction('accounts');
		}
	}, {
		key: 'Groups',
		get: function get() {
			logger.debug({
				description: 'Projects groups action called.',
				project: this, func: 'groups', obj: 'Project'
			});
			return this.apiAction('groups');
		}
	}]);

	return Project;
}(_ApiAction3.default);

exports.default = Project;
module.exports = exports['default'];