import {merge, has, find} from 'lodash';
let defaultConfig = {
	envs: {
		local: {
			isLocal: true,
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
	defaultServerUrl:'http://tessellate.elasticbeanstalk.com',
	tokenName: 'grout',
	fbUrl: 'https://kyper-tech.firebaseio.com/tessellate',
	defaultProject: 'tessellate',
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
let isLocal = false;
class Config {
	constructor() {
		if (!instance) {
			instance = this;
		}
		// console.log({description: 'Config object created.', config: merge(this, defaultConfig), func: 'constructor', obj: 'Config'});
		return merge(instance, defaultConfig);
	}
	get serverUrl() {
		let url = defaultConfig.envs[envName].serverUrl || defaultConfig.defaultServerUrl;
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
	}
	get env() {
		if(defaultConfig.envs[envName]){
			return defaultConfig.envs[envName];
		}
	}
	get localServer(){
		return defaultConfig.envs[envName].isLocal || isLocal;
	}
	applySettings(settings) {
		if(settings){
			merge(instance, settings);
		}
	}
	get matterSettings() {
		return { serverUrl: this.serverUrl, logLevel: this.logLevel, localServer: this.localServer};
	}
}
let config = new Config();

export default config;
