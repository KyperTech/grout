Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _Action2 = require('./Action');

var _Action3 = _interopRequireDefault(_Action2);

var logger = _Matter2['default'].utils.logger;

var Group = (function (_Action) {
	_inherits(Group, _Action);

	function Group(actionData) {
		_classCallCheck(this, Group);

		_get(Object.getPrototypeOf(Group.prototype), 'constructor', this).call(this, 'group', actionData);
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
			if ((0, _lodash.isString)(accountsData)) {
				accountsArray = accountsData.split(',');
			}
			//Check item in array to see if it is a string (username) instead of _id
			if ((0, _lodash.isString)(accountsArray[0])) {
				logger.error({
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
			return this.update({ accounts: accountsArray }).then(function (response) {
				logger.info({
					description: 'Account(s) added to group successfully.',
					response: response, func: 'addAccounts', obj: 'Group'
				});
				return response;
			})['catch'](function (errRes) {
				logger.error({
					description: 'Error addAccountseting group.',
					error: errRes, func: 'addAccounts', obj: 'Group'
				});
				return Promise.reject(errRes.response.text || errRes.response);
			});
		}
	}]);

	return Group;
})(_Action3['default']);

exports['default'] = Group;
module.exports = exports['default'];