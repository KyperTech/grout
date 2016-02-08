'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _matter$utils = _Matter2.default.utils;
var logger = _matter$utils.logger;
var request = _matter$utils.request;

var ApiAction = function () {
	function ApiAction(endpoint, project) {
		_classCallCheck(this, ApiAction);

		this.endpoint = endpoint;
		this.project = project || null;
		logger.debug({
			description: 'Init action called.',
			Action: this, func: 'init', obj: 'ApiAction'
		});
	}

	/** url
  * @description ApiAction url
  * @return {String}
  */


	_createClass(ApiAction, [{
		key: 'get',


		/** Get
   * @return {Promise}
   */
		value: function get() {
			return request.get(this.url);
		}

		/** Add
   * @param {Object} newData - Object containing data to create with
   * @return {Promise}
   */

	}, {
		key: 'add',
		value: function add(newData) {
			logger.debug({
				description: 'Add request responded successfully.',
				newData: newData, func: 'add', obj: 'ApiAction'
			});
			return request.post(this.url, newData);
		}

		/** Update
   * @param {Object} updateData - Object containing data with which to update
   * @return {Promise}
   */

	}, {
		key: 'update',
		value: function update(updateData) {
			if (!updateData) {
				updateData = this;
			}
			return request.put(this.url, updateData);
		}

		/** Remove
   * @return {Promise}
   */

	}, {
		key: 'remove',
		value: function remove() {
			return request.del(this.url);
		}

		/** search
   * @param {String} query - String query
   * @return {Promise}
   */

	}, {
		key: 'search',
		value: function search(query) {
			if (!query || query == '') {
				logger.log({
					description: 'Null query, returning empty array.',
					func: 'search', obj: 'ApiAction'
				});
				return Promise.resolve([]);
			}
			if (!(0, _isString2.default)(query)) {
				logger.warn({
					description: 'Invalid query type in search (should be string).',
					func: 'search', obj: 'ApiAction'
				});
				return Promise.reject({
					message: 'Invalid query type. Search query should be string.'
				});
			}
			//Search email if query contains @
			var key = query.indexOf('@') === -1 ? 'username' : 'email';
			return request.get(this.url + '/search?' + key + '=' + query);
		}
	}, {
		key: 'url',
		get: function get() {
			var urlStr = [_config2.default.serverUrl, this.endpoint].join('/');
			logger.debug({
				description: 'Url created.', urlStr: urlStr,
				func: 'url', obj: 'ApiAction'
			});
			return urlStr;
		}
	}]);

	return ApiAction;
}();

exports.default = ApiAction;
module.exports = exports['default'];