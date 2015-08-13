import Firebase from 'firebase';
import axios from 'axios';

const serverUrl = 'http://hypercube.elasticbeanstalk.com';
const fbUrl = 'https://pruvit.firebaseio.com';
const tokenName = 'matter-client';

let user;
let token;

if (typeof Firebase == 'undefined') {
	console.error('Firebase is required to use file structure functionality of matter-client');
}
//TODO: Replace dependency on axios with vanilla solution
if (typeof axios == 'undefined') {
	console.error('Axios is required to use Matter');
} else {
	// Add a request interceptor
	axios.interceptors.request.use(function(config) {
		// Do something before request is sent
		//TODO: Handle there already being headers
		if (localStorage.getItem(tokenName)) {
			config.headers = {'Authorization': 'Bearer ' + localStorage.getItem(tokenName)};
			console.log('Set auth header through interceptor');
		}
		return config;
	}, function(error) {
		// Do something with request error
		return Promise.reject(error);
	});
}

class MatterClient {
	signup(signupData) {
		return axios.post(serverUrl + '/signup', signupData)
		.then(function(response) {
		  console.log(response);
		})
		['catch'](function(errRes) {
		  console.error('[signup()] Error signing up:', errRes);
		  return errRes;
		});
	}

	login(loginData) {
		if (!loginData || !loginData.password || !loginData.username) {
			console.error('Username/Email and Password are required to login');
		}
		return axios.put(serverUrl + '/login', loginData)
		.then(function(response) {
			//TODO: Save token locally
			console.log(response);
			token = response.data.token;
			if (window.localStorage.getItem(tokenName) === null) {
				window.localStorage.setItem(tokenName, response.data.token);
				console.log('token set to storage:', window.localStorage.getItem(tokenName));
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[login()] Error logging in: ', errRes);
			return errRes;
		});
	}

	logout() {
		return axios.put(serverUrl + '/logout', {
		}).then(function(response) {
		  console.log('[logout()] Logout successful: ', response);
		  if (typeof window != 'undefined' && typeof window.localStorage.getItem(tokenName) != null) {
				window.localStorage.setItem(tokenName, null);
			}
		  return response.body;
		})['catch'](function(errRes) {
		  console.error('[logout()] Error logging out: ', errRes);
		  return errRes;
		});
	}

	getCurrentUser() {
		//TODO: Check Current user variable
		return axios.get(serverUrl + '/user', {
		}).then(function(response) {
			//TODO: Save user information locally
			console.log('[getCurrentUser()] Current User:', response.data);
			user = response.data;
			return user;
		})['catch'](function(errRes) {
			console.error('[getCurrentUser()] Error getting current user: ', errRes);
			return errRes;
		});
	}

	getAuthToken() {
		//TODO: Load token from storage
		if (typeof window == 'undefined' || typeof window.localStorage.getItem(tokenName) == 'undefined') {
			return null;
		}
		return window.localStorage.getItem(tokenName);
	}

	getApps() {
		//TODO:Set authentication header
		return axios.get(serverUrl + '/apps', {
		}).then(function(response) {
		  console.log('[getApps()] Apps:', response.data);
		  return response.data;
		})['catch'](function(errRes) {
		  console.error('[getApps()] Error getting apps list: ', errRes);
			return errRes;
		});
	}

};

export default MatterClient;

