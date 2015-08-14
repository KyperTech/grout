import Firebase from 'firebase';
import axios from 'axios';

const serverUrl = 'http://localhost:4000';
const fbUrl = 'https://pruvit.firebaseio.com';
const tokenName = 'matter-client';

let user;
let token;

if (typeof Firebase == 'undefined') {
	console.error('Firebase is required to use Matter');
}
if (typeof axios == 'undefined') {
	console.error('Axios is required to use Matter');
} else {
	// Add a request interceptor
	axios.interceptors.request.use(function(config) {
		// Do something before request is sent
		//TODO: Handle there already being headers
		if (typeof window != 'undefined' && window.sessionStorage.getItem(tokenName)) {
			config.headers = {'Authorization': 'Bearer ' + sessionStorage.getItem(tokenName)};
			console.log('Set auth header through interceptor');
		}
		return config;
	}, function(error) {
		// Do something with request error
		return Promise.reject(error);
	});
}
class Application {
	constructor(appData) {
		this.name = appData.name;
		this.owner = appData.owner || null;
		this.collaborators = appData.collaborators || [];
		this.createdAt = appData.createdAt;
		this.updatedAt = appData.updatedAt;
		this.frontend = appData.frontend || {};
		this.backend = appData.backend || {};
		if (Firebase) {
			this.fbRef = new Firebase(fbUrl + appData.name);
		}
	}
	getStructure() {
		//TODO:Get files list and convert to structure
	}
	getFiles() {
		//TODO:Get files list from S3
	}
	addStorage() {
		//TODO:Add storage bucket
	}
	applyTemplate() {

	}
}
class AppsAction {
	constructor(appName) {
		this.isList = true;
		this.endpoint = serverUrl + '/apps';
		if (appName) {
			this.name = appName;
			this.isList = false;
		}
	}

	get() {
		if (!this.isList) {
			this.endpoint += `/${this.name}`;
		}
		let self = this;
		return axios.get(this.endpoint).then(function(response) {
			console.log('[Matter.apps().get()] App(s) data loaded:', response.data);
			if (!self.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[Matter.apps().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}

	add(appData) {
		return axios.post(this.endpoint, appData).then(function(response) {
			console.log('[Matter.apps().add()] Apps:', response.data);
			if (!apps.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[Matter.getApps()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}

	update() {
		if (this.isList) {
			console.error('Update action can only be applied to a specific application.');
		}
	}

	del() {
		if (this.isList) {
			console.error('Delete action can only be applied to a specific application.');
		}
	}
}
class MatterClient {
	constructor() {
	}
	//Signup a new user
	signup(signupData) {
		return axios.post(serverUrl + '/signup', signupData)
		.then(function(response) {
		  console.log(response);
		  return response.data;
		})
		['catch'](function(errRes) {
		  console.error('[Matter.signup()] Error signing up:', errRes);
		  return Promise.reject(errRes);
		});
	}
	//Login a user
	login(loginData) {
		if (!loginData || !loginData.password || !loginData.username) {
			console.error('Username/Email and Password are required to login');
		}
		return axios.put(serverUrl + '/login', loginData)
		.then(function(response) {
			//TODO: Save token locally
			console.log(response);
			token = response.data.token;
			if (window.sessionStorage.getItem(tokenName) === null) {
				window.sessionStorage.setItem(tokenName, response.data.token);
				console.log('token set to storage:', window.sessionStorage.getItem(tokenName));
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[Matter.login()] Error logging in: ', errRes);
			return Promise.reject(errRes);
		});
	}

	logout() {
		return axios.put(serverUrl + '/logout', {
		}).then(function(response) {
		  console.log('[Matter.logout()] Logout successful: ', response);
		  if (typeof window != 'undefined' && typeof window.sessionStorage.getItem(tokenName) != null) {
				//Clear session storage
				window.sessionStorage.clear();
			}
		  return response.body;
		})['catch'](function(errRes) {
		  console.error('[Matter.logout()] Error logging out: ', errRes);
		  return Promise.reject(errRes);
		});
	}

	getCurrentUser() {
		//TODO: Check Current user variable
		return axios.get(serverUrl + '/user', {
		}).then(function(response) {
			//TODO: Save user information locally
			console.log('[Matter.getCurrentUser()] Current User:', response.data);
			user = response.data;
			return user;
		})['catch'](function(errRes) {
			console.error('[Matter.getCurrentUser()] Error getting current user: ', errRes);
			return Promise.reject(errRes);
		});
	}

	getAuthToken() {
		//TODO: Load token from storage
		if (typeof window == 'undefined' || typeof window.sessionStorage.getItem(tokenName) == 'undefined') {
			return null;
		}
		return window.sessionStorage.getItem(tokenName);
	}

	apps(appName) {
		console.log('new apps:', new AppsAction(appName));
		return new AppsAction(appName);
	}

};

class File {
	constructor(fileData) {
		this.type = 'file';
		this.path = fileData.path;
		let pathArray = this.path.split('/');
		this.name = pathArray[pathArray.length - 1];
		let re = /(?:\.([^.]+))?$/;
		this.ext = re.exec(this.name)[1];
		console.log('new file constructed:', this);
	}
	getTypes() {
		//Get content type and file type from extension
	}
	open() {
		//TODO:Return file contents
	}
	openWithFirepad(divId) {
		//TODO:Create new Firepad instance within div
	}
	getDefaultContent() {

	}
}

class Folder {
	constructor(fileData) {
		this.type = 'folder';
		//TODO: Add path
	}
}

function childStructureFromArray() {
}
function buildStructureObject() {
}
function combineLikeObjs() {
}

export default MatterClient;
