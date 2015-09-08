import config from '../config';
import matter from '../classes/Matter';
import _ from 'lodash';
let request = matter.utils.request;
let logger = matter.utils.logger;

//Actions for specific user
class User {
	constructor(userData) {
		//Call matter with name and settings
		if (userData && _.isObject(userData) && _.has(userData, 'username')) {
			_.extend(this, userData);
		} else if (userData && _.isString(userData)) {
			this.username = userData;
		} else {
			logger.error({description: 'Userdata is required to start an UserAction', func: 'constructor', obj: 'User'});
			throw new Error('Username is required to start an UserAction');
		}
	}
	//Build endpoint based on userData
	get userEndpoint() {
		if (_.has(this, 'appName')) {
			return `${matter.endpoint}/apps/${this.appName}/users/${this.username}`;
		}
		return `${matter.endpoint}/users/${this.username}`;
	}
	//Get a user
	get() {
		logger.debug({description: 'User data loaded successfully.', func: 'get', obj: 'User'});
		return request.get(this.userEndpoint).then((response) => {
			logger.info({description: 'User data loaded successfully.', response: response, func: 'get', obj: 'User'});
			return new User(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error getting user.', error: errRes, func: 'get', obj: 'User'});
			return Promise.reject(errRes);
		});
	}
	//Update a User
	update(userData) {
		logger.debug({description: 'Update user called.', userData: userData, func: 'update', obj: 'User'});
		return request.put(this.userEndpoint, userData).then((response) => {
			logger.info({description: 'User updated successfully.', func: 'update', obj: 'User'});
			//TODO: Extend this with current info before returning
			return new User(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error updating user.', func: 'update', obj: 'User'});
			return Promise.reject(errRes);
		});
	}
	//Delete a User
	del(userData) {
		logger.debug({description: 'Delete user called.', func: 'del', obj: 'User'});
		return request.delete(this.endpoint, userData).then((response) => {
			logger.info({description: 'Delete user successful.', response: response, func: 'del', obj: 'User'});
			return new User(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error deleting user.', userData: userData, error: errRes, func: 'del', obj: 'User'});
		return Promise.reject(errRes);
		});
	}
}

export default User;
