'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Template = exports.Templates = exports.Groups = exports.Projects = exports.Account = exports.Accounts = exports.Group = undefined;

var _Action7 = require('./classes/Action');

var _Action8 = _interopRequireDefault(_Action7);

var _Group2 = require('./classes/Group');

var _Group3 = _interopRequireDefault(_Group2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.Group = _Group3.default;

var Accounts = exports.Accounts = (function (_Action) {
  _inherits(Accounts, _Action);

  function Accounts(actionData) {
    _classCallCheck(this, Accounts);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Accounts).call(this, 'accounts', actionData));
  }

  return Accounts;
})(_Action8.default);

var Account = exports.Account = (function (_Action2) {
  _inherits(Account, _Action2);

  function Account(actionData) {
    _classCallCheck(this, Account);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Account).call(this, 'account', actionData));
  }

  return Account;
})(_Action8.default);

var Projects = exports.Projects = (function (_Action3) {
  _inherits(Projects, _Action3);

  function Projects(actionData) {
    _classCallCheck(this, Projects);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Projects).call(this, 'apps', actionData));
  }

  return Projects;
})(_Action8.default);

var Groups = exports.Groups = (function (_Action4) {
  _inherits(Groups, _Action4);

  function Groups(actionData) {
    _classCallCheck(this, Groups);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Groups).call(this, 'groups', actionData));
  }

  return Groups;
})(_Action8.default);

var Templates = exports.Templates = (function (_Action5) {
  _inherits(Templates, _Action5);

  function Templates(actionData) {
    _classCallCheck(this, Templates);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Templates).call(this, 'templates', actionData));
  }

  return Templates;
})(_Action8.default);

var Template = exports.Template = (function (_Action6) {
  _inherits(Template, _Action6);

  function Template(actionData) {
    _classCallCheck(this, Template);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Template).call(this, 'template', actionData));
  }

  return Template;
})(_Action8.default);