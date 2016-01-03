'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultConfig = {
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
var instance = null;
var envName = 'prod';
var level = null;
var isLocal = false;

var Config = (function () {
	function Config() {
		_classCallCheck(this, Config);

		if (!instance) {
			instance = this;
		}
		// console.log({description: 'Config object created.', config: merge(this, defaultConfig), func: 'constructor', obj: 'Config'});
		return (0, _lodash.merge)(instance, defaultConfig);
	}

	_createClass(Config, [{
		key: 'applySettings',
		value: function applySettings(settings) {
			if (settings) {
				(0, _lodash.merge)(instance, settings);
			}
		}
	}, {
		key: 'serverUrl',
		get: function get() {
			console.log('serverurl', defaultConfig.envs[envName]);
			var url = defaultConfig.envs[envName].serverUrl;
			if (typeof window !== 'undefined' && (0, _lodash.has)(window, 'location') && (0, _lodash.has)(window.location, 'host') && window.location.host !== '') {
				var matchingEnv = (0, _lodash.find)(defaultConfig.envs, function (e) {
					return e.serverUrl === window.location.host;
				});
				if (matchingEnv) {
					url = '';
				}
			}
			return url;
		}
	}, {
		key: 'logLevel',
		set: function set(setLevel) {
			level = setLevel;
		},
		get: function get() {
			if (level) {
				return level;
			}
			return defaultConfig.envs[envName].logLevel;
		}
	}, {
		key: 'envName',
		set: function set(newEnv) {
			envName = newEnv;
			// this.envName = newEnv;
			// console.log('Environment name set:', envName);
		}
	}, {
		key: 'env',
		get: function get() {
			return defaultConfig.envs[envName];
		}
	}, {
		key: 'localServer',
		get: function get() {
			return defaultConfig.envs[envName].isLocal || isLocal;
		}
	}]);

	return Config;
})();

var config = new Config();

exports.default = config;
module.exports = exports['default'];