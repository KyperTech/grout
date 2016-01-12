'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

var _Project2 = require('./classes/Project');

var _Project3 = _interopRequireDefault(_Project2);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

var _Matter2 = require('./classes/Matter');

var _Matter3 = _interopRequireDefault(_Matter2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _Matter3.default.utils.logger;

/** Grout Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */

var Grout = (function (_Matter) {
	_inherits(Grout, _Matter);

	function Grout(projectName, groutOptions) {
		_classCallCheck(this, Grout);

		var name = projectName && (0, _lodash.isString)(projectName) ? projectName : _config2.default.defaultProject;
		var options = groutOptions && (0, _lodash.isObject)(groutOptions) ? groutOptions : _config2.default.matterSettings;
		if ((0, _lodash.isObject)(projectName)) {
			options = projectName;
		}
		_config2.default.applySettings(options);
		return _possibleConstructorReturn(this, Object.getPrototypeOf(Grout).call(this, name, _config2.default.matterSettings));
	}
	/**
  * @description Projects action
  */

	_createClass(Grout, [{
		key: 'Project',

		/**
   * @description Projects action
   * @param {Object} projectData - Data of project with which to start action
   * @param {String} projectData.owner - Project Owner's username (in url)
   * @param {String} projectData.name - Name of project with which to start action
   */
		value: function Project(projectData) {
			var project = new _Project3.default(projectData);
			logger.debug({
				description: 'Project action called.', projectData: projectData,
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
		value: function Account(accountData) {
			var action = new Actions.Account({ project: this, callData: accountData });
			logger.debug({
				description: 'Account Action called.', accountData: accountData,
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
   * @param {Object|String} groupData - Name of group or object containing name parameter
   */
		value: function Group(groupData) {
			var action = new Actions.Group({ project: this, callData: groupData });
			logger.debug({
				description: 'Group Action called.', groupData: groupData,
				action: action, func: 'group', obj: 'Grout'
			});
			return new Actions.Group({ project: this, callData: groupData });
		}
		/**
   * @description Start a new Templates Action
   */

	}, {
		key: 'Template',

		/**
   * @description Start a new Template action
   * @param {Object|String} templateData - Name of template or object containing name parameter
   */
		value: function Template(templateData) {
			var action = new Actions.Template({ project: this, callData: templateData });
			logger.debug({
				description: 'Template Action called.', templateData: templateData,
				action: action, func: 'Template', obj: 'Grout'
			});
			return action;
		}
		//Alias of Projects

	}, {
		key: 'App',

		//Alias of Project
		value: function App(projectData) {
			return this.Project(projectData);
		}
		//Alias of Accounts

	}, {
		key: 'User',

		//Alias of Account
		value: function User(accountData) {
			return this.Account(accountData);
		}
	}, {
		key: 'Projects',
		get: function get() {
			var action = new Actions.Projects({ project: this });
			logger.debug({
				description: 'Projects Action called.',
				action: action, func: 'Projects', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Accounts',
		get: function get() {
			var action = new Actions.Accounts({ project: this });
			logger.debug({
				description: 'Account Action called.',
				action: action, func: 'Accounts', obj: 'Grout'
			});
			return new Actions.Accounts({ project: this });
		}
	}, {
		key: 'Groups',
		get: function get() {
			var action = new Actions.Groups({ project: this });
			logger.debug({
				description: 'Groups Action called.',
				action: action, func: 'groups', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Templates',
		get: function get() {
			var action = new Actions.Templates({ project: this });
			logger.debug({
				description: 'Templates Action called.', action: action,
				func: 'Templates', obj: 'Grout'
			});
			return action;
		}
	}, {
		key: 'Apps',
		get: function get() {
			return this.Projects;
		}
	}, {
		key: 'Users',
		get: function get() {
			return this.Accounts;
		}
	}]);

	return Grout;
})(_kyperMatter2.default);

exports.default = Grout;
module.exports = exports['default'];