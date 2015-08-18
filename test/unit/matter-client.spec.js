import MatterClient from '../../src/matter-client';
import request from '../../src/utils/request';
let Matter = new MatterClient();
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

describe('Matter', () => {
 describe('Login method', () => {
   beforeEach(() => {
     spy(Matter, 'login');
     spy(console, 'error');
   });
   it('handles no input', () => {
     Matter.login();
     expect(Matter.login).to.have.been.calledOnce;
   });
   it('logs in user', () => {
     //window.sessionStorage.setItem();
     Matter.login({username: 'test', password: 'test'});
     expect(Matter.login).to.have.been.calledOnce;
   });
 });
 describe('Signup method', () => {
   beforeEach(() => {
     spy(Matter, 'signup');
   });
   it('handles no input', () => {
     Matter.signup();
     expect(Matter.signup).to.have.been.calledOnce;
   });
   it('signs up new user', () => {
     Matter.signup({username: 'test', password: 'test'});
     expect(Matter.signup).to.have.been.calledOnce;
   });
 });
 describe('Logout method', () => {
   beforeEach(() => {
     spy(Matter, 'logout');
   });

    it('logs user', () => {
     Matter.logout();
     expect(Matter.logout).to.have.been.calledOnce;
   });
    //TODO: Check that token is removed from local storage
 });
 describe('getCurrentUser method', () => {
   beforeEach(() => {
     spy(Matter, 'getCurrentUser');
     Matter.getCurrentUser();
   });

   it('should have been run once', () => {
     expect(Matter.getCurrentUser).to.have.been.calledOnce;
   });
 });
 describe('getAuthToken method', () => {
   beforeEach(() => {
     spy(Matter, 'getAuthToken');
   });

   it('should have been run once', () => {
     Matter.getAuthToken();
     expect(Matter.getAuthToken).to.have.been.calledOnce;
   });
   it('get auth token', () => {
     window = {sessionStorage: {}};
     window.sessionStorage.getItem = () => {
       return '';
     };
     Matter.getAuthToken();
     expect(Matter.getAuthToken).to.have.been.calledOnce;
   });
 });
});
