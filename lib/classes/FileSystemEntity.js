'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _lodash = require('lodash');

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _Matter2.default.utils.logger;

var FileSystemEntity = function () {
	function FileSystemEntity(project, path, name) {
		_classCallCheck(this, FileSystemEntity);

		logger.debug({
			description: 'FileSystemEntity constructor called with project ' + project + ', path: ' + path + ', and name: ' + name,
			func: 'constructor', obj: 'FileSystemEntity'
		});
		if (!project || !path) {
			logger.error({
				description: 'FileSystemEntity that includes path and project is needed to create a FileSystemEntity action.',
				func: 'constructor', obj: 'FileSystemEntity'
			});
			throw new Error('FileSystemEntity with path and project is needed to create file action.');
		}
		this.project = project;
		if (path.indexOf('/') === 0) {
			path = path.slice(1);
		}
		this.path = path;
		this.name = name || (0, _lodash.last)(path.split('/'));
		logger.debug({
			description: 'FileSystemEntity object constructed.', entity: this,
			func: 'constructor', obj: 'FileSystemEntity'
		});
	}

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
			fbData.meta = (0, _lodash.omitBy)(fbData.meta, _lodash.isUndefined);
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

		/**
   * @description FileSystemEntity's Firebase reference
   * @return {Object} Firebase reference
   */
		get: function get() {
			if (!this.project || !this.project.name) {
				logger.error({
					description: 'App information needed to generate fbUrl for FileSystemEntity.',
					entity: this, func: 'fbUrl', obj: 'FileSystemEntity'
				});
				throw new Error('App information needed to generate fbUrl for FileSystemEntity.');
			}
			var url = [this.project.fbUrl, FileSystemEntity.pathToSafePath(this.path)].join('/');
			logger.debug({
				description: 'Fb ref generated.',
				url: url, func: 'fbRef', obj: 'FileSystemEntity'
			});
			return new _firebase2.default(url);
		}
	}], [{
		key: 'pathToSafePath',
		value: function pathToSafePath(path) {
			logger.debug({
				description: 'Safe path array created.',
				path: path, func: 'safePathArray', obj: 'FileSystemEntity'
			});
			return path.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '_-_');
		}
	}]);

	return FileSystemEntity;
}();

exports.default = FileSystemEntity;
module.exports = exports['default'];