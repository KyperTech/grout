import { isObject, isString } from 'lodash';
import config from '../config';
import matter from './Matter';
import ApiAction from './ApiAction';
import Group from './Group';
import Directory from './Directory';
import FileObj from './File';
import firebase from '../utils/firebase';

const { request, logger } = matter.utils;

export default class Project extends ApiAction {
	constructor(name, owner) {
		if (!name) {
			throw new Error('Name and Owner are required to create a project');
		}
		if(isObject(name)){
			if(!name.owner) throw new Error('Owner is required to create a project');
			if(!name.name) throw new Error('Name is required to create a project');
			owner = name.owner;
			name = name.name;
		}
		if (!owner) {
			throw new Error('Owner is required to create a project');
		}
		const endpoint = `projects/${owner}/${name}`;
		super(endpoint, { owner, name });
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
	get fbUrl() {
		return this.owner ?  firebase.url(`${this.owner}/${this.name}`) : firebase.url(`${this.name}`);
	}

	/**
	 * @description Generate Firebase reference based on project url
	 */
	get fbRef() {
		return this.owner ?  firebase.ref(`${this.owner}/${this.name}`) : firebase.ref(`${this.name}`);
	}

	/**
	 * @description Start an Api action using project
	 */
	apiAction(actionEndpoint) {
		return new ApiAction(actionEndpoint, this);
	}

	/**
	 * @description Add static file hosting storage to Project (currrently though AWS S3)
	 */
	addStorage() {
		logger.debug({
			description: 'Project add storage called.', project: this,
			func: 'addStorage', obj: 'Project'
		});
		return request.post(`${this.url}/storage`, {});
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
		return request.post(this.url, { template });
	}

	/**
	 * @description Add a collaborator to Project
	 * @param {String} username - Username of user to add as collaborator
	 * @param {Array} rights - Read/Write rights of collaborator
	 */
	addCollaborator(username, rights) {
		logger.debug({
			description: 'Add collaborator called', username,
			project: this, func: 'addCollaborator', obj: 'Project'
		});
		if(!username || !isString(username)) {
			logger.error({
				description: 'Username required to add collaborator',
				func: 'addCollaborator', obj: 'Project'
			});
			return Promise.reject({ message: 'Username required to add collaborator' });
		}
		const endpointUrl = `${config.serverUrl}/projects/${this.owner}/${this.name}/collaborators/${username}`;
		return request.put(endpointUrl, rights || {});
	}

	/**
	 * @description Remove a collaborator from a Project
	 * @param {String} username - Username of user to add as collaborator
	 * @param {Array} rights - Read/Write rights of collaborator
	 */
	removeCollaborator(username, rights) {
		logger.debug({
			description: 'Remove collaborator called', username,
			project: this, func: 'removeCollaborator', obj: 'Project'
		});
		if(!username || !isString(username)) {
			logger.error({
				description: 'Username required to add collaborator',
				func: 'removeCollaborator', obj: 'Project'
			});
			return Promise.reject({ message: 'Username required to add collaborator' });
		}
		const endpointUrl = `${config.serverUrl}/projects/${this.owner}/${this.name}/collaborators/${username}`;
		return request.del(endpointUrl);
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
	File(path) {
		const file = new FileObj(this, path);
		logger.debug({
			description: 'Projects file action called.',
			path, project: this, file,
			func: 'File', obj: 'Project'
		});
		return file;
	}

	/**
	 * @description Project's Accounts
	 */
	get Accounts() {
		logger.debug({
			description: 'Projects account action called.',
			project: this, func: 'user', obj: 'Project'
		});
		return this.apiAction('accounts');
	}

	/**
	 * @description Account with project
	 */
	Account(username) {
		logger.debug({
			description: 'Projects account action called.',
			username, project: this, func: 'user', obj: 'Project'
		});
		return this.apiAction(`accounts/${username}`);
	}

	/**
	 * @description Project's Groups
	 */
	get Groups() {
		logger.debug({
			description: 'Projects groups action called.',
			project: this, func: 'groups', obj: 'Project'
		});
		return this.apiAction('groups');
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
