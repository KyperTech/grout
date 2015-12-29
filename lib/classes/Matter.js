'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.logger = undefined;

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _kyperMatter = require('kyper-matter');

var _kyperMatter2 = _interopRequireDefault(_kyperMatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matter = new _kyperMatter2.default(_config2.default.appName, _config2.default.matterOptions);
var _matter$utils = matter.utils;
var logger = _matter$utils.logger;
var request = _matter$utils.request;
exports.default = matter;
exports.logger = logger;
exports.request = request;