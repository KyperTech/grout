import Grout from '../../src/grout';
import Matter from 'kyper-matter';
import App from '../../src/classes/Application';

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
  // it.skip('exists', () => {
  //   expect(exampleApp).to.exist;
  // });
  // describe('Get', () => {
  //   it.skip('exists', () => {
  //     expect(exampleApp).to.respondTo('get');
  //   });
  //   // it('makes request', () => {
  //   //   exampleApp.get().then(() => {
  //   //     expect(mockGet).to.have.been.called();
  //   //   });
  //   // });
  // });
  // describe('Update', () => {
  //   it.skip('exists', () => {
  //     expect(exampleApp).to.respondTo('update');
  //   });
  //   // it('makes request', () => {
  //   //   exampleApp.put().then(() => {
  //   //     expect(mockGet).to.have.been.called();
  //   //   });
  //   // });
  // });
  // describe('Structure', () => {
  //   it.skip('has structure', () => {
  //     expect(exampleApp).to.be.an('object');
  //   });
  // });
});
