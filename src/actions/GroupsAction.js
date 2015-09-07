import config from '../config';
import _ from 'lodash';
import matter from '../classes/Matter';
let logger = matter.utils.logger;
//Actions for users list
class GroupsAction {
	get usersEndpoint() {
		return `${matter.endpoint}/users`;
	}
	//Get users or single application
	get() {
		console.log({description: 'Users get called.', func: 'get', obj: 'GroupsAction'});
		return matter.utils.request.get(this.usersEndpoint).then((response) => {
			console.log('users loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('error getting users');
			return Promise.reject(errRes);
		});
	}
	//Add an application
	add(appData) {
		return this.utils.request.post(this.usersEndpoint, appData).then((response) => {
			console.log('[MatterClient.users().add()] Application added successfully: ', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.getApps()] Error adding application: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Search with partial of username
	search(query) {
		console.log('search called:', query);
		var searchEndpoint = this.usersEndpoint + '/search/';
		if (query && _.isString(query)) {
			searchEndpoint += query;
		}
		if (!query || query == '') {
			logger.log({description: 'Null query, returning empty array.', func: 'search', obj: 'GroupsAction'});
			return Promise.resolve([]);
		}
		return matter.utils.request.get(searchEndpoint).then((response) => {
			console.log('[MatterClient.users().search()] Users(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.users().search()] Error getting users list: ', errRes);
			return Promise.reject(errRes);
		});
	}
}
export default GroupsAction;
