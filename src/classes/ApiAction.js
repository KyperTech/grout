import config from '../config';
import { has, isString, extend } from 'lodash';
import matter from './Matter';
const { logger, request } = matter.utils;

export default class ApiAction {
	constructor(endpoint, project) {
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
	get url() {
		const urlStr = [config.serverUrl, this.endpoint].join('/');
		logger.debug({
			description: 'Url created.', urlStr,
			func: 'url', obj: 'ApiAction'
		});
		return urlStr;
	}

	/** Get
	 * @return {Promise}
	 */
	get() {
		return request.get(this.url).then(res => {
			logger.log({
				description: 'Get responded successfully.',
				res, func: 'get', obj: 'ApiAction'
			});
			if (has(res, 'error')) {
				logger.error({
					description: 'Error in get response.', error: res.error,
					res, func: 'get', obj: 'ApiAction'
				});
				return Promise.reject(res.error);
			}
			return res.collection ? res.collection : res;
		}, error => {
			logger.error({
				description: 'Error in GET request.', error,
				func: 'get', obj: 'ApiAction'
			});
			return Promise.reject(error);
		});
	}

	/** Add
	 * @param {Object} newData - Object containing data to create with
	 * @return {Promise}
	 */
	add(newData) {
		logger.debug({
			description: 'Add request responded successfully.',
			newData, func: 'add', obj: 'ApiAction'
		});
		return request.post(this.url, newData).then(res => {
			logger.log({
				description: 'Add request responded successfully.',
				res, func: 'add', obj: 'ApiAction'
			});
			if (has(res, 'error')) {
				logger.error({
					description: 'Error in add request.', error: res.error,
					action: this, res, func: 'add', obj: 'ApiAction'
				});
				return Promise.reject(res.error);
			}
			logger.log({
				description: 'Add successful.', res, action: this,
				func: 'add', obj: 'ApiAction'
			});
			return res;
		}, error => {
			logger.error({
				description: `Error in add request.`,
				action: this, error, func: 'add', obj: 'ApiAction'
			});
			return Promise.reject(error);
		});
	}

	/** Update
	 * @param {Object} updateData - Object containing data with which to update
	 * @return {Promise}
	 */
	update(updateData) {
		if (!updateData) {
			updateData = this;
		}
		return request.put(this.url, updateData).then(res => {
			if (has(res, 'error')) {
				logger.error({
					description: 'Error in update request.',
					error: res.error, res, func: 'update', obj: 'ApiAction'
				});
				return Promise.reject(res.error);
			}
			logger.log({
				description: 'Update successful.', res,
				func: 'update', obj: 'ApiAction'
			});
			return res;
		}, error => {
			logger.error({
				description: 'Error in update request.',
				error, func: 'update', obj: 'ApiAction'
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
					error: res.error, res, func: 'remove', obj: 'ApiAction'
				});
				return Promise.reject(res.error);
			}
			logger.log({
				description: 'Remove successful.',
				res, func: 'remove', obj: 'ApiAction'
			});
			return res;
		}, error => {
			logger.error({
				description: 'Error in request for removal.', action: this,
				error, func: 'remove', obj: 'ApiAction'
			});
			return Promise.reject(error);
		});
	}

	/** search
	 * @param {String} query - String query
	 * @return {Promise}
	 */
	search(query) {
		if (!query || query == '') {
			logger.log({
				description: 'Null query, returning empty array.',
				func: 'search', obj: 'ApiAction'
			});
			return Promise.resolve([]);
		}
		if (!isString(query)) {
			logger.warn({
				description: 'Invalid query type in search (should be string).',
				func: 'search', obj: 'ApiAction'
			});
			return Promise.reject('Invalid query type. Search query should be string.');
		}
		return request.get(`${this.url}/search/${query}`).then(res => {
			if (has(res, 'error')) {
				logger.error({
					description: 'Error in search request.', action: this,
					res, func: 'search', obj: 'ApiAction'
				});
				return Promise.reject(res.error || res);
			}
			logger.info({
				description: 'Search successful.', res, func: 'search', obj: 'ApiAction'
			});
			return res;
		}, error => {
			logger.error({
				description: 'Error in request for search.', action: this,
				error, func: 'search', obj: 'ApiAction'
			});
			return Promise.reject(error);
		});
	}
}
