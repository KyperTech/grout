import config from '../config';
import matter from '../classes/Matter';

//Actions for specific user
class GroupAction {
	constructor(userName) {
		//Call matter with name and settings
		if (userName) {
			this.username = userName;
		} else {
			console.error('Username is required to start an GroupAction');
			throw new Error('Username is required to start an GroupAction');
		}
	}
	get userEndpoint() {
		return `${matter.endpoint}/users/${this.username}`;
	}
	//Get userlications or single userlication
	get() {
		return matter.utils.request.get(this.userEndpoint).then((response) => {
			console.log('[MatterClient.user().get()] App(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.user().get()] Error getting users list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Update an userlication
	update(userData) {
		return matter.utils.request.put(this.userEndpoint, userData).then((response) => {
			console.log('[MatterClient.users().update()] App:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.users().update()] Error updating user: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Delete an userlication
	//TODO: Only do matter.utils.request if deleting personal account
	del(userData) {
		console.error('Deleting a user is currently disabled.');
		// return matter.utils.request.delete(this.endpoint, userData).then((response) => {
		// 	console.log('[MatterClient.users().del()] Apps:', response);
		// 	return new User(response);
		// })['catch']((errRes) => {
		// 	console.error('[MatterClient.users().del()] Error deleting user: ', errRes);
		// 	return Promise.reject(errRes);
		// });
	}
}

export default GroupAction;
