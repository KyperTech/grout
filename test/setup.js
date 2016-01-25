var chai = global.chai = require('chai');
global.expect = require('chai').expect;
var sinon = global.sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(sinon);
var Promise = require('es6-promise').Promise;
global.Promise = Promise;
