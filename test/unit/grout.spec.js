import Grout from '../../src';

let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;

describe('Grout', () => {
	beforeEach(() => {
		mockGet = sinon.stub(grout.utils.request, 'get', () => {
		//console.log('mock get called with:', arguments);
			return new Promise((resolve) => {
				resolve({body: {}});
			});
		});
		mockPut = sinon.stub(grout.utils.request, 'put', () => {
		//console.log('mock put called with:', arguments);
			return new Promise((resolve) => {
				resolve({body: {}});
			});
		});
		mockPost = sinon.stub(grout.utils.request, 'post', (url, postData) => {
		//console.log('mock post called with:', arguments);
			return new Promise((resolve, reject) => {
				if (!postData || postData == {}) {
					reject({});
				}
				resolve({body: {}});
			});
		});
		mockLog = sinon.stub(grout.utils.logger, 'log', () => {
		});
		mockDebug = sinon.stub(grout.utils.logger, 'debug',() => {
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
		mockLog.restore();
		mockDebug.restore();
		mockWarn.restore();
		mockInfo.restore();
		mockError.restore();
	});
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
			expect(grout).to.respondTo('logout');
			expect(grout).to.respondTo('signup');
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
			expect(grout.Group('test')).to.be.an('object');
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
		//it('accepts a name', () => {
		//expect(grout.App({name: 'test'})).to.be.an('object');
		//});
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
			expect(grout.Account('test')).to.be.an('object');
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
			expect(grout.User('test')).to.be.an('object');
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
			expect(grout.Template('test')).to.be.an('object');
		});
	});
});
