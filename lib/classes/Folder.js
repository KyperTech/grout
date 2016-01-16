'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _Files = require('./Files');

var _Files2 = _interopRequireDefault(_Files);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _Matter2.default.utils.logger;

var Folder = function () {
	function Folder(folderData) {
		_classCallCheck(this, Folder);

		this.type = 'folder';
		if (!folderData || !(0, _lodash.isString)(folderData) && !isObject(folderData)) {
			throw new Error('Folder name or path required.');
		}
		if ((0, _lodash.isString)(folderData)) {
			return this.path = folderData;
		}
		(0, _lodash.extend)(this, folderData);
	}

	_createClass(Folder, [{
		key: 'FilesList',
		value: function FilesList() {
			return new _Files2.default({ project: this.project });
		}
	}, {
		key: 'save',
		value: function save() {
			return this.add();
		}
	}, {
		key: 'remove',
		value: function remove() {
			return this.Files.remove(this);
		}
	}, {
		key: 'add',
		value: function add() {
			return this.Files.add(this);
		}
	}, {
		key: 'pathArrayFromRef',
		get: function get() {
			if (!this.fbRef) {
				logger.error({
					description: 'Folder fbRef is required to get path array.', file: this,
					func: 'pathArrayFromRef', obj: 'Folder'
				});
			}
			return this.fbRef.path.o;
		}
	}, {
		key: 'fileType',
		get: function get() {
			if (this.ext == 'js') {
				return 'javascript';
			} else {
				return this.ext;
			}
		}
	}, {
		key: 'ext',
		get: function get() {
			var re = /(?:\.([^.]+))?$/;
			return re.exec(this.name)[1];
		}
	}, {
		key: 'safePathArray',
		get: function get() {
			var safeArray = this.pathArray.map(function (loc) {
				//Replace periods with colons and other unsafe chars as --
				return loc.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '--');
			});
			logger.debug({
				description: 'Safe path array created.',
				safeArray: safeArray, func: 'safePathArray', obj: 'Folder'
			});
			return safeArray;
		}
	}, {
		key: 'safePath',
		get: function get() {
			var safePathArray = this.safePathArray;

			if (safePathArray.length === 1) {
				return safePathArray[0];
			}
			return safePathArray.join('/');
		}
	}, {
		key: 'fbUrl',
		get: function get() {
			var files = new _Files2.default(this);
			return '' + this.Files.fbUrl;
		}
	}, {
		key: 'fbRef',
		get: function get() {
			var ref = new _Files2.default(this).fbRef;
			logger.debug({
				description: 'fbRef generated.', ref: ref,
				func: 'fbRef', obj: 'Folder'
			});
			return ref;
		}
	}]);

	return Folder;
}();

exports.default = Folder;
module.exports = exports['default'];