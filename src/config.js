import merge from 'lodash/object/merge';
import has from 'lodash/object/has';
import matter from './helpers/matter';

let defaultConfig = {
	serverUrl: 'http://tessellate.elasticbeanstalk.com',
	tokenName: 'grout',
	fbUrl: 'https://kyper-tech.firebaseio.com/tessellate',
	appName: 'tessellate',
	matterOptions: {
		localServer: false
	},
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
//Set server to local server if developing
// if (typeof window != 'undefined' && (window.location.hostname == '' || window.location.hostname == 'localhost')) {
// 	config.serverUrl = 'http://localhost:4000';
// }
let configInstance = null;
let envName = 'prod';
class Config {
	constructor() {
		if (!configInstance) {
      configInstance = this;
    }
		// console.log({description: 'Config object created.', config: merge(this, defaultConfig), func: 'constructor', obj: 'Config'});
		return merge(configInstance, defaultConfig);
	}
}
let config = new Config();

export default config;
