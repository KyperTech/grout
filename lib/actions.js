Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _classesAction = require('./classes/Action');

var _classesAction2 = _interopRequireDefault(_classesAction);

var _classesGroup = require('./classes/Group');

var _classesGroup2 = _interopRequireDefault(_classesGroup);

exports.Group = _classesGroup2['default'];

var Accounts = (function (_Action) {
  _inherits(Accounts, _Action);

  function Accounts(actionData) {
    _classCallCheck(this, Accounts);

    _get(Object.getPrototypeOf(Accounts.prototype), 'constructor', this).call(this, 'accounts', actionData);
  }

  return Accounts;
})(_classesAction2['default']);

exports.Accounts = Accounts;

var Account = (function (_Action2) {
  _inherits(Account, _Action2);

  function Account(actionData) {
    _classCallCheck(this, Account);

    _get(Object.getPrototypeOf(Account.prototype), 'constructor', this).call(this, 'account', actionData);
  }

  return Account;
})(_classesAction2['default']);

exports.Account = Account;

var Projects = (function (_Action3) {
  _inherits(Projects, _Action3);

  function Projects(actionData) {
    _classCallCheck(this, Projects);

    _get(Object.getPrototypeOf(Projects.prototype), 'constructor', this).call(this, 'apps', actionData);
  }

  return Projects;
})(_classesAction2['default']);

exports.Projects = Projects;

var Project = (function (_Action4) {
  _inherits(Project, _Action4);

  function Project(actionData) {
    _classCallCheck(this, Project);

    _get(Object.getPrototypeOf(Project.prototype), 'constructor', this).call(this, 'app', actionData);
  }

  return Project;
})(_classesAction2['default']);

exports.Project = Project;

var Groups = (function (_Action5) {
  _inherits(Groups, _Action5);

  function Groups(actionData) {
    _classCallCheck(this, Groups);

    _get(Object.getPrototypeOf(Groups.prototype), 'constructor', this).call(this, 'groups', actionData);
  }

  return Groups;
})(_classesAction2['default']);

exports.Groups = Groups;

var Templates = (function (_Action6) {
  _inherits(Templates, _Action6);

  function Templates(actionData) {
    _classCallCheck(this, Templates);

    _get(Object.getPrototypeOf(Templates.prototype), 'constructor', this).call(this, 'templates', actionData);
  }

  return Templates;
})(_classesAction2['default']);

exports.Templates = Templates;

var Template = (function (_Action7) {
  _inherits(Template, _Action7);

  function Template(actionData) {
    _classCallCheck(this, Template);

    _get(Object.getPrototypeOf(Template.prototype), 'constructor', this).call(this, 'template', actionData);
  }

  return Template;
})(_classesAction2['default']);

exports.Template = Template;