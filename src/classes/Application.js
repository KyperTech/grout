//Internal libs and config
import config from '../config';
import { isObject, isString, isArray, has, extend } from 'lodash';
import matter from './Matter';

//Actions and Classes
import {
	Accounts,
	Account,
	Groups
} from '../actions';
import Group from './Group';
import Files from './Files';
import File from './File';

//External Libs
import Firebase from 'firebase';
//Convenience vars
const {request, logger} = matter.utils;
/**
 * Application class.
 *
 */
class Application {
	constructor(appData) {
		//Setup application data based on input
		if (appData && isObject(appData)) {
			extend(this, appData);
		} else if (appData && isString(appData)) {
			this.name = appData;
		}
		if (Firebase && has(config, 'fbUrl') && has(this, 'name')) {
			this.fbUrl = `${config.fbUrl}/${this.name}`;
			this.fbRef = new Firebase(this.fbUrl);
		}
		logger.debug({
			description: 'Application object created.', application: this,
			func: 'constructor', obj: 'Application'
		});
	}
	get appEndpoint() {
		return `${matter.endpoint}/apps/${this.name}`;
	}
	//Get applications or single application
	get() {
		logger.debug({
			description: 'Application get called.', func: 'get', obj: 'Application'
		});
		return request.get(this.appEndpoint).then(response => {
			const application = new Application(response);
			logger.info({
				description: 'Application loaded successfully.',
				response, application, func: 'get', obj: 'Application'
			});
			return application;
		})['catch'](error => {
			logger.error({
				description: 'Error getting Application.',
				message: error.response.text , error,
				func: 'get', obj: 'Application'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	//Update an application
	update(appData) {
		logger.debug({
			description: 'Application update called.',
			func: 'update', obj: 'Application'
		});
		return request.put(this.appEndpoint, appData).then(response => {
			logger.info({
				description: 'Application updated successfully.',
				response, func: 'update', obj: 'Application'
			});
			return new Application(response);
		})['catch'](error => {
			logger.error({
				description: 'Error updating application.',
				error, func: 'update', obj: 'Application'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	addStorage() {
		logger.debug({
			description: 'Application add storage called.', application: this,
			func: 'addStorage', obj: 'Application'
		});
		return request.post(`${this.appEndpoint}/storage`, {}).then(response => {
			const application = new Application(response)
			logger.info({
				description: 'Storage successfully added to application.',
				response, application, func: 'addStorage', obj: 'Application'
			});
			return application;
		})['catch'](error => {
			logger.error({
				description: 'Error adding storage to application.',
				error, func: 'addStorage', obj: 'Application'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	applyTemplate(template) {
		logger.debug({
			description: 'Applying template to project.',
			func: 'applyTemplate', obj: 'Application'
		});
		return request.post(this.appEndpoint, {template}).then((response) => {
			logger.info({
				description: 'Template successfully applied to application.',
				response, application: this,
				func: 'applyTemplate', obj: 'Application'
			});
			return new Application(response);
		})['catch'](error => {
			logger.error({
				description: 'Error applying template to application.',
				error, application: this,
				func: 'applyTemplate', obj: 'Application'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	/**
	 * @description Add collaborators to Project
	 * @param {Array|String} collabs - Array list of Ids, or a string list of ids
	 */
	addCollaborators(collabs) {
		logger.debug({
			description: 'Add collaborators called', collabs,
			application: this, func: 'addCollaborators', obj: 'Application'
		});
		this.collaborators = collabs;
		//Handle string of ids
		if (!isArray(collabs) && isString(collabs)) {
			this.collaborators =  collabs.replace(' ').split(',');
		}
		logger.log({
			description: 'Collaborators list added to application, calling update.',
			application: this, func: 'addCollaborators', obj: 'Application'
		});
		return this.update(this);
	}
	//Files object that contains files methods
	get Files() {
		logger.debug({
			description: 'Applications files action called.',
			application: this, func: 'files', obj: 'Application'
		});
		return new Files({app: this});
	}
	File(fileData) {
		logger.debug({
			description: 'Applications file action called.',
			fileData, application: this,
			func: 'file', obj: 'Application'
		});
		return new File({app: this, fileData});
	}
	get Users() {
		logger.debug({
			description: 'Applications users action called.',
			application: this, func: 'user', obj: 'Application'
		});
		return new Accounts({app: this});
	}
	User(userData) {
		logger.debug({
			description: 'Applications user action called.',
			userData, application: this, func: 'user', obj: 'Application'
		});
		return new Account({app: this, userData});
	}
	get Accounts() {
		logger.debug({
			description: 'Applications account action called.',
			application: this, func: 'user', obj: 'Application'
		});
		return new Accounts({app: this});
	}
	Account(userData) {
		logger.debug({
			description: 'Applications account action called.',
			userData, application: this,
			func: 'user', obj: 'Application'
		});
		return new Account({app: this, userData});
	}
	get Groups() {
		logger.debug({
			description: 'Applications groups action called.',
			application: this, func: 'groups', obj: 'Application'
		});
		return new Groups({app: this});
	}
	Group(groupData) {
		logger.debug({
			description: 'Applications group action called.',
			groupData, application: this,
			func: 'group', obj: 'Application'
		});
		return new Group({app: this, groupData});
	}
}

export default Application;
