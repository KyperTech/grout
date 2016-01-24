'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

var _Project2 = require('./classes/Project');

var _Project3 = _interopRequireDefault(_Project2);

var _Group2 = require('./classes/Group');

var _Group3 = _interopRequireDefault(_Group2);

var _Matter2 = require('./classes/Matter');

var _Matter3 = _interopRequireDefault(_Matter2);

var _ApiAction = require('./classes/ApiAction');

var _ApiAction2 = _interopRequireDefault(_ApiAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _Matter3.default.utils.logger;

/** Grout Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */

var Grout = function (_Matter) {
	_inherits(Grout, _Matter);

	function Grout(projectName, groutOptions) {
		_classCallCheck(this, Grout);

		var name = projectName && (0, _isString2.default)(projectName) ? projectName : _config2.default.defaultProject;
		var options = groutOptions && (0, _isObject2.default)(groutOptions) ? groutOptions : _config2.default.matterSettings;
		if ((0, _isObject2.default)(projectName)) {
			options = projectName;
		}
		_config2.default.applySettings(options);
		return _possibleConstructorReturn(this, Object.getPrototypeOf(Grout).call(this, name, _config2.default.matterSettings));
	}

	/**
  * @description Projects action
  */

	_createClass(Grout, [{
		key: 'Projects',
		value: function Projects(username) {
			var action = new _ApiAction2.default('users/' + username + '/projects');
			logger.debug({
				description: 'Projects ApiAction called.',
				action: action, func: 'Projects', obj: 'Grout'
			});
			return action;
		}

		/**
   * @description Project action
   * @param {Object} projectData - Data of project with which to start action
   * @param {String} projectData.owner - Project Owner's username (in url)
   * @param {String} projectData.name - Name of project with which to start action
   */

	}, {
		key: 'Project',
		value: function Project(name, owner) {
			var project = new _Project3.default(name, owner);
			logger.debug({
				description: 'Project action called.', owner: owner, name: name,
				project: project, func: 'Project', obj: 'Grout'
			});
			return project;
		}

		/**
   * @description Accounts action
   */

	}, {
		key: 'Account',

		/**
   * @description Accounts action
   * @param {Object|String} accountData - Data of account with which to start action
   * @param {String} accountData.username - Username of account with which to start action
   * @param {String} accountData.email - Email of account with which to start action
   */
		value: function Account(username) {
			var action = new _ApiAction2.default('accounts/' + username);
			logger.debug({
				description: 'Account ApiAction called.', username: username,
				action: action, func: 'Account', obj: 'Grout'
			});
			return action;
		}

		/**
   * @description Groups action
   */

	}, {
		key: 'Group',

		/**
   * @description Start a new Group action
   * @param {String} groupName - Name of group
   */
		value: function Group(groupName) {
			var action = new _Group3.default(groupName);
			logger.debug({
				description: 'Group ApiAction called.', groupName: groupName,
				action: action, func: 'group', obj: 'Grout'
			});
			return action;
		}

		/**
   * @description Start a new Templates ApiAction
   */

	}, {
		key: 'Template',

		/**
   * @description Start a new Template action
   * @param {String} templateName - Name of template
   */
		value: function Template(templateName) {
			var action = new _ApiAction2.default('templates/' + templateName);
			logger.debug({
				description: 'Template ApiAction called.', templateName: templateName,
				action: action, func: 'Template', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Accounts',
		get: function get() {
			var action = new _ApiAction2.default('accounts');
			logger.debug({
				description: 'Account ApiAction called.',
				action: action, func: 'Accounts', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Groups',
		get: function get() {
			var action = new _ApiAction2.default('groups');
			logger.debug({
				description: 'Groups ApiAction called.',
				action: action, func: 'groups', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Templates',
		get: function get() {
			var action = new _ApiAction2.default('templates');
			logger.debug({
				description: 'Templates ApiAction called.', action: action,
				func: 'Templates', obj: 'Grout'
			});
			return action;
		}
	}]);

	return Grout;
}(_kyperMatter2.default);

exports.default = Grout;
module.exports = exports['default'];