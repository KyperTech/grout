//Internal libs and config
import config from '../config';
import _ from 'lodash';
import matter from './Matter';

//Actions and Classes
import GroupsAction from '../actions/GroupsAction';
import Group from './Group';
import DirectoriesAction from '../actions/DirectoriesAction';
import Directory from './Directory';
import UsersAction from '../actions/UsersAction';
import User from './User';
import Files from './Files';
import File from './File';

//External Libs
import Firebase from 'firebase';
import AWS from 'aws-sdk';

//Convenience vars
let request = matter.utils.request;
let logger = matter.utils.logger;

/**
 * Application class.
 *
 */
class Application {
	constructor(appData) {
		//Setup application data based on input
		if (appData && _.isObject(appData)) {
			this.name = appData.name;
			this.owner = appData.owner || null;
			this.collaborators = appData.collaborators || [];
			this.createdAt = appData.createdAt;
			this.updatedAt = appData.updatedAt;
			this.frontend = appData.frontend || {};
			this.backend = appData.backend || {};
			this.groups = appData.groups || null;
			this.directories = appData.directories || null;
		} else if (appData && _.isString(appData)) {
			this.name = appData;
		}
		if (Firebase) {
			this.fbRef = new Firebase(config.fbUrl + appData.name);
		}
		// logger.debug({description: 'Application object created.', application: this, func: 'constructor', obj: 'Application'});
	}
	get appEndpoint() {
		return `${matter.endpoint}/apps/${this.name}`;
	}
	//Get applications or single application
	get() {
		logger.debug({description: 'Application get called.', func: 'get', obj: 'Application'});
		return request.get(this.appEndpoint).then((response) => {
			logger.info({description: 'Application loaded successfully.', response: response, application: new Application(response), func: 'get', obj: 'Application'});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error getting Application.', error: errRes, func: 'get', obj: 'Application'});
			return Promise.reject(errRes);
		});
	}
	//Update an application
	update(appData) {
		logger.debug({description: 'Application update called.', func: 'update', obj: 'Application'});
		return request.put(this.appEndpoint, appData).then((response) => {
			logger.info({description: 'Application updated successfully.', response: response, func: 'update', obj: 'Application'});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error updating application.', error: errRes, func: 'update', obj: 'Application'});
			return Promise.reject(errRes);
		});
	}

	addStorage() {
		logger.debug({description: 'Application add storage called.', application: this, func: 'addStorage', obj: 'Application'});
		return request.post(`${this.appEndpoint}/storage`, appData).then((response) => {
			logger.info({description: 'Storage successfully added to application.', response: response, application: new Application(response), func: 'addStorage', obj: 'Application'});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error adding storage to application.', error: errRes, func: 'addStorage', obj: 'Application'});
			return Promise.reject(errRes);
		});
	}
	applyTemplate() {
		logger.error({description: 'Applying templates to existing applications is not currently supported.', func: 'applyTemplate', obj: 'Application'});
		return request.post(endpoint, appData).then((response) => {
			logger.info({description: 'Template successfully applied to application.', response: response, application: this, func: 'applyTemplate', obj: 'Application'});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({description: 'Error applying template to application.', error: errRes, application: this, func: 'applyTemplate', obj: 'Application'});
			return Promise.reject(errRes);
		});
	}
	//Files object that contains files methods
	get files() {
		logger.debug({description: 'Applications files action called.', application: this, func: 'files', obj: 'Application'});
		return new Files(this);
	}
	file(fileData) {
		logger.debug({description: 'Applications file action called.', fileData: fileData, application: this, func: 'file', obj: 'Application'});
		return new File(fileData);
	}
	get users() {
		logger.debug({description: 'Applications users action called.', application: this, func: 'user', obj: 'Application'});
		return new UsersAction();
	}
	user(userData) {
		logger.debug({description: 'Applications user action called.', userData: userData, application: this, func: 'user', obj: 'Application'});
		return new User(userData);
	}
	get groups() {
		logger.debug({description: 'Applications groups action called.', application: this, func: 'groups', obj: 'Application'});
		return new GroupsAction({app: this});
	}
	group(groupData) {
		logger.debug({description: 'Applications group action called.', groupData: groupData, application: this, func: 'group', obj: 'Application'});
		return new Group(groupData);
	}
	get directories() {
		logger.debug({description: 'Applications directories action called.', application: this, func: 'directories', obj: 'Application'});
		return new DirectoriesAction();
	}
	directory(directoryData) {
		logger.debug({description: 'Applications directory action called.', directoryData: directoryData, application: this, func: 'directory', obj: 'Application'});
		return new Directory(directoryData);
	}
}

export default Application;
