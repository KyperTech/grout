import { isString, isObject } from 'lodash';
import config from './config';
import Matter from 'kyper-matter';
import Project from './classes/Project';
import * as Actions from './actions';

/**Grout Client Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */
import matter from './classes/Matter';
const { logger } = matter.utils;
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
	//Start a new Projects Action
	get Projects() {
		let action = new Actions.Projects({project: this});
		logger.debug({
			description: 'Projects Action called.',
			action, func: 'Projects', obj: 'Grout'
		});
		return action;
	}
	//Start a new Project action
	Project(projectName) {
		let project = new Project(projectName);
		logger.debug({
			description: 'Project action called.', projectName,
			project, func: 'Project', obj: 'Grout'
		});
		return project;
	}

	//Start a new Accounts action
	get Accounts() {
		const action = new Actions.Accounts({project: this});
		logger.debug({
			description: 'Account Action called.',
			action, func: 'Accounts', obj: 'Grout'
		});
		return new Actions.Accounts({project: this});
	}
	//Start a new Account action
	Account(accountData) {
		const action = new Actions.Account({project: this, callData: accountData});
		logger.debug({
			description: 'Account Action called.', accountData,
			action, func: 'Account', obj: 'Grout'
		});
		return action;
	}
	//Start a new Groups action
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
