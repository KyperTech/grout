import config from '../config';
import { isString } from 'lodash';
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
		return request.get(this.url);
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
		return request.post(this.url, newData);
	}

	/** Update
	 * @param {Object} updateData - Object containing data with which to update
	 * @return {Promise}
	 */
	update(updateData) {
		if (!updateData) {
			updateData = this;
		}
		return request.put(this.url, updateData);
	}

	/** Remove
	 * @return {Promise}
	 */
	remove() {
		return request.del(this.url);
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
			return Promise.reject({
				message:'Invalid query type. Search query should be string.'
			});
		}
		//Search email if query contains @
		const key = query.indexOf('@') === -1 ? 'username' : 'email';
		return request.get(`${this.url}/search?${key}=${query}`);
	}
}
