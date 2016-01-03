import {merge, has, find} from 'lodash';
let defaultConfig = {
	envs: {
		local: {
			serverUrl: 'http://localhost:4000',
			logLevel: 'trace'
		},
		dev: {
			serverUrl: 'http://tessellate-stage.elasticbeanstalk.com',
			logLevel: 'debug'
		},
		stage: {
			serverUrl: 'http://tessellate-stage.elasticbeanstalk.com',
			logLevel: 'info'
		},
		prod: {
			serverUrl: 'http://tessellate.elasticbeanstalk.com',
			logLevel: 'error'
		}
	},
	serverUrl: 'http://tessellate.elasticbeanstalk.com',
	tokenName: 'grout',
	fbUrl: 'https://kyper-tech.firebaseio.com/tessellate',
	appName: 'tessellate',
	aws: {
		region: 'us-east-1',
		cognito: {
			poolId: 'us-east-1:72a20ffd-c638-48b0-b234-3312b3e64b2e',
			params: {
				AuthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateUnauth_Role',
				UnauthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateAuth_Role'
			}
		}
	}
};
let instance = null;
let envName = 'prod';
let level = null;
class Config {
	constructor() {
		if (!instance) {
			instance = this;
		}
		// console.log({description: 'Config object created.', config: merge(this, defaultConfig), func: 'constructor', obj: 'Config'});
		return merge(instance, defaultConfig);
	}
	get serverUrl() {
		let url = defaultConfig.envs[envName].serverUrl;
		if (typeof window !== 'undefined' && has(window, 'location') && has(window.location, 'host') && window.location.host !== '') {
			let matchingEnv = find(defaultConfig.envs, (e) => {
				return e.serverUrl === window.location.host;
			});
			if (matchingEnv) {
				url = '';
			}
		}
		return url;
	}
	set logLevel(setLevel) {
		level = setLevel;
	}
	get logLevel() {
		if (level) {
			return level;
		}
		return defaultConfig.envs[envName].logLevel;
	}
	set envName(newEnv) {
		envName = newEnv;
		// this.envName = newEnv;
		// console.log('Environment name set:', envName);
	}
	get env() {
		return defaultConfig.envs[envName];
	}
	applySettings(settings) {
		if(settings){
			merge(instance, settings);
		}
	}
	get matterSettings() {
		return {logLevel: this.logLevel};
	}
}
let config = new Config();

//Set server to local server if developing
// if (typeof window != 'undefined' && (window.location.hostname == '' || window.location.hostname == 'localhost')) {
// 	config.serverUrl = 'http://localhost:4000';
// }
export default config;
