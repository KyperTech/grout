'use strict';

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _ApiAction2 = require('./ApiAction');

var _ApiAction3 = _interopRequireDefault(_ApiAction2);

var _Group2 = require('./Group');

var _Group3 = _interopRequireDefault(_Group2);

var _Directory = require('./Directory');

var _Directory2 = _interopRequireDefault(_Directory);

var _File = require('./File');

var _File2 = _interopRequireDefault(_File);

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

		if (!name) {
			throw new Error('Name and Owner are required to create a project');
		}
		if ((0, _isObject2.default)(name)) {
			if (!name.owner) throw new Error('Owner is required to create a project');
			if (!name.name) throw new Error('Name is required to create a project');
			owner = name.owner;
			name = name.name;
		}
		if (!owner) {
			throw new Error('Owner is required to create a project');
		}
		var endpoint = 'projects/' + owner + '/' + name;

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
			logger.debug({
				description: 'Project add storage called.', project: this,
				func: 'addStorage', obj: 'Project'
			});
			return request.post(this.url + '/storage', {});
		}

		/**
   * @description Apply a template to Project
   */

	}, {
		key: 'applyTemplate',
		value: function applyTemplate(template) {
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
			return request.post(this.url, { template: template });
		}

		/**
   * @description Add a collaborator to Project
   * @param {String} username - Username of user to add as collaborator
   * @param {Array} rights - Read/Write rights of collaborator
   */

	}, {
		key: 'addCollaborator',
		value: function addCollaborator(username, rights) {
			logger.debug({
				description: 'Add collaborator called', username: username,
				project: this, func: 'addCollaborator', obj: 'Project'
			});
			if (!username || !(0, _isString2.default)(username)) {
				logger.error({
					description: 'Username required to add collaborator',
					func: 'addCollaborator', obj: 'Project'
				});
				return Promise.reject({ message: 'Username required to add collaborator' });
			}
			var endpointUrl = _config2.default.serverUrl + '/projects/' + this.owner + '/' + this.name + '/collaborators/' + username;
			return request.put(endpointUrl, rights || {});
		}

		/**
   * @description Remove a collaborator from a Project
   * @param {String} username - Username of user to add as collaborator
   * @param {Array} rights - Read/Write rights of collaborator
   */

	}, {
		key: 'removeCollaborator',
		value: function removeCollaborator(username, rights) {
			logger.debug({
				description: 'Remove collaborator called', username: username,
				project: this, func: 'removeCollaborator', obj: 'Project'
			});
			if (!username || !(0, _isString2.default)(username)) {
				logger.error({
					description: 'Username required to add collaborator',
					func: 'removeCollaborator', obj: 'Project'
				});
				return Promise.reject({ message: 'Username required to add collaborator' });
			}
			var endpointUrl = _config2.default.serverUrl + '/projects/' + this.owner + '/' + this.name + '/collaborators/' + username;
			return request.del(endpointUrl);
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
			var file = new _File2.default(this, path);
			logger.debug({
				description: 'Projects file action called.',
				path: path, project: this, file: file,
				func: 'File', obj: 'Project'
			});
			return file;
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