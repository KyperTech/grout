import Grout from '../../src';
import sinon from 'sinon';

let grout = new Grout();

let mockGet, mockPut, mockPost, mockDel, mockLog, mockDebug, mockWarn, mockInfo, mockError;

let exampleUser;
describe.skip('User model', () => {
	beforeEach(() => {
		exampleUser = grout.User('exampleUser');
		// console.log('exampleUser', exampleUser);
		mockGet = sinon.stub(grout.utils.request, 'get', () => {
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
		mockDel = sinon.stub(grout.utils.request, 'del', (url, postData) => {
			// console.log('mock post called with:', arguments);
			return new Promise((resolve, reject) => {
				if (!postData || postData == {}) {
					reject({});
				}
				resolve({body: {}});
			});
		});
		mockLog = sinon.stub(grout.utils.logger, 'log', () => {
		});
		mockDebug = sinon.stub(grout.utils.logger, 'debug', () => {
		});
		mockWarn = sinon.stub(grout.utils.logger, 'warn', () => {
		});
		mockInfo = sinon.stub(grout.utils.logger, 'info', () => {
		});
		mockError = sinon.stub(grout.utils.logger, 'error', () => {
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
		exampleUser = null;
	});
	describe('Get Method', () => {
		it('exists', () => {
			expect(exampleUser).to.respondTo('get');
		});
		it('resolves', () => {
			expect(exampleUser.get()).to.eventually.be.an('object');
		});
	});
	describe('Update Method', () => {
		it('exists', () => {
			expect(exampleUser).to.respondTo('update');
		});
		it('resolves', () => {
			expect(exampleUser.update()).to.eventually.be.an('object');
		});
	});
	describe('Remove Method', () => {
		it('exists', () => {
			expect(exampleUser).to.respondTo('remove');
		});
		it('resolves', () => {
			expect(exampleUser.remove()).to.eventually.be.an('object');
		});
	});
});
