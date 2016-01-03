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

var _Application = require('./classes/Application');

var _Application2 = _interopRequireDefault(_Application);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

var _Matter2 = require('./classes/Matter');

var _Matter3 = _interopRequireDefault(_Matter2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**Grout Client Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */

var Grout = (function (_Matter) {
	_inherits(Grout, _Matter);

	//TODO: Use getter/setter to make this not a function

	function Grout(appName, groutOptions) {
		_classCallCheck(this, Grout);

		//Call matter with tessellate
		var name = appName && (0, _lodash.isString)(appName) ? appName : _config2.default.appName;
		var options = groutOptions && (0, _lodash.isObject)(groutOptions) ? groutOptions : _config2.default.matterOptions;
		//handle No App name provided
		if ((0, _lodash.isObject)(appName)) {
			options = appName;
		}
		_config2.default.applySettings(options);
		return _possibleConstructorReturn(this, Object.getPrototypeOf(Grout).call(this, name, _config2.default));
	}
	//Start a new Projects Action

	_createClass(Grout, [{
		key: 'Project',

		//Start a new Project action
		value: function Project(projectName) {
			this.utils.logger.warn({
				description: 'Project action called.',
				projectName: projectName, action: new _Application2.default(projectName),
				func: 'Projects', obj: 'Grout'
			});
			return new _Application2.default(projectName);
		}
		//Start a new Projects Action

	}, {
		key: 'App',

		//Start a new Project action
		value: function App(projectName) {
			this.utils.logger.debug({
				description: 'Project action called.',
				projectName: projectName, action: new _Application2.default(projectName),
				func: 'Projects', obj: 'Grout'
			});
			return new _Application2.default(projectName);
		}
		//Start a new Apps Action

	}, {
		key: 'Template',

		//Start a new App action
		value: function Template(templateData) {
			this.utils.logger.debug({
				description: 'Template Action called.', templateData: templateData,
				template: new Actions.Template({ app: this, callData: templateData }), func: 'Template', obj: 'Grout'
			});
			return new Actions.Template({ app: this, callData: templateData });
		}
		//Start a new Accounts action

	}, {
		key: 'Account',

		//Start a new Account action
		value: function Account(userData) {
			this.utils.logger.debug({
				description: 'Account Action called.',
				userData: userData, user: new Actions.Account({ app: this, callData: userData }),
				func: 'user', obj: 'Grout'
			});
			return new Actions.Account({ app: this, callData: userData });
		}
		//ALIAS OF ACCOUNTS
		//Start a new Accounts action

	}, {
		key: 'User',

		//ALIAS OF ACCOUNT
		//Start a new Account action
		value: function User(userData) {
			this.utils.logger.debug({
				description: 'Account Action called.',
				userData: userData, user: new Actions.Account({ app: this, callData: userData }),
				func: 'user', obj: 'Grout'
			});
			return new Actions.Account({ app: this, callData: userData });
		}
		//Start a new Groups action

	}, {
		key: 'Group',

		//Start a new Group action
		value: function Group(groupData) {
			this.utils.logger.debug({
				description: 'Group Action called.', groupData: groupData,
				action: new Actions.Group({ app: this, callData: groupData }),
				func: 'group', obj: 'Grout'
			});
			return new Actions.Group({ app: this, callData: groupData });
		}
	}, {
		key: 'Projects',
		get: function get() {
			this.utils.logger.debug({
				description: 'Projects Action called.', action: new Actions.Projects({ app: this }),
				func: 'Projects', obj: 'Grout'
			});
			return new Actions.Projects({ app: this });
		}
	}, {
		key: 'Apps',
		get: function get() {
			this.utils.logger.debug({
				description: 'Projects Action called.', action: new Actions.Projects({ app: this }),
				func: 'Projects', obj: 'Grout'
			});
			return new Actions.Projects({ app: this });
		}
	}, {
		key: 'Templates',
		get: function get() {
			this.utils.logger.debug({
				description: 'Templates Action called.',
				func: 'Templates', obj: 'Grout'
			});
			return new Actions.Templates({ app: this });
		}
	}, {
		key: 'Accounts',
		get: function get() {
			this.utils.logger.debug({
				description: 'Account Action called.',
				action: new Actions.Accounts({ app: this }), func: 'users', obj: 'Grout'
			});
			return new Actions.Accounts({ app: this });
		}
	}, {
		key: 'Users',
		get: function get() {
			this.utils.logger.debug({
				description: 'Accounts Action called.',
				action: new Actions.Accounts({ app: this }), func: 'Users', obj: 'Grout'
			});
			return new Actions.Accounts({ app: this });
		}
	}, {
		key: 'Groups',
		get: function get() {
			this.utils.logger.debug({
				description: 'Groups Action called.',
				action: new Actions.Groups({ app: this }), func: 'groups', obj: 'Grout'
			});
			return new Actions.Groups({ app: this });
		}
	}]);

	return Grout;
})(_kyperMatter2.default);

exports.default = Grout;
module.exports = exports['default'];