import Grout from '../../src';
import config from '../../src/config';
let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;
let exampleApp;
describe('Files model', () => {
  beforeEach(() => {
    exampleApp = grout.Project({name: 'exampleApp', owner: 'test'});
    mockGet = sinon.stub(grout.utils.request, 'get', () => {
     // console.log('mock get called with:', arguments);
     return new Promise((resolve) => {
       resolve({body: {}});
     });
    });
    mockPut = sinon.stub(grout.utils.request, 'put', () => {
     // console.log('mock put called with:', arguments);
     return new Promise((resolve) => {
       resolve({body: {}});
     });
    });
    mockPost = sinon.stub(grout.utils.request, 'post', (url, postData) => {
     // console.log('mock post called with:', arguments);
     return new Promise((resolve, reject) => {
       if (!postData || postData == {}) {
         reject({});
       }
       resolve({body: {}});
     });
    });
    mockLog = sinon.stub(grout.utils.logger, 'log', () => {});
    mockDebug = sinon.stub(grout.utils.logger, 'debug', () => {});
    mockWarn = sinon.stub(grout.utils.logger, 'warn', () => {});
    mockInfo = sinon.stub(grout.utils.logger, 'info', () => {});
    mockError = sinon.stub(grout.utils.logger, 'error', () => {});
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
    expect(exampleApp).to.have.property('Files');
  });
  describe('constructor', () => {
    it('sets project', () => {
      expect(exampleApp.Files).to.have.property('project');
      expect(exampleApp.Files.project).to.have.property('owner');
      expect(exampleApp.Files.project).to.have.property('name');
    });
  });
  describe('fbUrl getter', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.have.property('fbUrl');
    });
  });
  describe('fbRef getter', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.have.property('fbRef');
    });
  });
  describe('pathArrayFromFbRef getter', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.have.property('pathArrayFromFbRef');
    });
  });
  describe('get method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('get');
    });
  });
  describe('sync method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('sync');
    });
  });
  describe('add method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('add');
    });
  });
  describe('upload method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('upload');
    });
  });
  describe('remove method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('remove');
    });
    it('has del alias', () => {
      expect(exampleApp.Files).to.respondTo('del');
    });
  });
  describe('addToFb method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('addToFb');
    });
  });
  describe('delFromFb method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('delFromFb');
    });
  });
  describe('addLocalToFb method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('addLocalToFb');
    });
  });
  describe('getFromS3 method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('getFromS3');
    });
  });
  describe('buildStructure method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('buildStructure');
    });
  });
  describe('syncStructure method', () => {
    it('exists', () => {
      expect(exampleApp.Files).to.respondTo('syncStructure');
    });
  });
});
