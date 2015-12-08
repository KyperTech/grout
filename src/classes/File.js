import config from '../config';
import matter from './Matter';
import _ from 'lodash';
import Firebase from 'firebase';
import Firepad from 'firepad';
import AWS from 'aws-sdk';
//Convenience vars
let logger = matter.utils.logger;

class File {
	constructor(actionData) {
		if (actionData && _.isObject(actionData) && _.has(actionData, 'fileData') && _.has(actionData, 'app')) {
			_.extend(this, actionData.fileData);
			this.app = actionData.app;
			if (!this.path) {
				if (!this.ref) {
					logger.error({
						description: 'Path or ref required to create file.',
						func: 'constructor', obj: 'File'
					});
					throw new Error('Path or ref required to create file.');
				}
				this.path = this.pathArrayFromRef.join('/');
			}
			this.pathArray = this.path.split('/');
			//Get name from data or from pathArray
			this.name = _.has(actionData.fileData, 'name') ? actionData.fileData.name : this.pathArray[this.pathArray.length - 1];
		} else if (actionData && !_.isObject(actionData)) {
			logger.error({
				description: 'Action data is not an object. Action data must be an object that includes app and fileData.',
				func: 'constructor', obj: 'File'
			});
			//TODO: Get appName from path data?
			throw new Error('File data must be an object that includes path and appName.');
		} else {
			logger.error({
				description: 'File data that includes path and app is needed to create a File action.',
				func: 'constructor', obj: 'File'
			});
			throw new Error('File data with path and app is needed to create file action.');
		}
		this.type = 'file';
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
		logger.log({
			description: 'Safe path array created.',
			safeArray: safeArray, func: 'safePathArray', obj: 'File'
		});
		return safeArray;
	}
	get safePath() {
		return this.safePathArray.join('/');
	}
	get fbUrl() {
		let url = [config.fbUrl, 'files', this.app.name, this.safePath].join('/');
		logger.log({
			description: 'File ref url generated',
			url: url, func: 'fbRef', obj: 'File'
		});
		return url;
	}
	get fbRef() {
		if (this.ref) {
			logger.log({
				description: 'File already has reference.',
				ref: this.ref, func: 'fbRef', obj: 'File'
			});
			return this.ref;
		}
		logger.log({
			description: 'Fb ref generatating.',
			url: this.fbUrl, func: 'fbRef', obj: 'File'
		});
		return new Firebase(this.fbUrl);
	}
	get headless() {
		return new Firepad.Headless(this.fbRef);
	}
	get() {
		// TODO: Load file from firepad content
		return new Promise((resolve) => {
			this.headless.getText((text) => {
				logger.warn({
					description: 'Text loaded from headless',
					text: text, func: 'get', obj: 'File'
				});
				this.content = text;
				// this.fbRef.once('value', (fileSnap) => {
				// 	let meta = fileSnap.child('meta').val();
				//
				// });
				this.headless.dispose();
				resolve(this);
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
			}, (err) => {
				logger.error({
					description: 'Application Frontend data not available.',
					error: err, func: 'get', obj: 'File'
				});
				return Promise.reject({message: 'Front end data is required to get file.'});
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
				s3.getObject(getData, (err, data) => {
					//[TODO] Add putting object ACL (make public)
					if (!err) {
						logger.info({
							description: 'File loaded successfully.',
							data: data, func: 'get', obj: 'File'
						});
						if (_.has(data, 'Body')) {
							logger.info({
								description: 'File has content.',
								content: data.Body.toString(),
								metaData: data.Metadata.toString(),
								func: 'get', obj: 'File'
							});
							finalData.content = data.Body.toString();
							logger.info({
								description: 'File content has been added to file.',
								file: finalData,
								func: 'get', obj: 'File'
							});
							resolve(finalData);
						} else {
							resolve(data);
						}
					} else {
						logger.error({
							description: 'Error loading file from S3.',
							error: err, func: 'get', obj: 'File'
						});
						reject(err);
					}
				});
			});
		}
	}
	//Alias for get
	open() {
		return this.get();
	}
	publish(fileData) {
		//TODO: Publish file to application
		logger.debug({
			description: 'File publish called.', file: this,
			fileData: fileData, func: 'publish', obj: 'File'
		});
		if (!this.app.frontend) {
			logger.error({
				description: 'Application Frontend data not available. Make sure to call .get().',
				func: 'publish', obj: 'File'
			});
			return Promise.reject({message: 'Front end data is required to publish file.'});
		} else {
			if (!_.has(fileData, ['content', 'path'])) {
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
				s3.putObject(saveParams, (err, data) => {
					//[TODO] Add putting object ACL (make public)
					if (!err) {
						logger.log({
							description: 'File saved successfully.',
							response: data, func: 'publish', obj: 'File'
						});
						resolve(data);
					}	else {
						logger.error({
							description: 'Error saving file to S3.',
							error: err, func: 'publish', obj: 'File'
						});
						reject(err);
					}
				});
			});
		}
	}
	del() {
		if (!this.app || !this.app.frontend) {
			logger.log({description: 'Application Frontend data not available. Calling applicaiton get.', func: 'get', obj: 'File'});
			return this.app.get().then((appData) => {
				this.app = appData;
				logger.log({description: 'Application get successful. Getting file.', app: appData, func: 'get', obj: 'File'});
				return this.get();
			}, (err) => {
				logger.error({description: 'Application Frontend data not available. Make sure to call .get().', error: err, func: 'get', obj: 'File'});
				return Promise.reject({message: 'Front end data is required to get file.'});
			});
		} else {
			//If AWS Credential do not exist, set them
			if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
				logger.debug({description: 'AWS creds do not exist, so they are being set.', func: 'publish', obj: 'File'});
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
				saveParams: saveParams, file: this,
				func: 'get', obj: 'File'
			});
			return new Promise((resolve, reject) => {
				s3.deleteObject(saveParams, function(err, data) {
					//[TODO] Add putting object ACL (make public)
					if (!err) {
						logger.info({
							description: 'File loaded successfully.',
							fileData: data, func: 'get', obj: 'File'
						});
						if (_.has(data, 'Body')) {
							logger.info({
								description: 'File has content.',
								fileData: data.Body.toString(), func: 'get', obj: 'File'
							});
							resolve(data.Body.toString());
						} else {
							resolve(data);
						}
					}	else {
						logger.error({
							description: 'Error loading file from S3.',
							error: err, func: 'get', obj: 'File'
						});
						return reject(err);
					}
				});
			});
		}
	}
	openInFirepad(editor) {
		//Load file contents from s3
		return new Promise((resolve, reject) => {
			this.get().then((file) => {
				logger.log({
					description: 'File contents loaded. Opening firepad.',
					editor: editor, file: file,
					func: 'openInFirepad', obj: 'File'
				});
				//Open firepad from ace with file content as default
				let firepad = file.firepadFromAce(editor);
				//Wait for firepad to be ready
				firepad.on('ready', () => {
					resolve(file);
					// firepad.setText()
				});
			}, (err) => {
				logger.error({
					description: 'Valid ace editor instance required to create firepad.',
					func: 'openInFirepad', obj: 'File', editor: editor
				});
				reject(err);
			});
		});
	}
	firepadFromAce(editor) {
		//TODO:Create new Firepad instance within div
		if (!editor || typeof editor.setTheme !== 'function') {
			logger.error({
				description: 'Valid ace editor instance required to create firepad.',
				func: 'fbRef', obj: 'File', editor: editor
			});
			return;
		}
		if (typeof Firepad.fromACE !== 'function') {
			logger.error({
				description: 'Firepad does not have fromACE method.',
				firepad: Firepad, func: 'fbRef', obj: 'File'
			});
			return;
		}
		let settings = {};
		// if (this.content) {
		// 	settings.defaultText = this.content;
		// }
		if (matter.isLoggedIn && matter.currentUser) {
			settings.userId = matter.currentUser.username || matter.currentUser.name;
		}
		logger.warn({
			description: 'Creating firepad from ace.',
			settings: settings, editor: editor, editorVal: editor.getValue(),
			func: 'fbRef', obj: 'File'
		});
		return Firepad.fromACE(this.fbRef, editor, settings);
	}
	getConnectedUsers() {
		return new Promise((resolve, reject) => {
			this.fbRef.child('users').on('value', (usersSnap) => {
				if (usersSnap.val() === null) {
					resolve([]);
				} else {
					let usersArray = [];
					usersSnap.forEach((userSnap) => {
						let user = userSnap.val();
						user.username = userSnap.key();
						usersArray.push(user);
					});
					logger.log({
						description: 'Connected users array built.',
						users: usersArray, func: 'connectedUsers', obj: 'File'
					});
					resolve(usersArray);
				}
			}, (err) => {
				logger.error({
					description: 'Error loading connected users.',
					error: err, func: 'connectedUsers', obj: 'File'
				});
				reject(err);
			});
		});
	}
	getDefaultContent() {
		//TODO: Fill with default data for matching file type
	}
}
export default File;
//------------------ Utility Functions ------------------//

// AWS Config
function setAWSConfig() {
	AWS.config.update({
		credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: config.aws.cognito.poolId
	}),
		region: config.aws.region
	});
}
