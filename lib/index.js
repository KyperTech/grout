'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

var _Project2 = require('./classes/Project');

var _Project3 = _interopRequireDefault(_Project2);

var _Group2 = require('./classes/Group');

var _Group3 = _interopRequireDefault(_Group2);

var _ApiAction = require('./classes/ApiAction');

var _ApiAction2 = _interopRequireDefault(_ApiAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Grout).call(this, name, _config2.default.matterSettings));

    _config2.default.applySettings(options);
    return _this;
  }

  /**
   * @description Projects action
   */


  _createClass(Grout, [{
    key: 'Projects',
    value: function Projects(username) {
      return new _ApiAction2.default('users/' + username + '/projects');
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
      return new _Project3.default(name, owner);
    }

    /**
     * @description Users action
     */

  }, {
    key: 'User',


    /**
     * @description Users action
     * @param {Object|String} accountData - Data of account with which to start action
     * @param {String} accountData.username - Username of account with which to start action
     * @param {String} accountData.email - Email of account with which to start action
     */
    value: function User(username) {
      return new _ApiAction2.default('users/' + username);
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
      return action;
    }
  }, {
    key: 'Users',
    get: function get() {
      return new _ApiAction2.default('users');
    }
  }, {
    key: 'Groups',
    get: function get() {
      var action = new _ApiAction2.default('groups');
      return action;
    }
  }, {
    key: 'Templates',
    get: function get() {
      var action = new _ApiAction2.default('templates');
      return action;
    }
  }]);

  return Grout;
}(_kyperMatter2.default);

exports.default = Grout;
module.exports = exports['default'];