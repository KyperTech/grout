import config from '../config';
import matter from './Matter';
import _ from 'lodash';
let request = matter.utils.request;
let logger = matter.utils.logger;

//Actions for specific user
class Group {
	constructor(actionData) {
		//Call matter with name and settings
		if (actionData && _.isObject(actionData) && _.has(actionData, 'groupName')) { //Data is object containing group data
			this.name = actionData.groupName;
			if (_.has(actionData, 'appName')) {
				this.appName = actionData.appName;
			}
		} else if (actionData && _.isString(actionData)) { //Data is string name
			this.name = actionData;
		} else {
			logger.error({description: 'Action data is required to start a Group Action.', func: 'constructor', obj: 'Group'});
			throw new Error('Username is required to start an Group');
		}
	}
	get groupEndpoint() {
		if (_.has(this, 'appName')) {
			return `${matter.endpoint}/${this.appName}/groups/${this.name}`;
		}
		return `${matter.endpoint}/groups/${this.name}`;
	}
	//Get userlications or single userlication
	get() {
		return request.get(this.groupEndpoint).then((response) => {
			logger.info({description: 'Group data loaded successfully.', groupData: groupData, response: response, func: 'get', obj: 'Group'});
			return response;
		})['catch']((errRes) => {
			logger.info({description: 'Error getting group.', groupData: groupData, error: errRes, func: 'get', obj: 'Group'});
			return Promise.reject(errRes);
		});
	}
	//Update an Group
	update(groupData) {
		logger.log({description: 'Group updated called.', groupData: groupData, func: 'update', obj: 'Group'});
		return matter.utils.request.put(this.groupEndpoint, groupData).then((response) => {
			logger.info({description: 'Group updated successfully.', groupData: groupData, response: response, func: 'update', obj: 'Group'});
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error updating group.', groupData: groupData, error: errRes, func: 'update', obj: 'Group'});
			return Promise.reject(errRes);
		});
	}
	//Delete an Group
	del(groupData) {
		logger.log({description: 'Delete group called.', groupData: groupData, func: 'del', obj: 'Group'});
		return request.delete(this.groupEndpoint, userData).then((response) => {
			logger.info({description: 'Group deleted successfully.', groupData: groupData, func: 'del', obj: 'Group'});
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error deleting group.', groupData: groupData, error: errRes, func: 'del', obj: 'Group'});
			return Promise.reject(errRes);
		});
	}
}

export default Group;
