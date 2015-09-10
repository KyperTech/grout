import config from './config';
import Matter from 'kyper-matter';
import AppsAction from './actions/AppsAction';
import App from './classes/Application';
import AccountsAction from './actions/AccountsAction';
import Account from './classes/Account';
import GroupsAction from './actions/GroupsAction';
import Group from './classes/Group';
import Directories from './actions/DirectoriesAction';
import Directory from './classes/Directory';
import TemplatesAction from './actions/TemplatesAction';
import Template from './classes/Template';

/**Grout Client Class
 * @ description Extending matter provides token storage and login/logout/signup capabilities
 */
class Grout extends Matter {
	//TODO: Use getter/setter to make this not a function
	constructor() {
		//Call matter with tessellate
		super(config.appName, config.matterOptions);
	}
	//Start a new Apps Action
	get apps() {
		this.utils.logger.debug({description: 'Apps Action called.', action: new AppsAction(), func: 'apps', obj: 'Grout'});
		return new AppsAction();
	}
	//Start a new App action
	app(appName) {
		this.utils.logger.debug({description: 'Templates Action called.', appName: appName, template: new App(appName), func: 'app', obj: 'Grout'});
		return new App(appName);
	}
	//Start a new Apps Action
	get templates() {
		this.utils.logger.debug({description: 'Templates Action called.', action: new TemplatesAction(), func: 'templates', obj: 'Grout'});
		return new TemplatesAction();
	}
	//Start a new App action
	template(templateData) {
		this.utils.logger.debug({description: 'Template Action called.', templateData: templateData, template: new Template(templateData), func: 'template', obj: 'Grout'});
		return new Template(templateData);
	}
	//Start a new Accounts action
	get accounts() {
		this.utils.logger.debug({description: 'Account Action called.', action: new AccountsAction(), func: 'users', obj: 'Grout'});
		return new AccountsAction({app: this});
	}
	//Start a new Account action
	account(userData) {
		this.utils.logger.debug({description: 'Account Action called.', userData: userData, user: new Account(userData), func: 'user', obj: 'Grout'});
		return new Account(userData);
	}
	//Start a new Accounts action
	get users() {
		this.utils.logger.debug({description: 'Accounts Action called.', action: new AccountsAction(), func: 'users', obj: 'Grout'});
		return new AccountsAction({app: this});
	}
	//Start a new Account action
	user(userData) {
		this.utils.logger.debug({description: 'Account Action called.', userData: userData, user: new Account(userData), func: 'user', obj: 'Grout'});
		return new Account(userData);
	}
	//Start a new Groups action
	get groups() {
		this.utils.logger.debug({description: 'Groups Action called.', action: new GroupsAction(), func: 'groups', obj: 'Grout'});
		return new GroupsAction();
	}
	//Start a new Group action
	group(groupData) {
		this.utils.logger.debug({description: 'Group Action called.', groupData: groupData, action: new Group({app: this, groupData: groupData}), func: 'group', obj: 'Grout'});
		return new Group(groupData);
	}
	//Start a new Directories action
	get directories() {
		this.utils.logger.debug({description: 'Directories Action called.', action: new DirectoriesAction(), func: 'directories', obj: 'Grout'});
		return new DirectoriesAction();
	}
	//Start a new Group action
	directory(directoryData) {
		this.utils.logger.debug({description: 'Directory Action called.', directoryData: directoryData, action: new Directory(directoryData), func: 'directory', obj: 'Grout'});
		return new Directory(directoryData);
	}

};

export default Grout;
