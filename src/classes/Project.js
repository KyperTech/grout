
import config from '../config';
import { isString } from 'lodash';
import matter from './Matter';
import ApiAction from './ApiAction';
import Group from './Group';
import Directory from './Directory';
import Folder from './Folder';
import File from './File';
import firebase from '../utils/firebase';

const {request, logger} = matter.utils;

export default class Project extends ApiAction {
	constructor(owner, name) {
		if (!owner) {
			throw new Error('Owner is required to create a project');
		}
		if (!name) {
			throw new Error('Name is required to create a project');
		}
		super(`projects/${name}`, { owner, name })
		this.owner = owner;
		this.name = name;
		logger.debug({
			description: 'Project object created.', project: this,
			func: 'constructor', obj: 'Project'
		});
	}

	/**
	 * @description Generate Firebase reference based on project url
	 */
	get fbRef() {
		return this.owner ?  firebase.ref(`${this.owner}/${this.name}`) : firebase.ref(`${this.name}`);
	}

	/**
	 * @description Add static file hosting storage to Project (currrently though AWS S3)
	 */
	addStorage() {
		logger.debug({
			description: 'Project add storage called.', project: this,
			func: 'addStorage', obj: 'Project'
		});
		return request.post(`${this.url}/storage`, {}).then(response => {
			logger.info({
				description: 'Storage successfully added to project.',
				response, func: 'addStorage', obj: 'Project'
			});
			this.frontend = response.frontend ? response.frontend : {};
			return this;
		})['catch'](error => {
			logger.error({
				description: 'Error adding storage to project.',
				error, func: 'addStorage', obj: 'Project'
			});
			return Promise.reject(error.response ? error.response.text : error);
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
		if (!template) {
			logger.error({
				description: 'Template name is required to apply a template.',
				func: 'applyTemplate', obj: 'Project'
			});
			return Promise.reject('Template name is required to apply a template');
		}
		return request.post(this.url, { template }).then(response => {
			logger.info({
				description: 'Template successfully applied to project.',
				response, project: this,
				func: 'applyTemplate', obj: 'Project'
			});
			return this;
		})['catch'](error => {
			logger.error({
				description: 'Error applying template to project.', project: this,
				error, func: 'applyTemplate', obj: 'Project'
			});
			return Promise.reject(error.response ? error.response.text : error);
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
		if (isString(collabs)) {
			this.collaborators =  collabs.replace(' ').split(',');
		}
		logger.log({
			description: 'Collaborators list added to project, calling update.',
			project: this, func: 'addCollaborators', obj: 'Project'
		});
		return this.update(this);
	}

	/**
	 * @description Project's Directory
	 */
	get Directory() {
		logger.debug({
			description: 'Project files action called.',
			project: this, func: 'files', obj: 'Project'
		});
		return new Directory(this);
	}

	/**
	 * @description File within project
	 */
	File(fileData) {
		logger.debug({
			description: 'Projects file action called.',
			fileData, project: this,
			func: 'file', obj: 'Project'
		});
		return new File(this, fileData);
	}

	/**
	 * @description Project's Accounts
	 */
	get Accounts() {
		logger.debug({
			description: 'Projects account action called.',
			project: this, func: 'user', obj: 'Project'
		});
		return new ApiAction('accounts', this);
	}

	/**
	 * @description Account with project
	 */
	Account(username) {
		logger.debug({
			description: 'Projects account action called.',
			username, project: this, func: 'user', obj: 'Project'
		});
		return new ApiAction(`accounts/${username}`, this);
	}

	/**
	 * @description Project's Groups
	 */
	get Groups() {
		logger.debug({
			description: 'Projects groups action called.',
			project: this, func: 'groups', obj: 'Project'
		});
		return new ApiAction('groups', this);
	}

	/**
	 * @description Group within Project
	 */
	Group(groupName) {
		logger.debug({
			description: 'Projects group action called.',
			groupName, project: this, func: 'group', obj: 'Project'
		});
		return new Group(groupName, this);
	}
}
