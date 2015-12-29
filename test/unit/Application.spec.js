import Grout from '../../src';
import Matter from 'kyper-matter';
import App from '../../src/classes/Application';
import config from '../../src/config';
let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;

let exampleApp;
describe('Application model', () => {
  beforeEach(() => {
    exampleApp = grout.App('exampleApp');
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
    mockLog.restore();
    mockDebug.restore();
    mockWarn.restore();
    mockInfo.restore();
    mockError.restore();
  });
  it('exists', () => {
    expect(exampleApp).to.exist;
  });
  it('sets name', () => {
    expect(exampleApp).to.have.property('name');
    expect(exampleApp.name).to.equal('exampleApp');
  });
  it('sets fbUrl', () => {
    expect(exampleApp).to.have.property('fbUrl');
    expect(exampleApp.fbUrl).to.equal(config.fbUrl + '/' + exampleApp.name);
  });
  describe('appEndpoint', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('appEndpoint');
    });
    it('is correct', () => {
      expect(exampleApp.appEndpoint).to.equal(`${config.serverUrl}/apps/${exampleApp.name}`);
    });
  });
  describe('get method', () => {
    it('exists', () => {
      expect(exampleApp).to.respondTo('get');
    });
    it('makes request', () => {
      return exampleApp.get().then(() => {
        return expect(mockGet).to.have.been.called;
      });
    });
  });
  describe('update method', () => {
    it('exists', () => {
      expect(exampleApp).to.respondTo('update');
    });
    it('makes request', () => {
      return exampleApp.update().then(() => {
        return expect(mockPut).to.have.been.called;
      });
    });
  });
  describe('addStorage method', () => {
    it('exists', () => {
      expect(exampleApp).to.respondTo('addStorage');
    });
    it('makes request', () => {
      return exampleApp.addStorage().then(() => {
        return expect(mockPost).to.have.been.called;
      });
    });
  });
  describe('applyTemplate method', () => {
    it('exists', () => {
      expect(exampleApp).to.respondTo('applyTemplate');
    });
    it('makes request', () => {
      return exampleApp.applyTemplate().then(() => {
        return expect(mockPost).to.have.been.called;
      });
    });
  });
  describe('addCollaborators method', () => {
    it('exists', () => {
      expect(exampleApp).to.respondTo('addCollaborators');
    });
    it('makes request', () => {
      return exampleApp.addCollaborators(['1']).then(() => {
        return expect(mockPut).to.have.been.called;
      });
    });
  });
  describe('Files model', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('Files');
      console.log('files:', exampleApp.Files);
    });
    it('sets app data', () => {
      expect(exampleApp.Files).to.be.an('object');
      expect(exampleApp.Files).to.have.property('app');
      expect(exampleApp.Files.app).to.have.property('name');
    });
  });
  describe('Users model', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('Users');
    });
  });
  describe('Accounts model', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('Accounts');
    });
  });
  describe('Groups model', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('Groups');
    });
  });
  describe('Structure', () => {
    // it('has structure', () => {
    //   expect(exampleApp.Structure).to.be.an('object');
    // });
  });
});
