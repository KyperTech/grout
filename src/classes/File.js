import config from '../config';
import matter from './Matter';
import { has, isObject, extend } from 'lodash';
import Firebase from 'firebase';
import AWS from 'aws-sdk';
//Convenience vars
const { logger } = matter.utils;

let firepad = getFirepadLib();
export default class File {
	constructor(actionData) {
		if (!actionData) {
			logger.error({
				description: 'File data that includes path and app is needed to create a File action.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data with path and app is needed to create file action.');
		}
		if (!isObject(actionData)) {
			logger.error({
				description: 'Action data is not an object. Action data must be an object that includes app and fileData.',
				func: 'constructor', obj: 'File'
			});
			//TODO: Get appName from path data?
			throw new Error('File data must be an object that includes path and appName.');
		}
		this.type = 'file';
		if (has(actionData, 'fileData') && has(actionData, 'app')) {
			extend(this, actionData.fileData);
			this.app = actionData.app;
			if (!this.path) {
				if (!this.ref && !this.name) {
					logger.error({
						description: 'Path, name, or ref required to create file.',
						func: 'constructor', obj: 'File'
					});
					throw new Error('Path or ref required to create file.');
				}
				this.path = this.name ? this.name : this.pathArrayFromRef.join('/');
			}
			this.pathArray = this.path.split('/');
			//Get name from data or from pathArray
			this.name = has(actionData.fileData, 'name') ? actionData.fileData.name : this.pathArray[this.pathArray.length - 1];
		}
		logger.debug({
			description: 'File object constructed.', file: this,
			func: 'constructor', obj: 'File'
		});
	}
	get pathArrayFromRef() {
		if (!this.fbRef) {
			logger.error({
				description: 'File fbRef is required to get path array.', file: this,
				func: 'pathArrayFromRef', obj: 'File'
			});
		}
		return this.fbRef.path.o;
	}
	get fileType() {
		if (this.ext == 'js') {
			return 'javascript';
		} else {
			return this.ext;
		}
	}
	get ext() {
		let re = /(?:\.([^.]+))?$/;
		return re.exec(this.name)[1];
	}
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
	get safePath() {
		const { safePathArray } = this;
		if(safePathArray.length === 1){
			return safePathArray[0];
		}
		return safePathArray.join('/');
	}
	get fbUrl() {
		if (!this.app || !this.app.name) {
			logger.error({
				description: 'App information needed to generate fbUrl for File.',
				file: this, func: 'fbRef', obj: 'File'
			});
			throw new Error ('App information needed to generate fbUrl for File.');
		}
		return [config.fbUrl, 'files', this.app.name, this.safePath].join('/');
	}
	get fbRef() {
		if (this.ref) {
			logger.log({
				description: 'File already has reference.',
				ref: this.ref, func: 'fbRef', obj: 'File'
			});
			return this.ref;
		}
		// logger.log({
		// 	description: 'Fb ref generated.',
		// 	url: this.fbUrl, func: 'fbRef', obj: 'File'
		// });
		return new Firebase(this.fbUrl);
	}
	get headless() {
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
	//Alias for get
	open() {
		return this.get();
	}
	add() {
		return this.addToFb();
	}
	remove() {
		return this.removeFromFb();
	}
	save() {
		return this.add();
	}
	/**
	 * @description Add file to Firebase located at file's fbRef
	 */
	addToFb() {
		logger.debug({
			description: 'addToFb called.', file: this,
			func: 'addToFb', obj: 'Files'
		});
		const fbData = {meta: {path: this.path}, original: this.content};
		const { fbRef } = this;
		return new Promise((resolve, reject) => {
			fbRef.set(fbData, error => {
				if (!error) {
					logger.info({
						description: 'File successfully added to Firebase.',
						func: 'addToFb', obj: 'Files'
					});
					resolve(fbData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'addToFb', obj: 'Files'
					});
					reject(error);
				}
			});
		});
	}
	/**
	 * @description Add file to Firebase located at file's fbRef
	 */
	removeFromFb() {
		const fbData = {meta: {path: this.path}};
		const { fbRef } = this;
		return new Promise((resolve, reject) => {
			fbRef.remove((error) => {
				if (!error) {
					logger.info({
						description: 'File successfully removed from Firebase.',
						func: 'removeFromFb', obj: 'Files'
					});
					resolve(fileData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'removeFromFb', obj: 'Files'
					});
					reject(error);
				}
			});
		});
	}
	getFromS3() {
		if (!this.app || !this.app.frontend) {
			logger.log({
				description: 'Application Frontend data not available. Calling applicaiton get.',
				func: 'get', obj: 'File'
			});
			return this.app.get().then((appData) => {
				this.app = appData;
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
		} else {
			//If AWS Credential do not exist, set them
			if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
				logger.log({
					description: 'AWS creds do not exist, so they are being set.',
					func: 'publish', obj: 'File'
				});
				setAWSConfig();
			}
			let s3 = new AWS.S3();
			let getData = {
				Bucket: this.app.frontend.bucketName,
				Key: this.path
			};
			//Set contentType from actionData to ContentType parameter of new object
			if (this.contentType) {
				getData.ContentType = this.contentType;
			}
			logger.debug({
				description: 'File get params built.', getData: getData,
				file: this, func: 'get', obj: 'File'
			});
			let finalData = this;
			return new Promise((resolve, reject) => {
				s3.getObject(getData, (error, data) => {
					//[TODO] Add putting object ACL (make public)
					if (error) {
						logger.error({
							description: 'Error loading file from S3.',
							error, func: 'get', obj: 'File'
						});
						return reject(error);
					}
					logger.info({
						description: 'File loaded successfully.',
						data: data, func: 'get', obj: 'File'
					});
					if (has(data, 'Body')) {
						logger.info({
							description: 'File has content.',
							content: data.Body.toString(),
							metaData: data.Metadata.toString(),
							func: 'get', obj: 'File'
						});
						finalData.content = data.Body.toString();
						logger.info({
							description: 'File content has been added to file.',
							file: finalData, func: 'get', obj: 'File'
						});
						resolve(finalData);
					} else {
						resolve(data);
					}
				});
			});
		}
	}
	saveToS3(fileData) {
		//TODO: Publish file to application
		logger.debug({
			description: 'File publish called.', file: this,
			fileData, func: 'publish', obj: 'File'
		});
		if (!this.app.frontend) {
			logger.error({
				description: 'Application Frontend data not available. Make sure to call .get().',
				func: 'publish', obj: 'File'
			});
			return Promise.reject({message: 'Front end data is required to publish file.'});
		} else {
			if (!has(fileData, ['content', 'path'])) {
				logger.error({
					description: 'File data including path and content required to publish.',
					func: 'publish', obj: 'File'
				});
				return Promise.reject({message: 'File data including path and content required to publish.'});
			}
			let saveParams = {
				Bucket: this.app.frontend.bucketName,
				Key: fileData.path,
				Body: fileData.content,
				ACL: 'public-read'
			};
			//Set contentType from fileData to ContentType parameter of new object
			if (this.contentType) {
				saveParams.ContentType = this.contentType;
			}
			//If AWS Credential do not exist, set them
			if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
				logger.debug({
					description: 'AWS creds do not exist, so they are being set.',
					func: 'publish', obj: 'File'
				});
				setAWSConfig();
			}
			let s3 = new AWS.S3();
			logger.debug({
				description: 'File publish params built.',
				saveParams: saveParams, fileData: this,
				func: 'publish', obj: 'File'
			});
			return new Promise((resolve, reject) => {
				s3.putObject(saveParams, (error, data) => {
					//[TODO] Add putting object ACL (make public)
					if (!error) {
						logger.log({
							description: 'File saved successfully.',
							response: data, func: 'publish', obj: 'File'
						});
						resolve(data);
					}	else {
						logger.error({
							description: 'Error saving file to S3.',
							error, func: 'publish', obj: 'File'
						});
						reject(error);
					}
				});
			});
		}
	}
	removeFromS3() {
		if (!this.app || !this.app.frontend) {
			logger.log({
				description: 'Application Frontend data not available. Calling applicaiton get.',
				func: 'removeFromS3', obj: 'File'
			});
			return this.app.get().then(appData => {
				this.app = appData;
				logger.log({
					description: 'Application get successful. Getting file.',
					app: this.app, func: 'removeFromS3', obj: 'File'
				});
				return this.get();
			}, error => {
				logger.error({
					description: 'Application Frontend data not available. Make sure to call .get().',
					error, func: 'removeFromS3', obj: 'File'
				});
				return Promise.reject({
					message: 'Front end data is required to get file.'
				});
			});
		} else {
			//If AWS Credential do not exist, set them
			if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
				logger.debug({
					description: 'AWS creds do not exist, so they are being set.',
					func: 'publish', obj: 'File'
				});
				setAWSConfig();
			}
			let s3 = new AWS.S3();
			let saveParams = {
				Bucket: this.app.frontend.bucketName,
				Key: this.path
			};
			//Set contentType from actionData to ContentType parameter of new object
			if (this.contentType) {
				saveParams.ContentType = this.contentType;
			}
			logger.debug({
				description: 'File get params built.',
				saveParams, file: this, func: 'get', obj: 'File'
			});
			return new Promise((resolve, reject) => {
				s3.deleteObject(saveParams, (error, data) => {
					//[TODO] Add putting object ACL (make public)
					if (error) {
						logger.error({
							description: 'Error loading file from S3.',
							error, func: 'get', obj: 'File'
						});
						return reject(error);
					}
					logger.info({
						description: 'File loaded successfully.',
						fileData: data, func: 'get', obj: 'File'
					});
					if (has(data, 'Body')) {
						logger.info({
							description: 'File has content.',
							fileData: data.Body.toString(), func: 'get', obj: 'File'
						});
						resolve(data.Body.toString());
					} else {
						resolve(data);
					}
				});
			});
		}
	}
	/**
	 * @description Open file in firepad from already existing ace editor instance
	 * @param {Object} Ace editor object
	 */
	openInFirepad(editor) {
		//Load file contents from s3
		return new Promise((resolve, reject) => {
			this.get().then(file => {
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
		if (typeof firepad.fromACE !== 'function') {
			logger.error({
				description: 'Firepad does not have fromACE method.',
				firepad, func: 'fbRef', obj: 'File'
			});
			return;
		}
		let settings = {};
		// if (this.content) {
		// 	settings.defaultText = this.content;
		// }
		//Attach logged in user id
		// if (matter.isLoggedIn && matter.currentUser) {
		// 	settings.userId = matter.currentUser.username || matter.currentUser.name;
		// }
		logger.debug({
			description: 'Creating firepad from ace.',
			settings, editor, func: 'fbRef', obj: 'File'
		});
		return firepad.fromACE(this.fbRef, editor, settings);
	}
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
	getDefaultContent() {
		//TODO: Fill with default data for matching file type
	}
}
//------------------ Utility Functions ------------------//
/**
 * @description Initial AWS Config
 */
function setAWSConfig() {
	return AWS.config.update({
		credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: config.aws.cognito.poolId
	}),
		region: config.aws.region
	});
}
/**
 * @description Load firepad from local or global
 */
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'fbRef', obj: 'File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.log({
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
