import config from '../config';
import matter from './Matter';
import { has, isObject, extend } from 'lodash';
import Firebase from 'firebase';
import firebaseUtil from '../utils/firebase';
import * as S3 from '../utils/s3';
//Convenience vars
const { logger } = matter.utils;
const s3 = S3.init();

export default class File {
	constructor(project, path, name) {
		logger.debug({
			description: 'File constructor called with', project, path, name,
			func: 'constructor', obj: 'File'
		});
		if(!path){
			logger.error({
				description: 'File must include path.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File must include a path.');
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
		this.name = name;
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
	 * @description Headless Firepad at file location
	 */
	get headless() {
		let firepad = firebaseUtil.getFirepadLib();
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
