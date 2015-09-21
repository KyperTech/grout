import config from '../../src/config';
import Grout from '../../src/grout';
import Matter from 'kyper-matter';
import matter from '../../src/classes/Matter';
import App from '../../src/classes/Application';

let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;

let exampleAccount;
describe('Application model', () => {
  beforeEach(() => {
    exampleAccount = grout.Account('exampleUser');
    // console.log('exampleAccount', exampleAccount);
    mockGet = sinon.stub(grout.utils.request, 'get', function() {
     // console.log('mock get called with:', arguments);
     return new Promise((resolve) => {
       resolve({body: {}});
     });
    });
    mockPut = sinon.stub(grout.utils.request, 'put', function() {
     // console.log('mock put called with:', arguments);
     return new Promise((resolve) => {
       resolve({body: {}});
     });
    });
    mockPost = sinon.stub(grout.utils.request, 'post', function(url, postData) {
     // console.log('mock post called with:', arguments);
     return new Promise((resolve, reject) => {
       if (!postData || postData == {}) {
         reject({});
       }
       resolve({body: {}});
     });
    });
    mockDel = sinon.stub(grout.utils.request, 'del', function(url, postData) {
     // console.log('mock post called with:', arguments);
     return new Promise((resolve, reject) => {
       if (!postData || postData == {}) {
         reject({});
       }
       resolve({body: {}});
     });
    });
    mockLog = sinon.stub(grout.utils.logger, 'log', function() {
    });
    mockDebug = sinon.stub(grout.utils.logger, 'debug', function() {
    });
    mockWarn = sinon.stub(grout.utils.logger, 'warn', function() {
    });
    mockInfo = sinon.stub(grout.utils.logger, 'info', function() {
    });
    mockError = sinon.stub(grout.utils.logger, 'error', function() {
    });
  });
  afterEach(() => {
    mockGet.restore();
    mockPost.restore();
    mockPut.restore();
    mockDel.restore();
    mockLog.restore();
    mockDebug.restore();
    mockWarn.restore();
    mockInfo.restore();
    mockError.restore();
    exampleAccount = null;
  });
  describe('Get Method', () => {
    it('exists', () => {
      expect(exampleAccount).to.respondTo('get');
    });
    it('resolves', () => {
      expect(exampleAccount.get()).to.eventually.be.an('object');
    });
  });
  describe('Update Method', () => {
    it('exists', () => {
      expect(exampleAccount).to.respondTo('update');
    });
    it('resolves', () => {
      expect(exampleAccount.update()).to.eventually.be.an('object');
    });
  });
  describe('Del Method', () => {
    it('exists', () => {
      expect(exampleAccount).to.respondTo('del');
    });
    it('resolves', () => {
      expect(exampleAccount.del()).to.eventually.be.an('object');
    });
  });
});
