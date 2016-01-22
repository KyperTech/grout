global.sinon = require('sinon');
global.chai = require('chai');
global.expect = require('chai').expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var Promise = require('es6-promise').Promise;
global.Promise = Promise;
