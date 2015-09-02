import Grout from '../../src/grout';
import request from '../../src/utils/request';
import Firebase from 'firebase';

let grout = new Grout();
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

describe('Grout', () => {
 describe('Login method', () => {
   beforeEach(() => {
     spy(grout, 'login');
     spy(console, 'error');
   });
   it('handles no input', () => {
     grout.login();
     expect(grout).to.be.an('object');
   });
   it('logs in user', () => {
     //window.sessionStorage.setItem();
     expect(grout.name).to.equal('tessellate');
   });
 });
});
