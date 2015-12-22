Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var logger = _Matter2['default'].utils.logger;
var request = _Matter2['default'].utils.request;

var Action = (function () {
  function Action(actionName, actionData) {
    _classCallCheck(this, Action);

    this.name = actionName;
    this.init(actionData);
  }

  /**
   * @description Initialize action
   * @param {Object} actionData - Data with which to initialize action
   */

  _createClass(Action, [{
    key: 'init',
    value: function init(actionData) {
      logger.log({
        description: 'Init action called.',
        actionData: actionData, func: 'url', obj: 'Action'
      });
      if (!actionData || !actionData.app) {
        logger.error({
          description: 'Action data with app is required.',
          actionData: actionData, func: 'url', obj: 'Action'
        });
        throw Error('Action data with app is required.');
      }
      this.isList = actionData ? false : true;
      this.app = actionData.app;
      if (!this.isList) {
        this.actionData = actionData;
        this.callData = actionData.callData || {};
        if ((0, _lodash.isString)(actionData)) {
          //String username provided
          this.id = this.actionData;
        } else {
          logger.warn({
            description: 'Invalid action data object.',
            func: 'constructor', obj: 'Action'
          });
          this.isList = false;
          // return Promise.reject('Invalid this.actionData');
        }
      }
    }

    /**
     * @description Build endpoint in the form of an array
     * @return {Array}
     */
  }, {
    key: 'get',

    /** Get
     * @return {Promise}
     */
    value: function get() {
      return request.get(this.url).then(function (res) {
        logger.log({
          description: 'Get responded successfully.',
          res: res, func: 'get', obj: 'Action'
        });
        if ((0, _lodash.has)(res, 'error')) {
          logger.error({
            description: 'Error in get response.', error: res.error,
            res: res, func: 'get', obj: 'Action'
          });
          return Promise.reject(res.error);
        }
        return res.collection ? res.collection : res;
      }, function (error) {
        logger.error({
          description: 'Error in GET request.', error: error,
          func: 'get', obj: 'Action'
        });
        return Promise.reject(error);
      });
    }

    /** Add
     * @param {Object} newData - Object containing data to create with
     * @return {Promise}
     */
  }, {
    key: 'add',
    value: function add(newData) {
      return request.post(this.url, newData).then(function (res) {
        logger.log({
          description: 'Add request responded successfully.',
          res: res, func: 'add', obj: 'Action'
        });
        if ((0, _lodash.has)(res, 'error')) {
          logger.error({
            description: 'Error creating new user.', error: res.error,
            res: res, func: 'add', obj: 'Action'
          });
          return Promise.reject(res.error);
        }
        logger.log({
          description: 'Add successful.', res: res,
          func: 'add', obj: 'Action'
        });
        return res;
      }, function (err) {
        logger.error({
          description: 'Error creating new user.',
          error: err, func: 'add', obj: 'Action'
        });
        return Promise.reject(err);
      });
    }

    /** Update
     * @param {Object} updateData - Object containing data with which to update
     * @return {Promise}
     */
  }, {
    key: 'update',
    value: function update(updateData) {
      return request.put(this.url, updateData).then(function (res) {
        if ((0, _lodash.has)(res, 'error')) {
          logger.error({
            description: 'Error in update request.',
            error: res.error, res: res, func: 'update', obj: 'Action'
          });
          return Promise.reject(res.error);
        }
        logger.log({
          description: 'Update successful.', res: res,
          func: 'update', obj: 'Action'
        });
        return res;
      }, function (err) {
        logger.error({
          description: 'Error in update request.',
          error: err, func: 'update', obj: 'Action'
        });
        return Promise.reject(err);
      });
    }

    /** Remove
     * @return {Promise}
     */
  }, {
    key: 'remove',
    value: function remove() {
      return request.del(this.url).then(function (res) {
        if ((0, _lodash.has)(res, 'error')) {
          logger.error({
            description: 'Error in request for removal.',
            error: res.error, res: res, func: 'remove', obj: 'Action'
          });
          return Promise.reject(res.error);
        }
        logger.log({
          description: 'Remove successfully.',
          res: res, func: 'remove', obj: 'Action'
        });
        return res;
      }, function (err) {
        logger.error({
          description: 'Error in request for removal.',
          error: err, func: 'remove', obj: 'Action'
        });
        return Promise.reject(err);
      });
    }
  }, {
    key: 'endpointArray',
    get: function get() {
      var endpointArray = [_Matter2['default'].endpoint, this.name];
      if ((0, _lodash.has)(this, 'app') && (0, _lodash.has)(this.app, 'name') && this.app.name !== _config2['default'].appName) {
        //Splice apps, appName into index 1
        endpointArray.splice(1, 0, 'apps', this.app.name);
      }
      return endpointArray;
    }

    /** url
     * @description Action url
     * @return {String}
     */
  }, {
    key: 'url',
    get: function get() {
      logger.log({
        description: 'Url created.', url: this.endpointArray.join('/'),
        func: 'url', obj: 'Action'
      });
      return this.endpointArray.join('/');
    }
  }]);

  return Action;
})();

exports['default'] = Action;
module.exports = exports['default'];