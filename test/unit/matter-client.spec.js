import Matter from '../../src/matter-client';

describe('Matter', () => {
  describe('Login method', () => {
    beforeEach(() => {
      spy(Matter, 'login');
      spy(console, 'error');
    });

    it('should have been run once', () => {
      Matter.login({username: 'test', password: 'test'});
      expect(Matter.login).to.have.been.calledOnce;
    });
    it('handle no input', () => {
      Matter.login();
      expect(Matter.login).to.have.been.calledOnce;
    });
  });
  describe('Signup method', () => {
    beforeEach(() => {
      spy(Matter, 'signup');
      Matter.signup({username: 'test', password: 'test'});
    });

    it('should have been run once', () => {
      expect(Matter.signup).to.have.been.calledOnce;
    });

  });
  describe('Logout method', () => {
    beforeEach(() => {
      spy(Matter, 'logout');
      Matter.logout();
    });

    it('should have been run once', () => {
      expect(Matter.logout).to.have.been.calledOnce;
    });

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
      window = {localStorage: {}};
      window.localStorage.getItem = () => {
        return '';
      };
      Matter.getAuthToken();
      expect(Matter.getAuthToken).to.have.been.calledOnce;
    });
  });
});
