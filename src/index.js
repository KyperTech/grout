import { isString, isObject } from 'lodash';
import config from './config';
import Matter from 'kyper-matter';
import Application from './classes/Application';
import * as Actions from './actions';
/**Grout Client Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */
import matter from './classes/Matter';
export default class Grout extends Matter {
	//TODO: Use getter/setter to make this not a function
	constructor(appName, groutOptions) {
		//Call matter with tessellate
		const name = (appName && isString(appName)) ? appName : config.appName;
		let options = (groutOptions && isObject(groutOptions)) ? groutOptions : config.matterSettings;
		//handle No App name provided
		if(isObject(appName)){
			options = appName;
		}
		config.applySettings(options);
		super(name, config.matterSettings);
	}
	//Start a new Projects Action
	get Projects() {
		this.utils.logger.debug({
			description: 'Projects Action called.', action: new Actions.Projects({app: this}),
			func: 'Projects', obj: 'Grout'
		});
		return new Actions.Projects({app: this});
	}
	//Start a new Project action
	Project(projectName) {
		this.utils.logger.debug({
			description: 'Project action called.',
			projectName, project: new Application(projectName),
			func: 'Project', obj: 'Grout'
		});
		return new Application(projectName);
	}
	//Start a new Projects Action
	get Apps() {
		this.utils.logger.debug({
			description: 'Projects Action called.', action: new Actions.Projects({app: this}),
			func: 'Projects', obj: 'Grout'
		});
		return new Actions.Projects({app: this});
	}
	//Start a new Project action
	App(projectName) {
		this.utils.logger.debug({
			description: 'Project action called.',
			projectName, action: new Application(projectName),
			func: 'Projects', obj: 'Grout'
		});
		return new Application(projectName);
	}
	//Start a new Apps Action
	get Templates() {
		this.utils.logger.debug({
			description: 'Templates Action called.',
			func: 'Templates', obj: 'Grout'
		});
		return new Actions.Templates({app: this});
	}
	//Start a new App action
	Template(templateData) {
		this.utils.logger.debug({
			description: 'Template Action called.', templateData,
			template: new Actions.Template({app: this, callData: templateData}), func: 'Template', obj: 'Grout'
		});
		return new Actions.Template({app: this, callData: templateData});
	}
	//Start a new Accounts action
	get Accounts() {
		this.utils.logger.debug({
			description: 'Account Action called.',
			action: new Actions.Accounts({app: this}), func: 'users', obj: 'Grout'
		});
		return new Actions.Accounts({app: this});
	}
	//Start a new Account action
	Account(userData) {
		this.utils.logger.debug({
			description: 'Account Action called.',
			userData, user: new Actions.Account({app: this, callData: userData}),
			func: 'user', obj: 'Grout'
		});
		return new Actions.Account({app:this, callData: userData});
	}
	//ALIAS OF ACCOUNTS
	//Start a new Accounts action
	get Users() {
		this.utils.logger.debug({
			description: 'Accounts Action called.',
			action: new Actions.Accounts({app: this}), func: 'Users', obj: 'Grout'
		});
		return new Actions.Accounts({app: this});
	}
	//ALIAS OF ACCOUNT
	//Start a new Account action
	User(userData) {
		this.utils.logger.debug({
			description: 'Account Action called.',
			userData, user: new Actions.Account({app:this, callData: userData}),
			func: 'user', obj: 'Grout'
		});
		return new Actions.Account({app:this, callData: userData});
	}
	//Start a new Groups action
	get Groups() {
		this.utils.logger.debug({
			description: 'Groups Action called.',
			action: new Actions.Groups({app: this}), func: 'groups', obj: 'Grout'
		});
		return new Actions.Groups({app: this});
	}
	//Start a new Group action
	Group(groupData) {
		this.utils.logger.debug({
			description: 'Group Action called.', groupData,
			action: new Actions.Group({app:this, callData: groupData}),
			func: 'group', obj: 'Grout'
		});
		return new Actions.Group({app:this, callData: groupData});
	}
}
