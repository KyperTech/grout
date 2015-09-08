import config from '../config';
import _ from 'lodash';
import matter from '../classes/Matter';
let request = matter.utils.request;
let logger = matter.utils.logger;

//Actions for users list
class GroupsAction {
	constructor(actionData) {
		//Check to see if action is for a specific app
		if (actionData && _.isObject(actionData) && _.has(actionData, 'appName')) {
			this.appName = actionData.appName;
		} else if (actionData && _.isString(actionData)) {
			this.appName = actionData;
		}
	}
	get groupsEndpoint() {
		//Check for app groups action
		if (this.appName) {
			return `${matter.endpoint}/apps/${this.appName}/groups`;
		}
		return `${matter.endpoint}/groups`;
	}
	//Get users or single application
	get() {
		logger.debug({description: 'Get group called.', func: 'get', obj: 'GroupsAction'});
		return request.get(this.groupsEndpoint).then((response) => {
			logger.info({description: 'Groups loaded successfully.', func: 'get', obj: 'GroupsAction'});
			return response;
		})['catch']((errRes) => {
			logger.info({description: 'Error getting groups.', error: errRes, func: 'get', obj: 'GroupsAction'});
			return Promise.reject(errRes);
		});
	}
	//Add an application
	add(groupData) {
		logger.debug({description: 'Add group called.', groupData: groupData, func: 'add', obj: 'GroupsAction'});
		return request.post(this.groupsEndpoint, groupData).then((response) => {
			logger.log({description: 'Application added successfully.', response: response, func: 'add', obj: 'GroupsAction'});
			//TODO: Return list of group objects
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error adding group.', error: errRes, func: 'add', obj: 'GroupsAction'});
			return Promise.reject(errRes);
		});
	}
	//Search with partial of username
	search(query) {
		logger.debug({description: 'Add group called.', groupData: groupData, func: 'search', obj: 'GroupsAction'});
		if (!query || query == '' || !_.isString(query)) {
			logger.log({description: 'Null or invalid query, returning empty array.', func: 'search', obj: 'GroupsAction'});
			return Promise.resolve([]);
		}
		let searchEndpoint = `${this.groupsEndpoint}/search/${query}`;
		logger.debug({description: 'Search endpoint created.', endpoint: searchEndpoint, func: 'search', obj: 'GroupsAction'});
		return request.get(searchEndpoint).then((response) => {
			logger.log({description: 'Found groups based on search.', response: response, func: 'search', obj: 'GroupsAction'});
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error searching groups.', error: errRes, func: 'search', obj: 'GroupsAction'});
			return Promise.reject(errRes);
		});
	}
}
export default GroupsAction;
