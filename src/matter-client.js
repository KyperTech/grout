import Firebase from 'firebase';
import AWS from 'aws-sdk';
import request from './utils/request';
import _ from 'underscore';
import config from './config';

import AppsAction from './classes/AppsAction';
import AppAction from './classes/AppAction';
import Application from './classes/Application';

let user;
let token;

if (typeof Firebase == 'undefined') {
	console.error('Firebase is required to use Matter');
}
if (typeof AWS == 'undefined') {
	console.error('AWS is required to use Matter');
}
if (typeof _ == 'undefined') {
	console.error('Underscore is required to use Matter');
}
if (typeof request == 'undefined') {
	console.error('Request is required to use Matter');
}

//Matter Client Class
class MatterClient {
	//Signup a new user
	signup(signupData) {
		return request.post(config.serverUrl + '/signup', signupData)
		.then((response) => {
		  console.log(response);
		  return response;
		})
		['catch']((errRes) => {
		  console.error('[MatterClient.signup()] Error signing up:', errRes);
		  return Promise.reject(errRes);
		});
	}

	//Login a user
	login(loginData) {
		if (!loginData || !loginData.password || !loginData.username) {
			console.error('Username/Email and Password are required to login.');
			return Promise.reject({message: 'Username/Email and Password are required to login.'});
		}
		return request.put(config.serverUrl + '/login', loginData)
		.then((response) => {
			//TODO: Save token locally
			console.log('[MatterClient.login()]: Login response: ', response);
			token = response.token;
			if (window.sessionStorage.getItem(config.tokenName) === null) {
				window.sessionStorage.setItem(config.tokenName, response.token);
				console.log('[MatterClient.login()]: token set to storage:', window.sessionStorage.getItem(config.tokenName));
			}
			return response;
		})['catch']((errRes) => {
			console.error('[MatterClient.login()] Error logging in: ', errRes);
			return Promise.reject(errRes);
		});
	}

	logout() {
		return request.put(config.serverUrl + '/logout', {
		}).then(function(response) {
		  console.log('[MatterClient.logout()] Logout successful: ', response);
		  if (typeof window != 'undefined' && typeof window.sessionStorage.getItem(config.tokenName) != null) {
				//Clear session storage
				window.sessionStorage.clear();
			}
			return response.body;
		})['catch'](function(errRes) {
			if (errRes.status && errRes.status == 401) {
				if (typeof window != 'undefined' && window.sessionStorage.getItem(config.tokenName) != null) {
					//Clear session storage
					window.sessionStorage.clear();
				}
				return;
			}
			console.error('[MatterClient.logout()] Error logging out: ', errRes);
			return Promise.reject(errRes);
		});
	}

	getCurrentUser() {
		//TODO: Check Current user variable
		return request.get(config.serverUrl + '/user', {
		}).then(function(response) {
			//TODO: Save user information locally
			console.log('[MatterClient.getCurrentUser()] Current User:', response);
			user = response;
			return user;
		})['catch'](function(errRes) {
			console.error('[MatterClient.getCurrentUser()] Error getting current user: ', errRes);
			return Promise.reject(errRes);
		});
	}

	getAuthToken() {
		if (typeof window == 'undefined' || typeof window.sessionStorage.getItem(config.tokenName) == 'undefined') {
			return null;
		}
		return window.sessionStorage.getItem(config.tokenName);
	}
	//TODO: Use getter/setter to make this not a function
	//Start a new AppsAction
	apps() {
		console.log('New AppsAction:', new AppsAction());
		return new AppsAction();
	}
	//Start a new app action
	app(appName) {
		console.log('New AppAction:', new AppAction(appName));
		return new AppAction(appName);
	}
};

export default MatterClient;
