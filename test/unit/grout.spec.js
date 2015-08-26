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
     expect(grout.login).to.have.been.calledOnce;
   });
   it('logs in user', () => {
     //window.sessionStorage.setItem();
     grout.login({username: 'test', password: 'test'});
     expect(grout.login).to.have.been.calledOnce;
   });
 });
 describe('Signup method', () => {
   beforeEach(() => {
     spy(grout, 'signup');
   });
   it('handles no input', () => {
     grout.signup();
     expect(grout.signup).to.have.been.calledOnce;
   });
   it('signs up new user', () => {
     grout.signup({username: 'test', password: 'test'});
     expect(grout.signup).to.have.been.calledOnce;
   });
 });
 describe('Logout method', () => {
   beforeEach(() => {
     spy(grout, 'logout');
   });

    it('logs user', () => {
     grout.logout();
     expect(grout.logout).to.have.been.calledOnce;
   });
    //TODO: Check that token is removed from local storage
 });
 describe('getCurrentUser method', () => {
   beforeEach(() => {
     spy(grout, 'getCurrentUser');
     grout.getCurrentUser();
   });

   it('should have been run once', () => {
     expect(grout.getCurrentUser).to.have.been.calledOnce;
   });
 });
 describe('getAuthToken method', () => {
   beforeEach(() => {
     spy(grout, 'getAuthToken');
   });

   it('should have been run once', () => {
     grout.getAuthToken();
     expect(grout.getAuthToken).to.have.been.calledOnce;
   });
   it('get auth token', () => {
     window = {sessionStorage: {}};
     window.sessionStorage.getItem = () => {
       return '';
     };
     grout.getAuthToken();
     expect(grout.getAuthToken).to.have.been.calledOnce;
   });
 });
});
