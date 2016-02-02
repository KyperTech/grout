'use strict';

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _ApiAction2 = require('./ApiAction');

var _ApiAction3 = _interopRequireDefault(_ApiAction2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _Matter2.default.utils.logger;

var Group = function (_ApiAction) {
	_inherits(Group, _ApiAction);

	function Group(groupName, project) {
		_classCallCheck(this, Group);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Group).call(this, 'groups/' + groupName, project));
	}
	/**
  * @description Add accounts to a group
  * @param {Array} accounts - List of accounts ids to add to group
  * @return {Promise}
  */

	_createClass(Group, [{
		key: 'addAccounts',
		value: function addAccounts(accountsData) {
			logger.log({
				description: 'Group updated called.', accountsData: accountsData,
				func: 'update', obj: 'Group'
			});
			var accountsArray = accountsData;
			//Handle provided data being a string list
			if ((0, _isString2.default)(accountsData)) {
				accountsArray = accountsData.split(',');
			}
			//Check item in array to see if it is a string (username) instead of _id
			if ((0, _isString2.default)(accountsArray[0])) {
				logger.warn({
					description: 'Accounts array only currently supports account._id not account.username.',
					accountsData: accountsData, func: 'update', obj: 'Group'
				});
				return Promise.reject({
					message: 'Accounts array only currently supports account._id not account.username.'
				});
			}
			logger.log({
				description: 'Updating group with accounts array.',
				accountsArray: accountsArray, func: 'update', obj: 'Group'
			});
			return this.update({ accounts: accountsArray });
		}
	}]);

	return Group;
}(_ApiAction3.default);

exports.default = Group;
module.exports = exports['default'];