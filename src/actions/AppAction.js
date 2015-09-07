import config from '../config';
import Application from '../classes/Application';
import AWS from 'aws-sdk';
import matter from '../classes/Matter';

//Actions for specific application
class AppAction {
	constructor(appName) {
		//Call matter with name and settings
		if (appName) {
			this.name = appName;
		} else {
			console.error('Application name is required to start an AppAction');
			throw new Error('Application name is required to start an AppAction');
		}
	}
	get appEndpoint() {
		return `${matter.endpoint}/apps/${this.name}`;
	}
	//Get applications or single application
	get() {
		return matter.utils.request.get(this.appEndpoint).then((response) => {
			console.log('[MatterClient.app().get()] App(s) data loaded:', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.app().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Update an application
	update(appData) {
		return matter.utils.request.put(this.appEndpoint, appData).then((response) => {
			console.log('[MatterClient.apps().update()] App:', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.apps().update()] Error updating app: ', errRes);
			return Promise.reject(errRes);
		});
	}
	//Delete an application
	del(appData) {
		return matter.utils.request.delete(this.appEndpoint, appData).then((response) => {
			console.log('[MatterClient.apps().del()] Apps:', response);
			return new Application(response);
		})['catch']((errRes) => {
			console.error('[MatterClient.apps().del()] Error deleting app: ', errRes);
			return Promise.reject(errRes);
		});
	}
	getFiles() {
		return this.get().then((app) => {
			app.getFiles().then((filesArray)=> {
				return filesArray;
			})['catch']((err) => {
				console.error('[MatterClient.app().getFiles()] Error getting application files: ', err);
				return Promise.reject(err);
			});
		})['catch']((err) => {
			console.error('[MatterClient.app().getFiles()] Error getting application: ', err);
			return Promise.reject(err);
		});
	}

	getStructure() {
		return this.get().then((app) => {
			return app.getStructure().then((structure)=> {
				console.log('Structure loaded: ', structure);
				return structure;
			})['catch']((err) => {
				console.error('[MatterClient.app().getStructure()] Error getting application structure: ', err);
				return Promise.reject(err);
			});
		})['catch']((err) => {
			console.error('[MatterClient.app().getStructure()] Error getting application: ', err);
			return Promise.reject(err);
		});
	}
}

export default AppAction;
