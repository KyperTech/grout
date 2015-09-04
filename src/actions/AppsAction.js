import config from '../config';
import Matter from 'kyper-matter';

//Actions for applications list
class AppsAction extends Matter {
	constructor() {
		//Call matter with name and settings
		super(config.appName, config.matterOptions);
	}
	get appsEndpoint() {
		return `${this.endpoint}/apps`;
	}
	//Get applications or single application
	get() {
		console.warn('this.utils:', this.endpoint);
		return this.utils.request.get(this.appsEndpoint).then((response) => {
			console.log('[MatterClient.apps().get()] App(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.apps().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Add an application
	add(appData) {
		return this.utils.request.post(this.appsEndpoint, appData).then((response) => {
			console.log('[MatterClient.apps().add()] Application added successfully: ', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.getApps()] Error adding application: ', errRes);
			return Promise.reject(errRes);
		});
	}
}
export default AppsAction;
