import config from '../config';
import User from '../classes/User';
import Matter from 'kyper-matter';

//Actions for specific user
class UserAction extends Matter {
	constructor(userName) {
		//Call matter with name and settings
		super(config.appName, config.matterOptions);
		if (userName) {
			this.username = userName;
		} else {
			console.error('Username is required to start an UserAction');
			throw new Error('Username is required to start an UserAction');
		}
	}
	get userEndpoint() {
		return `${this.endpoint}/users/${this.username}`;
	}
	//Get userlications or single userlication
	get() {
		return this.utils.request.get(this.userEndpoint).then((response) => {
			console.log('[MatterClient.user().get()] App(s) data loaded:', response);
			return new User(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.user().get()] Error getting users list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Update an userlication
	update(userData) {
		return this.utils.request.put(this.userEndpoint, userData).then((response) => {
			console.log('[MatterClient.users().update()] App:', response);
			return new User(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.users().update()] Error updating user: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Delete an userlication
	//TODO: Only do this.utils.request if deleting personal account
	del(userData) {
		console.error('Deleting a user is currently disabled.');
		// return this.utils.request.delete(this.endpoint, userData).then((response) => {
		// 	console.log('[MatterClient.users().del()] Apps:', response);
		// 	return new User(response);
		// })['catch']((errRes) => {
		// 	console.error('[MatterClient.users().del()] Error deleting user: ', errRes);
		// 	return Promise.reject(errRes);
		// });
	}
}

export default UserAction;
