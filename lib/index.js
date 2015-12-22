Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

/**Grout Client Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */

var Grout = (function (_Matter) {
	_inherits(Grout, _Matter);

	//TODO: Use getter/setter to make this not a function

	function Grout(appName, groutOptions) {
		_classCallCheck(this, Grout);

		//Call matter with tessellate
		var name = appName && (0, _lodash.isString)(appName) ? appName : _config2['default'].appName;
		var options = groutOptions && (0, _lodash.isObject)(groutOptions) ? groutOptions : _config2['default'].matterOptions;
		_get(Object.getPrototypeOf(Grout.prototype), 'constructor', this).call(this, name, options);
	}

	//Start a new Projects Action

	_createClass(Grout, [{
		key: 'Project',

		//Start a new Project action
		value: function Project(projectName) {
			this.utils.logger.debug({
				description: 'Project action called.',
				projectName: projectName, func: 'Projects', obj: 'Grout'
			});
			return new Actions.Project({ app: this, callData: projectName });
		}

		//Start a new Projects Action
	}, {
		key: 'App',

		//Start a new Project action
		value: function App(projectName) {
			this.utils.logger.debug({
				description: 'Project action called.',
				projectName: projectName, func: 'Projects', obj: 'Grout'
			});
			return new Actions.Project({ app: this, callData: projectName });
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
				action: new Actions.Group({ app: this, groupData: groupData }),
				func: 'group', obj: 'Grout'
			});
			return new Actions.Group({ app: this, groupData: groupData });
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
})(_kyperMatter2['default']);

exports['default'] = Grout;
module.exports = exports['default'];