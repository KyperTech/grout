import config from '../config';
import {has, isString} from 'lodash';
import matter from './Matter';

let logger = matter.utils.logger;
let request = matter.utils.request;

export default class Action {
  constructor(actionName, actionData) {
    this.name = actionName;
    this.init(actionData);
  }
  /**
   * @description Initialize action
   * @param {Object} actionData - Data with which to initialize action
   */
  init(actionData) {
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
      if (isString(actionData)) {
        this.id = this.actionData;
      } else {
        this.callData = actionData.callData || {};
        // logger.warn({
        //   description: 'Invalid action data object.',
        //   func: 'constructor', obj: 'Action'
        // });
        this.isList = false;
        // return Promise.reject('Invalid this.actionData');
      }
    }
  }
  /**
   * @description Build endpoint in the form of an array
   * @return {Array}
   */
  get endpointArray() {
    let endpointArray = [matter.endpoint, this.name];
    if (has(this, 'app') && has(this.app, 'name') && this.app.name !== config.appName) {
      //Splice apps, appName into index 1
      endpointArray.splice(1, 0, 'apps', this.app.name);
    }
    return endpointArray;
  }
  /** url
   * @description Action url
   * @return {String}
   */
  get url() {
    logger.log({
      description: 'Url created.', url: this.endpointArray.join('/'),
      func: 'url', obj: 'Action'
    });
    return this.endpointArray.join('/');
  }
  /** Get
   * @return {Promise}
   */
  get() {
    return request.get(this.url).then((res) => {
      logger.log({
        description: 'Get responded successfully.',
        res: res, func: 'get', obj: 'Action'
      });
      if (has(res, 'error')) {
        logger.error({
          description: 'Error in get response.', error: res.error,
          res: res, func: 'get', obj: 'Action'
        });
        return Promise.reject(res.error);
      }
      return res.collection ? res.collection : res;
    }, (error) => {
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
  add(newData) {
    return request.post(this.url, newData).then((res) => {
      logger.log({
        description: 'Add request responded successfully.',
        res: res, func: 'add', obj: 'Action'
      });
      if (has(res, 'error')) {
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
    }, (err) => {
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
  update(updateData) {
    return request.put(this.url, updateData).then((res) => {
      if (has(res, 'error')) {
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
    }, (err) => {
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
  remove() {
    return request.del(this.url).then((res) => {
      if (has(res, 'error')) {
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
    }, (err) => {
      logger.error({
        description: 'Error in request for removal.',
        error: err, func: 'remove', obj: 'Action'
      });
      return Promise.reject(err);
    });
  }
}
