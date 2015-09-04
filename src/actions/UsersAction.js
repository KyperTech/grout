import config from '../config';
import _ from 'lodash';
import Matter from 'kyper-matter';

//Actions for users list
class UsersAction extends Matter {
	constructor() {
		//Call matter with name and settings
		super(config.appName, config.matterOptions);
	}
	get usersEndpoint() {
		return `${this.endpoint}/users`;
	}
	//Get users or single application
	get(query) {
		return this.utils.request.get(this.usersEndpoint).then((response) => {
			console.log('[MatterClient.apps().get()] App(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.apps().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Add an application
	add(appData) {
		return this.utils.request.post(this.usersEndpoint, appData).then((response) => {
			console.log('[MatterClient.apps().add()] Application added successfully: ', response);
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
		console.log('searchEndpoint:', searchEndpoint);
		return this.utils.request.get(searchEndpoint).then((response) => {
			console.log('[MatterClient.users().search()] Users(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.users().search()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
}
export default UsersAction;
