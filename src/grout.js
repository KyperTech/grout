import config from './config';
import Matter from 'kyper-matter';
import AppsAction from './actions/AppsAction';
import App from './classes/Application';
import UsersAction from './actions/UsersAction';
import User from './classes/User';
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
	//Start a new Users action
	get users() {
		this.utils.logger.debug({description: 'Users Action called.', action: new UsersAction(), func: 'users', obj: 'Grout'});
		return new UsersAction({app: this});
	}
	//Start a new User action
	user(userData) {
		this.utils.logger.debug({description: 'User Action called.', userData: userData, user: new User(userData), func: 'user', obj: 'Grout'});
		return new User(userData);
	}
	//Start a new Groups action
	get groups() {
		this.utils.logger.debug({description: 'Groups Action called.', action: new GroupsAction({app: this}), func: 'groups', obj: 'Grout'});
		return new GroupsAction({app: this});
	}
	//Start a new Group action
	group(groupData) {
		this.utils.logger.debug({description: 'Group Action called.', groupData: groupData, action: new Group({app: this, groupData: groupData}), func: 'group', obj: 'Grout'});
		return new Group({app: this, groupData: groupData});
	}
	//Start a new Directories action
	get directories() {
		this.utils.logger.debug({description: 'Directories Action called.', action: new DirectoriesAction({app: this}), func: 'directories', obj: 'Grout'});
		return new DirectoriesAction({app: this});
	}
	//Start a new Group action
	directory(directoryData) {
		this.utils.logger.debug({description: 'Directory Action called.', directoryData: directoryData, action: new Directory(directoryData), func: 'directory', obj: 'Grout'});
		return new Directory(directoryData);
	}

};

export default Grout;
