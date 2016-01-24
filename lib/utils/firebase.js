'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _Matter = require('../classes/Matter');

var _Matter2 = _interopRequireDefault(_Matter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _Matter2.default.utils.logger;

var firebaseUtil = function () {
	function firebaseUtil() {
		_classCallCheck(this, firebaseUtil);
	}

	_createClass(firebaseUtil, null, [{
		key: 'pathArrayFromFbRef',

		/**
   * @description Path array that is built from Firebase Reference
   * @private
   */
		value: function pathArrayFromFbRef(ref) {
			//Handle fbUrls that have multiple levels
			var removeArray = _config2.default.fbUrl.replace('https://', '').split('/');
			removeArray.shift();
			var pathArray = ref.path.o.splice(0, removeArray.length);
			logger.info({
				description: 'Path array built.',
				pathArray: pathArray, func: 'fbRef', obj: 'Directory'
			});
			return pathArray;
		}

		/**
   * @description Path array that is built from Firebase Reference
   */

	}, {
		key: 'pathToSafePath',
		value: function pathToSafePath(path) {
			logger.debug({
				description: 'Safe path array created.',
				path: path, func: 'safePathArray', obj: 'FileSystemEntity'
			});
			return path.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '_-_');
		}

		/**
   * @description Firebase reference from relative location
   * @param {String} location - Relative location to create firebase ref for
   */

	}, {
		key: 'ref',
		value: function ref(location) {
			return new _firebase2.default(this.url(location));
		}

		/**
   * @description Path array that is built from Firebase Reference
   */

	}, {
		key: 'url',
		value: function url(location) {
			return _config2.default.fbUrl + '/files/' + location;
		}
	}]);

	return firebaseUtil;
}();
/**
 * @description Load firepad from local or global
 */

exports.default = firebaseUtil;
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'File => getFirepadLib', file: 'classes/File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.debug({
			description: 'Firepad does not currently exist.',
			func: 'fbRef', obj: 'File'
		});
		return null;
		//TODO: Correctly load firepad
		// dom.loadJs('https://cdn.firebase.com/libs/firepad/1.2.0/firepad.js');
		// if (typeof global !== 'undefined' && global.Firepad) {
		// 	return global.Firepad;
		// } else if (typeof window !== 'undefined' && window.Firepad) {
		// 	return window.Firepad;
		// } else {
		// 	logger.error({
		// 		description: 'Adding firepad did not help.',
		// 		func: 'fbRef', obj: 'File'
		// 	});
		// }
	}
}
module.exports = exports['default'];