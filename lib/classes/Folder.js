'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Folder = function Folder(fileData) {
	_classCallCheck(this, Folder);

	this.type = 'folder';
	if (fileData && !(0, _lodash.isString)(fileData)) {
		(0, _lodash.extend)(this, fileData);
	}
};

exports.default = Folder;
module.exports = exports['default'];