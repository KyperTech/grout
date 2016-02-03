import Grout from '../../src';
let grout = new Grout();

let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;
let exampleApp;
describe('Directory model', () => {
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
	it.skip('exists', () => {
		expect(exampleApp).to.have.property('Directory');
	});
	describe('constructor', () => {
		it('sets project', () => {
			expect(exampleApp.Directory).to.have.property('project');
			expect(exampleApp.Directory.project).to.have.property('owner');
			expect(exampleApp.Directory.project).to.have.property('name');
		});
	});
	describe('fbRef getter', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.have.property('fbRef');
		});
	});
	describe('get method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('get');
		});
	});
	describe('sync method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('sync');
		});
	});
	describe('addFile method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('addFile');
		});
	});
	describe('addFolder method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('addFolder');
		});
	});
	describe('upload method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('upload');
		});
	});
	describe('remove method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('remove');
		});
	});
	describe('addToFb method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('addToFb');
		});
	});
	describe('delFromFb method', () => {
		it('exists', () => {
			expect(exampleApp.Directory).to.respondTo('delFromFb');
		});
	});
});
