import config from '../../src/config';
import Grout from '../../src/grout';
import Firebase from 'firebase';
import Matter from 'kyper-matter';

let grout = new Grout();
let logger = grout.utils.logger;
let request = grout.utils.request;

let mockGet = sinon.stub(request, 'get', function() {
 console.log('mock get called with:', arguments);
 return new Promise((resolve) => {
   resolve({body: {}});
 });
});
let mockPut = sinon.stub(request, 'put', function() {
 console.log('mock put called with:', arguments);
 return new Promise((resolve) => {
   resolve({body: {}});
 });
});
let mockPost = sinon.stub(request, 'post', function(url, postData) {
 console.log('mock post called with:', arguments);
 return new Promise((resolve, reject) => {
   if (!postData || postData == {}) {
     reject({});
   }
   resolve({body: {}});
 });
});
let mockLog = sinon.stub(logger, 'log', function() {

});
let mockWarn = sinon.stub(logger, 'warn', function() {

});
let mockInfo = sinon.stub(logger, 'info', function() {

});
let mockError = sinon.stub(logger, 'error', function() {

});
describe('Grout', () => {
  describe('Config', () => {
    it('has the app name "tessellate"', () => {
      expect(grout.name).to.equal('tessellate');
    });
    it('does not have localServer mode enabled', () => {
      expect(grout.options.localServer).to.equal(false);
    });
  });
  describe('Matter', () => {
    it('main methods exist', () => {
     expect(grout).to.respondTo('login');
    });
    it('utils exist', () => {
      expect(grout.utils).to.be.an('object');
    });
  });
  describe('Groups', () => {
    it('exists', () => {
      expect(grout.Groups).to.be.an('object');
    });
  });
  describe('Group', () => {
    it('exists', () => {
      expect(grout).to.respondTo('Group');
    });
    it('accepts a name', () => {
      expect(grout.Group('test')).to.to.be.an('object');
    });
  });
  describe('Apps', () => {
    it('exists', () => {
      expect(grout.Apps).to.be.an('object');
    });
  });
  describe('App', () => {
    it('exists', () => {
      expect(grout).to.respondTo('App');
    });
    it('accepts a name', () => {
      expect(grout.App('test')).to.to.be.an('object');
    });
  });
  describe('Accounts', () => {
    it('exists', () => {
      expect(grout.Accounts).to.be.an('object');
    });
  });
  describe('Account', () => {
    it('exists', () => {
      expect(grout).to.respondTo('Account');
    });
    it('accepts a name', () => {
      expect(grout.Account('test')).to.to.be.an('object');
    });
  });
  describe('Accounts alias "Users"', () => {
    it('exists', () => {
      expect(grout.Users).to.be.an('object');
    });
  });
  describe('Accounts alias "User"', () => {
    it('exists', () => {
      expect(grout).to.respondTo('User');
    });
    it('accepts a name', () => {
      expect(grout.User('test')).to.to.be.an('object');
    });
  });
  describe('Directories', () => {
    it('exists', () => {
      expect(grout.Directories).to.be.an('object');
    });
  });
  describe('Directory', () => {
    it('exists', () => {
      expect(grout).to.respondTo('Directory');
    });
    it('accepts a name', () => {
      expect(grout.Directory('test')).to.to.be.an('object');
    });
  });
  describe('Templates', () => {
    it('exists', () => {
      expect(grout.Templates).to.be.an('object');
    });
  });
  describe('Template', () => {
    it('exists', () => {
      expect(grout).to.respondTo('Template');
    });
    it('accepts a name', () => {
      expect(grout.Template('test')).to.to.be.an('object');
    });
  });
});
