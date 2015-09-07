import config from '../config';
import matter from '../classes/Matter';

//Actions for applications list
class AppsAction {
	constructor() {
		//Call matter with name and settings
	}
	get appsEndpoint() {
		console.log('matter.endpoint is currently:', matter.endpoint);
		return `${matter.endpoint}/apps`;
	}
	//Get applications or single application
	get() {
		console.warn('matter.utils:', matter.utils);
		return matter.utils.request.get(this.appsEndpoint).then((response) => {
			console.log('[MatterClient.apps().get()] App(s) data loaded:', response);
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.apps().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Add an application
	add(appData) {
		return matter.utils.request.post(this.appsEndpoint, appData).then((response) => {
			console.log('[MatterClient.apps().add()] Application added successfully: ', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.getApps()] Error adding application: ', errRes);
			return Promise.reject(errRes);
		});
	}
}
export default AppsAction;
