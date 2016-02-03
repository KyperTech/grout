import Grout from '../../src';
import FileSystemEntity from '../../src/classes/FileSystemEntity';

let grout = new Grout();
let mockGet, mockPut, mockPost, mockLog, mockDebug, mockWarn, mockInfo, mockError;
let exampleApp, exampleEntity;
const exampleData = {project: {name: 'exampleApp', owner: 'test'}, entity: 'somefile.js'};
describe('FileSystemEntity class', () => {
	beforeEach(() => {
		exampleApp = grout.Project(exampleData.project.owner, exampleData.project.name);
		exampleEntity = new FileSystemEntity(exampleApp, exampleData.entity);
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
		expect(exampleEntity).to.exist;
	});
	describe('constructor', () => {
		it('sets project', () => {
			expect(exampleEntity).to.have.property('project');
			expect(exampleEntity.project).to.have.property('owner');
			expect(exampleEntity.project).to.have.property('name');
		});
		it('correctly sets path', () => {
			expect(exampleEntity).to.have.property('path');
			expect(exampleEntity.path).to.equal(exampleData.entity);
		});
	});
	describe('get method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('get');
		});
	});
	describe('move method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('move');
		});
	});
	describe('remove method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('remove');
		});
	});
	describe('open method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('open');
		});
	});
	describe('addToFb method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('addToFb');
		});
	});
	describe('removeFromFb method', () => {
		it('exists', () => {
			expect(exampleEntity).to.respondTo('removeFromFb');
		});
	});
});
