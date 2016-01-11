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
import FileObj from './File';

//External Libs
import Firebase from 'firebase';
//Convenience vars
const {request, logger} = matter.utils;
/**
 * Project class.
 *
 */
export default class Project {
	constructor(appData) {
		if(!appData || (!isObject(appData) && !isString(appData))){
			logger.error({
				description: 'Project object created.', project: this,
				func: 'constructor', obj: 'Project'
			});
		}
		if (isString(appData)) {
			this.name = appData;
			logger.log({
				description: 'Project object created without owner.', project: this,
				func: 'constructor', obj: 'Project'
			});
		} else {
			extend(this, appData);
		}
		logger.debug({
			description: 'Project object created.', project: this,
			func: 'constructor', obj: 'Project'
		});
	}
	/**
	 * @description Project endpoint on Tessellate server
	 * @return {String}
	 */
	get endpoint() {
		if (this.name === 'tessellate') {
			logger.debug({
				description: 'Project is tessellate. Using matter endpoint.',
				project: this, func: 'endpoint', obj: 'Project'
			});
			return matter.endpoint;
		}
		const projectEndpoint = `${matter.endpoint}/apps/${this.name}`
		logger.debug({
			description: 'Project endpoint created.',
			projectEndpoint, func: 'endpoint', obj: 'Project'
		});
		return projectEndpoint;
	}
	/**
	 * @description Project files Firebase Url
	 * @return {String}
	 */
	get fbUrl() {
		if (has(config, 'fbUrl') && has(this, 'name')) {
			if(has(this, 'owner')){
				return `${config.fbUrl}/files/${this.owner}/${this.name}`;
			}
			return `${config.fbUrl}/${this.name}`;
		}
	}
	/**
	 * @description Generate Firebase reference based on project url
	 */
	get fbRef() {
		if (this.fbUrl) {
			return new Firebase(this.fbUrl);
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
			const project = new Project(response);
			logger.info({
				description: 'Project loaded successfully.',
				response, project, func: 'get', obj: 'Project'
			});
			return project;
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
	update(updateData) {
		logger.debug({
			description: 'Project update called.',
			func: 'update', obj: 'Project'
		});
		return request.put(this.endpoint, updateData).then(response => {
			logger.info({
				description: 'Project updated successfully.',
				response, func: 'update', obj: 'Project'
			});
			return new Project(response);
		})['catch'](error => {
			logger.error({
				description: 'Error updating project.',
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
			description: 'Project add storage called.', project: this,
			func: 'addStorage', obj: 'Project'
		});
		return request.post(`${this.endpoint}/storage`, {}).then(response => {
			const project = new Project(response)
			logger.info({
				description: 'Storage successfully added to project.',
				response, project, func: 'addStorage', obj: 'Project'
			});
			return project;
		})['catch'](error => {
			logger.error({
				description: 'Error adding storage to project.',
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
				description: 'Template successfully applied to project.',
				response, project: this,
				func: 'applyTemplate', obj: 'Project'
			});
			return new Project(response);
		})['catch'](error => {
			logger.error({
				description: 'Error applying template to project.',
				error, project: this,
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
			project: this, func: 'addCollaborators', obj: 'Project'
		});
		this.collaborators = collabs;
		//Handle string of ids
		if (!isArray(collabs) && isString(collabs)) {
			this.collaborators =  collabs.replace(' ').split(',');
		}
		logger.log({
			description: 'Collaborators list added to project, calling update.',
			project: this, func: 'addCollaborators', obj: 'Project'
		});
		return this.update(this);
	}
	//Files object that contains files methods
	get Files() {
		logger.debug({
			description: 'Project files action called.',
			project: this, func: 'files', obj: 'Project'
		});
		return new Files({project: this});
	}
	File(data) {
		logger.debug({
			description: 'Project file action called.',
			data, project: new Project(this),
			func: 'file', obj: 'Project'
		});
		return new FileObj({project: this, data});
	}
	get Users() {
		logger.debug({
			description: 'Projects users action called.',
			project: this, func: 'user', obj: 'Project'
		});
		return new Accounts({project: this});
	}
	User(data) {
		logger.debug({
			description: 'Projects user action called.',
			data, project: this, func: 'user', obj: 'Project'
		});
		return new Account({project: this, data});
	}
	get Accounts() {
		logger.debug({
			description: 'Projects account action called.',
			project: this, func: 'user', obj: 'Project'
		});
		return new Accounts({project: this});
	}
	Account(data) {
		logger.debug({
			description: 'Projects account action called.',
			data, project: this,
			func: 'user', obj: 'Project'
		});
		return new Account({project: this, data});
	}
	get Groups() {
		logger.debug({
			description: 'Projects groups action called.',
			project: this, func: 'groups', obj: 'Project'
		});
		return new Groups({project: this});
	}
	Group(data) {
		logger.debug({
			description: 'Projects group action called.',
			data, project: this,
			func: 'group', obj: 'Project'
		});
		return new Group({project: this, data});
	}
}
