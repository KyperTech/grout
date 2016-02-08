'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FileSystemEntity2 = require('./FileSystemEntity');

var _FileSystemEntity3 = _interopRequireDefault(_FileSystemEntity2);

var _Matter = require('./Matter');

var _Matter2 = _interopRequireDefault(_Matter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _Matter2.default.utils.logger;

var Folder = function (_FileSystemEntity) {
	_inherits(Folder, _FileSystemEntity);

	function Folder(project, path, fileSystemEntities) {
		_classCallCheck(this, Folder);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Folder).call(this, project, path));

		_this.entityType = 'folder';
		logger.debug({
			description: 'Folder object created.', folder: _this,
			func: 'constructor', obj: 'Folder'
		});
		_this.children = fileSystemEntities;
		return _this;
	}

	_createClass(Folder, [{
		key: 'getChildren',
		value: function getChildren() {
			var _this2 = this;

			return this.get().then(function (firebaseData) {
				delete firebaseData.key;delete firebaseData.meta;
				_this2.children = firebaseData;
				return _this2.children;
			});
		}
	}, {
		key: 'addChild',
		value: function addChild(fileSystemEntity) {
			this.children.push(fileSystemEntity);
		}
	}]);

	return Folder;
}(_FileSystemEntity3.default);

exports.default = Folder;
module.exports = exports['default'];