'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

var _last = require('lodash/last');

var _last2 = _interopRequireDefault(_last);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _firebase3 = require('../utils/firebase');

var _firebase4 = _interopRequireDefault(_firebase3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _Matter2.default.utils.logger;

var FileSystemEntity = function () {
	function FileSystemEntity(project, path) {
		_classCallCheck(this, FileSystemEntity);

		logger.debug({
			description: 'FileSystemEntity constructor called.', project: project, path: path,
			func: 'constructor', obj: 'FileSystemEntity'
		});
		if (!project || !(0, _isString2.default)(path)) {
			logger.error({
				description: 'FileSystemEntity that includes path and project is needed to create a FileSystemEntity action.',
				func: 'constructor', obj: 'FileSystemEntity'
			});
			throw new Error('FileSystemEntity with path and project is needed to create file action.');
		}
		this.project = project;
		this.path = path.indexOf('/') === 0 ? path.slice(1) : path;
		this.name = (0, _last2.default)(path.split('/'));
		logger.debug({
			description: 'FileSystemEntity object constructed.', entity: this,
			func: 'constructor', obj: 'FileSystemEntity'
		});
	}

	/**
  * @description FileSystemEntity's Firebase reference
  * @return {Object} Firebase reference
  */

	_createClass(FileSystemEntity, [{
		key: 'get',

		/**
   * @description Get a file's content and meta data from default location (Firebase)
   */
		value: function get() {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_this.fbRef.once('value', function (fileSnap) {
					if (!fileSnap.val()) {
						reject('no firebase value found');
					}
					resolve(fileSnap.val());
				});
			});
		}

		/**
   * @description Open a file from default location (Firebase) (Alias for get)
   */

	}, {
		key: 'open',
		value: function open() {
			return this.get();
		}

		/**
   * @description Remove a file from default location (Firebase)
   */

	}, {
		key: 'remove',
		value: function remove() {
			return this.removeFromFb();
		}

		//TODO: move file

	}, {
		key: 'move',
		value: function move() {
			return null;
		}

		/**
   * @description Add folder to project
   * @return {Promise}
   */

	}, {
		key: 'save',
		value: function save() {
			return this.addToFb();
		}

		/**
   * @description Add file to Firebase located at file's fbRef
   */

	}, {
		key: 'addToFb',
		value: function addToFb() {
			logger.debug({
				description: 'addToFb called.', entity: this,
				func: 'addToFb', obj: 'FileSystemEntity'
			});
			var fbRef = this.fbRef;
			var path = this.path;
			var name = this.name;
			var entityType = this.entityType;
			var fileType = this.fileType;
			var content = this.content;

			var fbData = { meta: { path: path, name: name, entityType: entityType, fileType: fileType } };
			fbData.meta = (0, _omitBy2.default)(fbData.meta, _isUndefined2.default);
			if (content) {
				fbData.original = content;
			}
			return new Promise(function (resolve, reject) {
				fbRef.set(fbData, function (error) {
					if (!error) {
						logger.info({
							description: 'FileSystemEntity successfully added to Firebase.',
							func: 'addToFb', obj: 'FileSystemEntity'
						});
						resolve(fbData);
					} else {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: error, func: 'addToFb', obj: 'FileSystemEntity'
						});
						reject(error);
					}
				});
			});
		}

		/**
   * @description Remove file from Firebase
   */

	}, {
		key: 'removeFromFb',
		value: function removeFromFb() {
			var _this2 = this;

			logger.debug({
				description: 'Remove FileSystemEntity from Firebase called.',
				func: 'removeFromFb', obj: 'FileSystemEntity'
			});
			return new Promise(function (resolve, reject) {
				_this2.fbRef.remove(function (error) {
					if (error) {
						logger.error({
							description: 'Error creating file on Firebase.',
							error: error, func: 'removeFromFb', obj: 'FileSystemEntity'
						});
						return reject(error);
					}
					logger.info({
						description: 'FileSystemEntity successfully removed from Firebase.',
						entity: _this2, func: 'removeFromFb', obj: 'FileSystemEntity'
					});
					resolve(_this2);
				});
			});
		}
	}, {
		key: 'fbRef',
		get: function get() {
			if (!this.project || !this.project.name) {
				logger.error({
					description: 'App information needed to generate fbUrl for FileSystemEntity.',
					entity: this, func: 'fbUrl', obj: 'FileSystemEntity'
				});
				throw new Error('App information needed to generate fbUrl for FileSystemEntity.');
			}
			var url = [this.project.fbUrl, _firebase4.default.pathToSafePath(this.path)].join('/');
			logger.debug({
				description: 'Fb ref generated.',
				url: url, func: 'fbRef', obj: 'FileSystemEntity'
			});
			return new _firebase2.default(url);
		}
	}]);

	return FileSystemEntity;
}();

exports.default = FileSystemEntity;
module.exports = exports['default'];