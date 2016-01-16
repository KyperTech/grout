import config from '../config';
import matter from './Matter';
import { has, isObject, extend } from 'lodash';
import Files from './Files';
import Firebase from 'firebase';
import * as S3 from '../utils/s3';
//Convenience vars
const { logger } = matter.utils;
const s3 = S3.init();

export default class File {
	constructor(actionData) {
		logger.debug({
			description: 'File constructor called with', actionData,
			func: 'constructor', obj: 'File'
		});
		if (!actionData || !isObject(actionData)) {
			logger.error({
				description: 'File data that includes path and app is needed to create a File action.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data with path and app is needed to create file action.');
		}
		const { data, project } = actionData;
		if(!data){
			logger.error({
				description: 'Action data must be an object that includes data.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data must be an object that includes data.');
		}
		if(!project){
			logger.error({
				description: 'Action data must be an object that includes project.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data must be an object that includes project.');
		}
		this.type = 'file';
		this.project = project;
		extend(this, data);
		if (!this.path) {
			if (!this.ref && !this.name) {
				logger.error({
					description: 'Path, name, or ref required to create a file object.',
					func: 'constructor', obj: 'File'
				});
				throw new Error('Path or ref required to create file.');
			}
			this.path = this.name ? this.name : this.pathArrayFromRef.join('/');
		}
		this.pathArray = this.path.split('/');
		if (!this.name) {
			//Get name from data or from pathArray
			this.name = this.pathArray[this.pathArray.length - 1]
		}
		logger.debug({
			description: 'File object constructed.', file: this,
			func: 'constructor', obj: 'File'
		});
	}
	/**
	 * @description File's path in array form
	 * @return {Array}
	 */
	get pathArrayFromRef() {
		if (!this.fbRef) {
			logger.error({
				description: 'File fbRef is required to get path array.', file: this,
				func: 'pathArrayFromRef', obj: 'File'
			});
		}
		return this.fbRef.path.o;
	}
	/**
	 * @description File's type
	 * @return {String}
	 */
	get fileType() {
		if (this.ext == 'js') {
			return 'javascript';
		} else {
			return this.ext;
		}
	}
	/**
	 * @description File's extension
	 * @return {String}
	 */
	get ext() {
		let re = /(?:\.([^.]+))?$/;
		return re.exec(this.name)[1];
	}
	/**
	 * @description Array of file's path in a format that is safe for Firebase
	 * @return {Array}
	 */
	get safePathArray() {
		let safeArray = this.pathArray.map((loc) => {
			//Replace periods with colons and other unsafe chars as --
			return loc.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '--');
		});
		logger.debug({
			description: 'Safe path array created.',
			safeArray, func: 'safePathArray', obj: 'File'
		});
		return safeArray;
	}
	/**
	 * @description File's path in a format that is safe for Firebase
	 * @return {String}
	 */
	get safePath() {
		const { safePathArray } = this;
		if(safePathArray.length === 1){
			return safePathArray[0];
		}
		return safePathArray.join('/');
	}
	/**
	 * @description File's Firebase url
	 * @return {String}
	 */
	get fbUrl() {
		if (!this.project || !this.project.name) {
			logger.error({
				description: 'App information needed to generate fbUrl for File.',
				file: this, func: 'fbUrl', obj: 'File'
			});
			throw new Error ('App information needed to generate fbUrl for File.');
		}
		let files = new Files({project: this.project});
		const url = [files.fbUrl, this.safePath].join('/');
		logger.debug({
			description: 'FbUrl created for file.', url, file: this,
			func: 'fbUrl', obj: 'File'
		});
		return url;
	}
	/**
	 * @description File's Firebase reference
	 * @return {Object} Firebase reference
	 */
	get fbRef() {
		if (this.ref) {
			logger.debug({
				description: 'File already has reference.',
				ref: this.ref, func: 'fbRef', obj: 'File'
			});
			return this.ref;
		}
		logger.debug({
			description: 'Fb ref generated.',
			url: this.fbUrl, func: 'fbRef', obj: 'File'
		});
		return new Firebase(this.fbUrl);
	}
	/**
	 * @description Headless Firepad at file location
	 */
	get headless() {
		let firepad = getFirepadLib();
		if (typeof firepad === 'undefined' || typeof firepad.Headless !== 'function') {
			logger.error({
				description: 'Firepad is required to get file content.',
				func: 'get', obj: 'File'
			});
			throw Error('Firepad is required to get file content');
		} else {
			return firepad.Headless(this.fbRef);
		}
	}
	/**
	 * @description Get a file's content and meta data from default location (Firebase)
	 */
	get() {
		return new Promise((resolve, reject) => {
			this.fbRef.once('value', (fileSnap) => {
				// Load file from firepad original content if no history available
				if (fileSnap.hasChild('original') && !fileSnap.hasChild('history')) {
					//File has not yet been opened in firepad
					this.content = fileSnap.child('original').val();
					logger.log({
						description: 'File content loaded.',
						content: this.content, func: 'get', obj: 'File'
					});
					this.headless.setText(this.content, error => {
						this.headless.dispose();
						if (!error) {
							logger.log({
								description: 'File content set to Headless Firepad.',
								func: 'get', obj: 'File'
							});
							resolve(this);
						} else {
							logger.error({
								description: 'Error setting file text.',
								error, func: 'get', obj: 'File'
							});
							reject(error);
						}
					});
				} else {
					//Get firepad text from history
					this.headless.getText((text) => {
						logger.log({
							description: 'Text loaded from headless',
							text, func: 'get', obj: 'File'
						});
						this.content = text;
						// this.fbRef.once('value', (fileSnap) => {
						// 	let meta = fileSnap.child('meta').val();
						// });
						this.headless.dispose();
						resolve(this);
					});
				}
			});
		});
	}
	/**
	 * @description Open a file from default location (Firebase) (Alias for get)
	 */
	open() {
		return this.get();
	}
	/**
	 * @description Remove a file from default location (Firebase)
	 */
	remove(removeData) {
		return this.removeFromFb(removeData);
	}
	/**
	 * @description Save file to default location (Firebase)
	 */
	add() {
		return this.addToFb();
	}
	/**
	 * @description Save file to default location (Firebase)
	 */
	save() {
		return this.add();
	}
	/**
	 * @description Add file to Firebase located at file's fbRef
	 */
	addToFb() {
		logger.debug({
			description: 'addToFb called.', file: this,
			func: 'addToFb', obj: 'File'
		});
		const { fbRef, path, fileType, content, name } = this;
		const fbData = {meta: {path, fileType, name}};
		if(content){
			fbData.original = content;
		}
		return new Promise((resolve, reject) => {
			fbRef.set(fbData, error => {
				if (!error) {
					logger.info({
						description: 'File successfully added to Firebase.',
						func: 'addToFb', obj: 'File'
					});
					resolve(fbData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'addToFb', obj: 'File'
					});
					reject(error);
				}
			});
		});
	}
	/**
	 * @description Remove file from Firebase
	 */
	removeFromFb() {
		logger.debug({
			description: 'Remove File from Firebase called.',
			func: 'removeFromFb', obj: 'File'
		});
		return new Promise((resolve, reject) => {
			this.fbRef.remove(error => {
				if (error) {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'removeFromFb', obj: 'File'
					});
					return reject(error);
				}
				logger.info({
					description: 'File successfully removed from Firebase.',
					file: this, func: 'removeFromFb', obj: 'File'
				});
				resolve(this);
			});
		});
	}
	/**
	 * @description Open file in firepad from already existing ace editor instance
	 * @param {Object} Ace editor object
	 */
	openInFirepad(editor) {
		return this.get().then(file => {
			logger.info({
				description: 'File contents loaded. Opening firepad.',
				editor, file, func: 'openInFirepad', obj: 'File'
			});
			//Open firepad from ace with file content as default
			let fileFirepad = file.firepadFromAce(editor);
			//Wait for firepad to be ready
			fileFirepad.on('ready', () => {
				resolve(file);
				// firepad.setText()
			});
		}, error => {
			logger.error({
				description: 'Valid ace editor instance required to create firepad.',
				editor, error, func: 'openInFirepad', obj: 'File'
			});
			reject(error);
		});
	}
	/**
	 * @description Create firepad instance from ACE editor
	 * @param {Object} Ace editor object
	 */
	firepadFromAce(editor) {
		//TODO:Create new Firepad instance within div
		if (!editor || typeof editor.setTheme !== 'function') {
			logger.error({
				description: 'Valid ace editor instance required to create firepad.',
				func: 'fbRef', obj: 'File'
			});
			return;
		}
		let firepad = getFirepadLib();
		if (typeof firepad.fromACE !== 'function') {
			logger.error({
				description: 'Firepad does not have fromACE method.',
				firepad, func: 'fbRef', obj: 'File'
			});
			return;
		}
		let settings = {};
		//TODO: Set settings.defaultText with original file content if no history exists
		//Attach logged in user id
		if (matter.isLoggedIn && matter.currentUser) {
			settings.userId = matter.currentUser.username || matter.currentUser.name;
		}
		logger.debug({
			description: 'Creating firepad from ace.',
			settings, editor, func: 'fbRef', obj: 'File'
		});
		return firepad.fromACE(this.fbRef, editor, settings);
	}
	/**
	 * @description Get users currently connected to file
	 * @return {Promise}
	 */
	getConnectedUsers() {
		return new Promise((resolve, reject) => {
			this.fbRef.child('users').on('value', usersSnap => {
				if (usersSnap.val() === null) {
					resolve([]);
				} else {
					let usersArray = [];
					usersSnap.forEach(userSnap => {
						let user = userSnap.val();
						user.username = userSnap.key();
						usersArray.push(user);
					});
					logger.log({
						description: 'Connected users array built.',
						usersArray, func: 'connectedUsers', obj: 'File'
					});
					resolve(usersArray);
				}
			}, error => {
				logger.error({
					description: 'Error loading connected users.',
					error, func: 'connectedUsers', obj: 'File'
				});
				reject(error);
			});
		});
	}
	/**
	 * @description Get file from S3
	 * @param {Object} getData - Object containg data of file
	 * @param {String} getData.path - Path of file
	 * @return {Promise}
	 */
	getFromS3(getData) {
		return this.getProject().then(project => {
			const filesGetParams = {bucket: project.frontend.bucketName, path: this.path};
			logger.debug({
				description: 'File get params built.', getData,
				file: this, func: 'getFromS3', obj: 'File'
			});
			return s3.getObject(filesGetParams).then(s3File => {
				extend(this, s3File);
				logger.info({
					description: 'File loaded from s3.', s3File,
					file: this, func: 'getFromS3', obj: 'File'
				});
				return this;
			}, error => {
				logger.error({
					description: 'Error getting file from s3.',
					file: this, func: 'getFromS3', obj: 'File'
				});
				return Promise.reject(error);
			});
		}, error => {
			return Promise.reject(error);
		});
	}
	/**
	 * @description Save file to S3
	 * @param {Object} saveData - Object containg new file's data
	 * @param {String} saveData.content - String content of file
	 * @param {String} saveData.contentType - File's content type
	 * @return {Promise}
	 */
	saveToS3(saveData) {
		return this.getProject().then(project => {
			const { content, contentType } = saveData;
			let saveData = {
				bucket: project.frontend.bucketName,
				path: this.path,
				content
			}
			if(contentType){
				saveData.contentType = contentType;
			}
			return s3.saveObject(saveData);
		}, error => {
			return Promise.reject(error);
		});
	}
	/**
	 * @description Remove file from S3
	 * @return {Promise}
	 */
	removeFromS3() {
		return this.getProject().then(project => {
			let saveParams = {
				Bucket: this.project.frontend.bucketName,
				Key: this.path
			};
			logger.debug({
				description: 'File get params built.',
				saveParams, file: this, func: 'get', obj: 'File'
			});
			return s3.deleteObject(saveParams).then(deletedFile => {
					logger.info({
						description: 'File loaded successfully.',
						deletedFile, func: 'get', obj: 'File'
					});
					resolve(deletedFile);
			}, error => {
				return Promise.reject(error);
			});
		}, error => {
			return Promise.reject(error);
		});
	}
	/**
	 * @description Get project data
	 * @return {Promise}
	 */
	getProject() {
		if(this.project && this.project.frontend) {
			return Promise.resolve(this.project);
		}
		logger.log({
			description: 'Application Frontend data not available. Calling applicaiton get.',
			func: 'get', obj: 'File'
		});
		return this.project.get().then(appData => {
			this.project = appData;
			logger.log({
				description: 'Application get successful. Getting file.',
				app: appData, func: 'get', obj: 'File'
			});
			return this.get();
		}, error => {
			logger.error({
				description: 'Application Frontend data not available.',
				error, func: 'get', obj: 'File'
			});
			return Promise.reject({
				message: 'Front end data is required to get file.'
			});
		});
	}
}
/**
 * @description Load firepad from local or global
 */
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'File => getFirepadLib', file: 'classes/File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.debug({
			description: 'Firepad does not currently exist.',
			func: 'fbRef', obj: 'File'
		});
		return null;
		//TODO: Correctly load firepad
		// dom.loadJs('https://cdn.firebase.com/libs/firepad/1.2.0/firepad.js');
		// if (typeof global !== 'undefined' && global.Firepad) {
		// 	return global.Firepad;
		// } else if (typeof window !== 'undefined' && window.Firepad) {
		// 	return window.Firepad;
		// } else {
		// 	logger.error({
		// 		description: 'Adding firepad did not help.',
		// 		func: 'fbRef', obj: 'File'
		// 	});
		// }
	}
}
