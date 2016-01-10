import config from '../config';
import { has, isString, extend } from 'lodash';
import matter from './Matter';
const { logger, request } = matter.utils;

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
    logger.debug({
      description: 'Init action called.',
      actionData, func: 'init', obj: 'Action'
    });
    if (!actionData || !actionData.project) {
      logger.error({
        description: 'Action data with project is required.',
        actionData, func: 'init', obj: 'Action'
      });
      throw Error('Action data with project is required.');
    }
    this.isList = actionData ? false : true;
    extend(this, actionData);
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
    if (has(this, 'project') && has(this.project, 'name') && this.project.name !== config.appName) {
      //Splice apps, appName into index 1
      endpointArray.splice(1, 0, 'apps', this.project.name);
    }
    return endpointArray;
  }
  /** url
   * @description Action url
   * @return {String}
   */
  get url() {
    logger.debug({
      description: 'Url created.', url: this.endpointArray.join('/'),
      func: 'url', obj: 'Action'
    });
    return this.endpointArray.join('/');
  }
  /** Get
   * @return {Promise}
   */
  get() {
    return request.get(this.url).then(res => {
      logger.log({
        description: 'Get responded successfully.',
        res, func: 'get', obj: 'Action'
      });
      if (has(res, 'error')) {
        logger.error({
          description: 'Error in get response.', error: res.error,
          res, func: 'get', obj: 'Action'
        });
        return Promise.reject(res.error);
      }
      return res.collection ? res.collection : res;
    }, error => {
      logger.error({
        description: 'Error in GET request.', error,
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
    return request.post(this.url, newData).then(res => {
      logger.log({
        description: 'Add request responded successfully.',
        res, func: 'add', obj: 'Action'
      });
      if (has(res, 'error')) {
        logger.error({
          description: 'Error in add request.', error: res.error,
          action: this, res, func: 'add', obj: 'Action'
        });
        return Promise.reject(res.error);
      }
      logger.log({
        description: 'Add successful.', res, action: this,
        func: 'add', obj: 'Action'
      });
      return res;
    }, error => {
      logger.error({
        description: `Error in add request.`,
        action: this, error, func: 'add', obj: 'Action'
      });
      return Promise.reject(error);
    });
  }
  /** Update
   * @param {Object} updateData - Object containing data with which to update
   * @return {Promise}
   */
  update(updateData) {
    return request.put(this.url, updateData).then(res => {
      if (has(res, 'error')) {
        logger.error({
          description: 'Error in update request.',
          error: res.error, res, func: 'update', obj: 'Action'
        });
        return Promise.reject(res.error);
      }
      logger.log({
        description: 'Update successful.', res,
        func: 'update', obj: 'Action'
      });
      return res;
    }, error => {
      logger.error({
        description: 'Error in update request.',
        error, func: 'update', obj: 'Action'
      });
      return Promise.reject(error);
    });
  }
  /** Remove
   * @return {Promise}
   */
  remove() {
    return request.del(this.url).then(res => {
      if (has(res, 'error')) {
        logger.error({
          description: 'Error in removal request.', action: this,
          error: res.error, res, func: 'remove', obj: 'Action'
        });
        return Promise.reject(res.error);
      }
      logger.log({
        description: 'Remove successful.',
        res, func: 'remove', obj: 'Action'
      });
      return res;
    }, error => {
      logger.error({
        description: 'Error in request for removal.', action: this,
        error, func: 'remove', obj: 'Action'
      });
      return Promise.reject(error);
    });
  }
}
