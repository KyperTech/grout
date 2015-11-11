Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

var _actionsAppsAction = require('./actions/AppsAction');

var _actionsAppsAction2 = _interopRequireDefault(_actionsAppsAction);

var _classesApplication = require('./classes/Application');

var _classesApplication2 = _interopRequireDefault(_classesApplication);

var _actionsAccountsAction = require('./actions/AccountsAction');

var _actionsAccountsAction2 = _interopRequireDefault(_actionsAccountsAction);

var _classesAccount = require('./classes/Account');

var _classesAccount2 = _interopRequireDefault(_classesAccount);

var _actionsGroupsAction = require('./actions/GroupsAction');

var _actionsGroupsAction2 = _interopRequireDefault(_actionsGroupsAction);

var _classesGroup = require('./classes/Group');

var _classesGroup2 = _interopRequireDefault(_classesGroup);

var _actionsDirectoriesAction = require('./actions/DirectoriesAction');

var _actionsDirectoriesAction2 = _interopRequireDefault(_actionsDirectoriesAction);

var _classesDirectory = require('./classes/Directory');

var _classesDirectory2 = _interopRequireDefault(_classesDirectory);

var _actionsTemplatesAction = require('./actions/TemplatesAction');

var _actionsTemplatesAction2 = _interopRequireDefault(_actionsTemplatesAction);

var _classesTemplate = require('./classes/Template');

var _classesTemplate2 = _interopRequireDefault(_classesTemplate);

/**Grout Client Class
 * @ description Extending matter provides token storage and login/logout/signup capabilities
 */

var Grout = (function (_Matter) {
	_inherits(Grout, _Matter);

	//TODO: Use getter/setter to make this not a function

	function Grout() {
		_classCallCheck(this, Grout);

		//Call matter with tessellate
		_get(Object.getPrototypeOf(Grout.prototype), 'constructor', this).call(this, _config2['default'].appName, _config2['default'].matterOptions);
	}

	//Start a new Apps Action

	_createClass(Grout, [{
		key: 'App',

		//Start a new App action
		value: function App(appName) {
			this.utils.logger.debug({ description: 'Application action called.', appName: appName, template: new _classesApplication2['default'](appName), func: 'App', obj: 'Grout' });
			return new _classesApplication2['default'](appName);
		}

		//Start a new Apps Action
	}, {
		key: 'Template',

		//Start a new App action
		value: function Template(templateData) {
			this.utils.logger.debug({ description: 'Template Action called.', templateData: templateData, template: new _classesTemplate2['default'](templateData), func: 'Template', obj: 'Grout' });
			return new _classesTemplate2['default'](templateData);
		}

		//Start a new Accounts action
	}, {
		key: 'Account',

		//Start a new Account action
		value: function Account(userData) {
			this.utils.logger.debug({ description: 'Account Action called.', userData: userData, user: new _classesAccount2['default'](userData), func: 'user', obj: 'Grout' });
			return new _classesAccount2['default'](userData);
		}

		//ALIAS OF ACCOUNTS
		//Start a new Accounts action
	}, {
		key: 'User',

		//ALIAS OF ACCOUNT
		//Start a new Account action
		value: function User(userData) {
			this.utils.logger.debug({ description: 'Account Action called.', userData: userData, user: new _classesAccount2['default'](userData), func: 'user', obj: 'Grout' });
			return new _classesAccount2['default'](userData);
		}

		//Start a new Groups action
	}, {
		key: 'Group',

		//Start a new Group action
		value: function Group(groupData) {
			this.utils.logger.debug({
				description: 'Group Action called.', groupData: groupData,
				action: new _classesGroup2['default']({ app: this, groupData: groupData }),
				func: 'group', obj: 'Grout'
			});
			return new _classesGroup2['default'](groupData);
		}

		//Start a new Directories action
	}, {
		key: 'Directory',

		//Start a new Group action
		value: function Directory(directoryData) {
			this.utils.logger.debug({
				description: 'Directory Action called.', directoryData: directoryData,
				action: new _classesDirectory2['default'](directoryData), func: 'directory', obj: 'Grout'
			});
			return new _classesDirectory2['default'](directoryData);
		}
	}, {
		key: 'Apps',
		get: function get() {
			this.utils.logger.debug({
				description: 'Apps Action called.', action: new _actionsAppsAction2['default'](),
				func: 'Apps', obj: 'Grout'
			});
			return new _actionsAppsAction2['default']();
		}
	}, {
		key: 'Templates',
		get: function get() {
			this.utils.logger.debug({ description: 'Templates Action called.', action: new _actionsTemplatesAction2['default'](), func: 'Templates', obj: 'Grout' });
			return new _actionsTemplatesAction2['default']();
		}
	}, {
		key: 'Accounts',
		get: function get() {
			this.utils.logger.debug({ description: 'Account Action called.', action: new _actionsAccountsAction2['default'](), func: 'users', obj: 'Grout' });
			return new _actionsAccountsAction2['default']();
		}
	}, {
		key: 'Users',
		get: function get() {
			this.utils.logger.debug({ description: 'Accounts Action called.', action: new _actionsAccountsAction2['default'](), func: 'Users', obj: 'Grout' });
			return new _actionsAccountsAction2['default']();
		}
	}, {
		key: 'Groups',
		get: function get() {
			this.utils.logger.debug({
				description: 'Groups Action called.', action: new _actionsGroupsAction2['default'](), func: 'groups', obj: 'Grout'
			});
			return new _actionsGroupsAction2['default']();
		}
	}, {
		key: 'Directories',
		get: function get() {
			this.utils.logger.debug({
				description: 'Directories Action called.',
				action: new _actionsDirectoriesAction2['default'](), func: 'directories', obj: 'Grout'
			});
			return new _actionsDirectoriesAction2['default']();
		}
	}]);

	return Grout;
})(_kyperMatter2['default']);

exports['default'] = Grout;
module.exports = exports['default'];