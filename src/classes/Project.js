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
 * Project class.
 *
 */
class Project {
	constructor(appData) {
		//Setup application data based on input
		if (appData && isObject(appData)) {
			extend(this, appData);
		} else if (appData && isString(appData)) {
			this.name = appData;
			//TODO: Handle no owner data being provided?
		}
		if (Firebase && has(config, 'fbUrl') && has(this, 'name')) {
			this.fbUrl = `${config.fbUrl}/${this.name}`;
			this.fbRef = new Firebase(this.fbUrl);
		}
		logger.debug({
			description: 'Project object created.', application: this,
			func: 'constructor', obj: 'Project'
		});
	}
	/**
	 * @description Project endpoint on Tessellate server
	 * @return {String}
	 */
	get endpoint() {
		return `${matter.endpoint}/apps/${this.name}`;
	}
	/**
	 * @description Project files Firebase Url
	 * @return {String}
	 */
	get fbUrl() {
		if (Firebase && has(config, 'fbUrl') && has(this, 'name')) {
			return `${config.fbUrl}/${this.name}`;
		}
	}
	/**
	 * @description Generate Firebase reference based on project url
	 */
	get fbRef() {
		if (this.fbUrl) {
			this.fbRef = new Firebase(this.fbUrl);
		}
	}
	/**
	 * @description Get project data
	 */
	get() {
		logger.debug({
			description: 'Project get called.', func: 'get', obj: 'Project'
		});
		return request.get(this.endpoint).then(response => {
			const application = new Project(response);
			logger.info({
				description: 'Project loaded successfully.',
				response, application, func: 'get', obj: 'Project'
			});
			return application;
		})['catch'](error => {
			logger.error({
				description: 'Error getting Project.',
				message: error.response.text , error,
				func: 'get', obj: 'Project'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	/**
	 * @description Update project data
	 */
	update(appData) {
		logger.debug({
			description: 'Project update called.',
			func: 'update', obj: 'Project'
		});
		return request.put(this.endpoint, appData).then(response => {
			logger.info({
				description: 'Project updated successfully.',
				response, func: 'update', obj: 'Project'
			});
			return new Project(response);
		})['catch'](error => {
			logger.error({
				description: 'Error updating application.',
				error, func: 'update', obj: 'Project'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	/**
	 * @description Add static file hosting storage (currrently though AWS S3)
	 */
	addStorage() {
		logger.debug({
			description: 'Project add storage called.', application: this,
			func: 'addStorage', obj: 'Project'
		});
		return request.post(`${this.endpoint}/storage`, {}).then(response => {
			const application = new Project(response)
			logger.info({
				description: 'Storage successfully added to application.',
				response, application, func: 'addStorage', obj: 'Project'
			});
			return application;
		})['catch'](error => {
			logger.error({
				description: 'Error adding storage to application.',
				error, func: 'addStorage', obj: 'Project'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
	/**
	 * @description Apply a template to Project
	 */
	applyTemplate(template) {
		logger.debug({
			description: 'Applying template to project.',
			func: 'applyTemplate', obj: 'Project'
		});
		return request.post(this.endpoint, {template}).then((response) => {
			logger.info({
				description: 'Template successfully applied to application.',
				response, application: this,
				func: 'applyTemplate', obj: 'Project'
			});
			return new Project(response);
		})['catch'](error => {
			logger.error({
				description: 'Error applying template to application.',
				error, application: this,
				func: 'applyTemplate', obj: 'Project'
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
			application: this, func: 'addCollaborators', obj: 'Project'
		});
		this.collaborators = collabs;
		//Handle string of ids
		if (!isArray(collabs) && isString(collabs)) {
			this.collaborators =  collabs.replace(' ').split(',');
		}
		logger.log({
			description: 'Collaborators list added to application, calling update.',
			application: this, func: 'addCollaborators', obj: 'Project'
		});
		return this.update(this);
	}
	//Files object that contains files methods
	get Files() {
		logger.debug({
			description: 'Projects files action called.',
			application: this, func: 'files', obj: 'Project'
		});
		return new Files({app: this});
	}
	File(fileData) {
		logger.debug({
			description: 'Projects file action called.',
			fileData, application: this,
			func: 'file', obj: 'Project'
		});
		return new File({app: this, fileData});
	}
	get Users() {
		logger.debug({
			description: 'Projects users action called.',
			application: this, func: 'user', obj: 'Project'
		});
		return new Accounts({app: this});
	}
	User(userData) {
		logger.debug({
			description: 'Projects user action called.',
			userData, application: this, func: 'user', obj: 'Project'
		});
		return new Account({app: this, userData});
	}
	get Accounts() {
		logger.debug({
			description: 'Projects account action called.',
			application: this, func: 'user', obj: 'Project'
		});
		return new Accounts({app: this});
	}
	Account(userData) {
		logger.debug({
			description: 'Projects account action called.',
			userData, application: this,
			func: 'user', obj: 'Project'
		});
		return new Account({app: this, userData});
	}
	get Groups() {
		logger.debug({
			description: 'Projects groups action called.',
			application: this, func: 'groups', obj: 'Project'
		});
		return new Groups({app: this});
	}
	Group(groupData) {
		logger.debug({
			description: 'Projects group action called.',
			groupData, application: this,
			func: 'group', obj: 'Project'
		});
		return new Group({app: this, groupData});
	}
}

export default Project;
