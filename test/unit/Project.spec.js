import Grout from '../../src';
import config from '../../src/config';
let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;

let exampleApp;
describe('Project model', () => {
  beforeEach(() => {
    exampleApp = grout.Project('test', 'exampleApp');
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
    expect(exampleApp).to.exist;
  });
  it('sets name', () => {
    expect(exampleApp).to.have.property('name');
    expect(exampleApp.name).to.equal('exampleApp');
  });
  describe('url', () => {
    it('exists', () => {
      expect(exampleApp).to.have.property('url');
    });
    it('is correct', () => {
      expect(exampleApp.url).to.equal(`${config.serverUrl}/projects/${exampleApp.name}`);
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
    it('throws if no update data is passed', () => {
      return expect(exampleApp.update()).to.eventually.throw;
    });
    it('makes request', () => {
      return exampleApp.update({}).then(() => {
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
      return exampleApp.applyTemplate('test').then(() => {
        return expect(mockPost).to.have.been.called;
      });
    });
    it('throws if no template name is provided', () => {
      return expect(exampleApp.applyTemplate()).to.eventually.throw;
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
  describe('Directory', () => {
    it('has structure', () => {
      expect(exampleApp.Directory).to.be.an('object');
    });
  });
});
