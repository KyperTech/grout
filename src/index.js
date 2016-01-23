import { isString, isObject } from 'lodash';
import config from './config';
import Matter from 'kyper-matter';
import Project from './classes/Project';
import Group from './classes/Group';
import matter from './classes/Matter';
import ApiAction from './classes/ApiAction'
const { logger } = matter.utils;

/** Grout Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */
export default class Grout extends Matter {
	constructor(projectName, groutOptions) {
		const name = (projectName && isString(projectName)) ? projectName : config.defaultProject;
		let options = (groutOptions && isObject(groutOptions)) ? groutOptions : config.matterSettings;
		if(isObject(projectName)){
			options = projectName;
		}
		config.applySettings(options);
		super(name, config.matterSettings);
	}

	/**
	 * @description Projects action
	 */
	get Projects() {
		const action = new ApiAction('projects');
		logger.debug({
			description: 'Projects ApiAction called.',
			action, func: 'Projects', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Project action
	 * @param {Object} projectData - Data of project with which to start action
	 * @param {String} projectData.owner - Project Owner's username (in url)
	 * @param {String} projectData.name - Name of project with which to start action
	 */
	Project(owner, name) {
		let project = new Project(owner, name);
		logger.debug({
			description: 'Project action called.', owner, name,
			project, func: 'Project', obj: 'Grout'
		});
		return project;
	}

	/**
	 * @description Accounts action
	 */
	get Accounts() {
		const action = new ApiAction('accounts');
		logger.debug({
			description: 'Account ApiAction called.',
			action, func: 'Accounts', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Accounts action
	 * @param {Object|String} accountData - Data of account with which to start action
	 * @param {String} accountData.username - Username of account with which to start action
	 * @param {String} accountData.email - Email of account with which to start action
	 */
	Account(username) {
		const action = new ApiAction(`accounts/${username}`);
		logger.debug({
			description: 'Account ApiAction called.', username,
			action, func: 'Account', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Groups action
	 */
	get Groups() {
		const action = new ApiAction('groups');
		logger.debug({
			description: 'Groups ApiAction called.',
			action, func: 'groups', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Start a new Group action
	 * @param {String} groupName - Name of group
	 */
	Group(groupName) {
		const action =  new Group(groupName);
		logger.debug({
			description: 'Group ApiAction called.', groupName,
			action, func: 'group', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Start a new Templates ApiAction
	 */
	get Templates() {
		const action = new ApiAction('templates');
		logger.debug({
			description: 'Templates ApiAction called.', action,
			func: 'Templates', obj: 'Grout'
		});
		return action;
	}

	/**
	 * @description Start a new Template action
	 * @param {String} templateName - Name of template
	 */
	Template(templateName) {
		const action = new ApiAction(`templates/${templateName}`);
		logger.debug({
			description: 'Template ApiAction called.', templateName,
			action, func: 'Template', obj: 'Grout'
		});
		return action;
	}
}
