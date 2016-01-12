import { isString, isObject } from 'lodash';
import config from './config';
import Matter from 'kyper-matter';
import Project from './classes/Project';
import * as Actions from './actions';
import matter from './classes/Matter';
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
		const action = new Actions.Projects({project: this});
		logger.debug({
			description: 'Projects Action called.',
			action, func: 'Projects', obj: 'Grout'
		});
		return action;
	}
	/**
	 * @description Projects action
	 * @param {Object} projectData - Data of project with which to start action
	 * @param {String} projectData.owner - Project Owner's username (in url)
	 * @param {String} projectData.name - Name of project with which to start action
	 */
	Project(projectData) {
		let project = new Project(projectData);
		logger.debug({
			description: 'Project action called.', projectData,
			project, func: 'Project', obj: 'Grout'
		});
		return project;
	}
	/**
	 * @description Accounts action
	 */
	get Accounts() {
		const action = new Actions.Accounts({project: this});
		logger.debug({
			description: 'Account Action called.',
			action, func: 'Accounts', obj: 'Grout'
		});
		return new Actions.Accounts({project: this});
	}
	/**
	 * @description Accounts action
	 * @param {Object|String} accountData - Data of account with which to start action
	 * @param {String} accountData.username - Username of account with which to start action
	 * @param {String} accountData.email - Email of account with which to start action
	 */
	Account(accountData) {
		const action = new Actions.Account({project: this, callData: accountData});
		logger.debug({
			description: 'Account Action called.', accountData,
			action, func: 'Account', obj: 'Grout'
		});
		return action;
	}
	/**
	 * @description Groups action
	 */
	get Groups() {
		const action = new Actions.Groups({project: this});
		logger.debug({
			description: 'Groups Action called.',
			action, func: 'groups', obj: 'Grout'
		});
		return action;
	}
	/**
	 * @description Start a new Group action
	 * @param {Object|String} groupData - Name of group or object containing name parameter
	 */
	Group(groupData) {
		const action = new Actions.Group({project:this, callData: groupData})
		logger.debug({
			description: 'Group Action called.', groupData,
			action, func: 'group', obj: 'Grout'
		});
		return new Actions.Group({project:this, callData: groupData});
	}
	/**
	 * @description Start a new Templates Action
	 */
	get Templates() {
		const action = new Actions.Templates({project: this});
		logger.debug({
			description: 'Templates Action called.', action,
			func: 'Templates', obj: 'Grout'
		});
		return action;
	}
	/**
	 * @description Start a new Template action
	 * @param {Object|String} templateData - Name of template or object containing name parameter
	 */
	Template(templateData) {
		const action = new Actions.Template({project: this, callData: templateData});
		logger.debug({
			description: 'Template Action called.', templateData,
			action, func: 'Template', obj: 'Grout'
		});
		return action;
	}
	//Alias of Projects
	get Apps() {
		return this.Projects;
	}
	//Alias of Project
	App(projectData) {
		return this.Project(projectData);
	}
	//Alias of Accounts
	get Users() {
		return this.Accounts;
	}
	//Alias of Account
	User(accountData) {
		return this.Account(accountData);
	}
}
