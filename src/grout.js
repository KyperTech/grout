import config from './config';
import Matter from 'kyper-matter';
import AppsAction from './actions/AppsAction';
import AppAction from './actions/AppAction';
import UsersAction from './actions/UsersAction';
import UserAction from './actions/UserAction';
import TemplatesAction from './actions/TemplatesAction';
import TemplateAction from './actions/TemplateAction';
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
		console.log('New AppsAction object:', new AppsAction());
		return new AppsAction();
	}
	//Start a new App action
	app(appName) {
		console.log('New AppAction:', new AppAction(appName));
		return new AppAction(appName);
	}
	//Start a new Apps Action
	get templates() {
		console.log('New TemplatesAction object:', new TemplatesAction());
		return new TemplatesAction();
	}
	//Start a new App action
	template(appName) {
		console.log('New TemplateAction:', new TemplateAction(appName));
		return new TemplateAction(appName);
	}
	//Start a new Users action
	get users() {
		return new UsersAction();
	}
	//Start a new User action
	user(username) {
		return new UserAction(username);
	}
};

export default Grout;
