import config from '../config';
import _ from 'lodash';
import AWS from 'aws-sdk';

import matter from './Matter';
import Firebase from 'firebase';
import File from './File';
//Convenience vars
let logger = matter.utils.logger;

class Files {
	constructor(filesData) {
		if (filesData && _.isObject(filesData) && _.has(filesData, 'app')) { //Data is object containing directory data
			this.app = filesData.app;
		} else if (filesData && _.isString(filesData)) { //Data is string name
			this.app = {name: filesData};
		} else if (filesData && _.isArray(filesData)) {
			//TODO: Handle an array of files being passed as data
			logger.error({
				description: 'Action data object with name is required to start a Files Action.',
				func: 'constructor', obj: 'Files'
			});
			throw new Error('Files Data object with application is required to start a Files action.');
		} else {
			logger.error({
				description: 'Action data object with name is required to start a Files Action.',
				func: 'constructor', obj: 'Files'
			});
			throw new Error('Files Data object with name is required to start a Files action.');
		}
		logger.debug({
			description: 'Files object constructed.',
			func: 'constructor', obj: 'Files'
		});
	}
	/**
	 * @description Firebase URL for files list
	 */
	get fbUrl() {
		return `${config.fbUrl}/files/${this.app.name}`;
	}
	/**
	 * @description Firebase reference of files list
	 */
	get fbRef() {
		logger.log({
			description: 'Url created for files fbRef.',
			url: this.fbUrl, func: 'fbRef', obj: 'Files'
		});
		return new Firebase(this.fbUrl);
	}
	/**
	 * @description Path array that is built from Firebase Reference
	 * @private
	 */
	get pathArrayFromFbRef() {
		//Handle fbUrls that have multiple levels
		let removeArray = config.fbUrl.replace('https://', '').split('/');
		removeArray.shift();
		logger.warn({
			description: 'Remove array started.',
			removeArray: removeArray, fbRefArray: this.fbRef.path.o, func: 'fbRef', obj: 'Files'
		});
		let pathArray = this.fbRef.path.o.splice(0, removeArray.length);
		logger.warn({
			description: 'Path array built.',
			pathArray: pathArray, func: 'fbRef', obj: 'Files'
		});
		return pathArray;
	}
	/**
	 * @description Get files list single time
	 */
	get() {
		logger.log({
			description: 'Files get called.',
			func: 'get', obj: 'Files'
		});
		return new Promise((resolve) => {
			this.fbRef.once('value', (filesSnap) => {
				logger.warn({
					description: 'Files loaded from firebase.',
					val: filesSnap.val(), func: 'get', obj: 'Files'
				});
				let filesArray = [];
				// let filesPathArray =  this.pathArrayFromFbRef;
				filesSnap.forEach((objSnap) => {
					let objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : {path: objSnap.key()};
					//TODO: Have a better fallback for when meta does not exist
					// if (!objData.path) {
					// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
					// }
					objData.key = objSnap.key();
					filesArray.push(objData);
				});
				logger.warn({
					description: 'Files array built.',
					val: filesArray, func: 'get', obj: 'Files'
				});
				resolve(filesArray);
			});
		});
	}
	/**
	 * @description Get synced files list from firebase
	 */
	sync() {
		// TODO: get files list from firebase
		logger.log({
			description: 'Files get called.',
			func: 'get', obj: 'Files'
		});
		return new Promise((resolve) => {
			this.fbRef.on('value', (filesSnap) => {
				logger.warn({
					description: 'Files loaded from firebase.',
					val: filesSnap.val(), func: 'get', obj: 'Files'
				});
				let filesArray = [];
				// let filesPathArray =  this.pathArrayFromFbRef;
				filesSnap.forEach((objSnap) => {
					let objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : {path: objSnap.key()};
					//TODO: Have a better fallback for when meta does not exist
					// if (!objData.path) {
					// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
					// }
					objData.key = objSnap.key();
					filesArray.push(objData);
				});
				logger.warn({
					description: 'Files array built.',
					val: filesArray, func: 'get', obj: 'Files'
				});
				resolve(filesArray);
			});
		});
	}

	/**
	 * @description Add a new file
	 */
	add(fileData) {
		//TODO: Allow for options of where to add the file to
		return this.addToFb(fileData);
	}
	/**
	 * @description Delete file
	 */
	del(fileData) {
		//TODO: Delete file from S3 as well if it exists
		return this.delFromFb(fileData);
	}
	/**
	 * @description Get files list from S3
	 */
	getFromS3() {
		if (!this.app.frontend || !this.app.frontend.bucketName) {
			logger.warn({
				description: 'Application Frontend data not available. Calling .get().',
				app: this.app, func: 'getFromS3', obj: 'Files'
			});
			return this.app.get().then((applicationData) => {
				logger.log({
					description: 'Application get returned.',
					data: applicationData, func: 'getFromS3', obj: 'Files'
				});
				this.app = applicationData;
				if (_.has(applicationData, 'frontend')) {
					return this.get();
				} else {
					logger.error({
						description: 'Application does not have Frontend to get files from.',
						func: 'getFromS3', obj: 'Files'
					});
					return Promise.reject({
						message: 'Application does not have frontend to get files from.'
					});
				}
			}, (err) => {
				logger.error({
					description: 'Application Frontend data not available. Make sure to call .get().',
					error: err, func: 'getFromS3', obj: 'Files'
				});
				return Promise.reject({
					message: 'Bucket name required to get objects'
				});
			});
		} else {
			//If AWS Credentials do not exist, set them
			if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
				// logger.info('AWS creds are being updated to make request');
				setAWSConfig();
			}
			let s3 = new AWS.S3();
			let listParams = {Bucket: this.app.frontend.bucketName};
			return new Promise((resolve, reject) => {
				s3.listObjects(listParams, function(err, data) {
					if (!err) {
						logger.info({
							description: 'Files list loaded.', filesData: data, func: 'get', obj: 'Files'
						});
						return resolve(data.Contents);
					} else {
						logger.error({
							description: 'Error getting files from S3.',
							error: err, func: 'get', obj: 'Files'
						});
						return reject(err);
					}
				});
			});
		}
	}
	/**
	 * @description Add a file to Firebase
	 */
	addToFb(fileData) {
		if (!fileData || !fileData.path) {
			logger.error({
				description: 'Invalid file data. Path must be included.',
				func: 'addToFb', obj: 'Files'
			});
			return Promise.reject({message: 'Invalid file data. Path must be included.'});
		}
		let file = new File({app: this.app, fileData: fileData});
		//TODO: Handle inital content setting
		return new Promise((resolve, reject) => {
			file.fbRef.set({meta: {path: file.path}}, (err) => {
				if (!err) {
					logger.error({
						description: 'File successfully added to Firebase.',
						func: 'addToFb', obj: 'Files'
					});
					resolve(fileData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error: err, func: 'addToFb', obj: 'Files'
					});
					reject(err);
				}
			});
		});
	}
	/**
	 * @description Delete a file from Firebase
	 */
	delFromFb(fileData) {
		if (!fileData || !fileData.path) {
			logger.error({
				description: 'Invalid file data. Path must be included.',
				func: 'delFromFb', obj: 'Files'
			});
			return Promise.reject({message: 'Invalid file data. Path must be included.'});
		}
		let file = new File({app: this.app, fileData: fileData});
		return new Promise((resolve, reject) => {
			file.fbRef.remove(fileData, (err) => {
				if (!err) {
					resolve(fileData);
				} else {
					reject(err);
				}
			});
		});
	}
	publish() {
		//TODO: Publish all files
	}
	/**
	 * @description build child structure from files list
	 */
	buildStructure() {
		logger.debug({
			description: 'Build Structure called.',
			func: 'buildStructure', obj: 'Application'
		});
		return this.get().then((filesArray) => {
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Application'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Application'
			});
			return childStruct;
		}, (err) => {
			logger.error({
				description: 'Error getting application files.',
				error: err, func: 'buildStructure', obj: 'Application'
			});
			return Promise.reject({
				message: 'Error getting files.',
				error: err
			});
		});
	}
	/**
	 * @description sync file structure from Firebase
	 */
	syncStructure() {
		//TODO: Determine if it is worth storing this in the built structure
		logger.debug({
			description: 'Build Structure called.',
			func: 'syncStructure', obj: 'Application'
		});
		return this.sync().then((filesArray) => {
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'syncStructure', obj: 'Application'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'syncStructure', obj: 'Application'
			});
			return childStruct;
		}, (err) => {
			logger.error({
				description: 'Error getting application files.',
				error: err, func: 'syncStructure', obj: 'Application'
			});
			return Promise.reject({
				message: 'Error getting files.',
				error: err
			});
		});
	}
	//ALIAS FOR buildStructure
	// get structure() {
	// 	return this.buildStructure();
	// }
}
export default Files;
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
/**
 * @description Convert from array file structure (from S3) to 'children' structure used in Editor GUI
 * @private
 * @example
 * //Array structure: [{path:'index.html'}, {path:'testFolder/file.js'}]
 * //Children Structure [{type:'folder', name:'testfolder', children:[{path:'testFolder/file.js', name:'file.js', filetype:'javascript', contentType:'application/javascript'}]}]
 * var flatArray = [{path:'index.html'}, {path:'testFolder/file.js'}];
 * var childrenStructure = childrenStructureFromArray(flatArray);
 */
function childrenStructureFromArray(fileArray) {
	// logger.log('childStructureFromArray called:', fileArray);
	//Create a object for each file that stores the file in the correct 'children' level
	var mappedStructure = fileArray.map(function(file) {
		return buildStructureObject(file);
	});
	return combineLikeObjs(mappedStructure);
}
/**
 * @description Convert file with key into a folder/file children object
 * @private
 */
function buildStructureObject(file) {
	var pathArray;
	// console.log('buildStructureObject with:', file);
	if (_.has(file, 'path')) {
		//Coming from files already having path (structure)
		pathArray = file.path.split('/');
	} else if (_.has(file, 'Key')) {
		//Coming from aws
		pathArray = file.Key.split('/');
		// console.log('file before pick:', file);
		file = _.pick(file, 'Key');
		file.path = file.Key;
		file.name = file.Key;
	} else {
		logger.error({
			description: 'Invalid file.', file: file,
			func: 'buildStructureObject', obj: 'Files'
		});
	}
	var currentObj = file;
	if (pathArray.length == 1) {
		currentObj.name = pathArray[0];
		if (!_.has(currentObj,'type')) {
			currentObj.type = 'file';
		}
		currentObj.path = pathArray[0];
		return currentObj;
	} else {
		var finalObj = {};
		_.each(pathArray, (loc, ind, list) => {
			if (ind != list.length - 1) {//Not the last loc
				currentObj.name = loc;
				currentObj.path = _.take(list, ind + 1).join('/');
				currentObj.type = 'folder';
				currentObj.children = [{}];
				//TODO: Find out why this works
				if (ind == 0) {
					finalObj = currentObj;
				}
				currentObj = currentObj.children[0];
			} else {
				currentObj.type = 'file';
				currentObj.name = loc;
				currentObj.path = pathArray.join('/');
				if (file.$id) {
					currentObj.$id = file.$id;
				}
			}
		});
		return finalObj;
	}
}
/**
 * @description Recursivley combine children of object's that have the same names
 * @private
 */
function combineLikeObjs(mappedArray) {
	var takenNames = [];
	var finishedArray = [];
	_.each(mappedArray, (obj) => {
		if (takenNames.indexOf(obj.name) == -1) {
			takenNames.push(obj.name);
			finishedArray.push(obj);
		} else {
			var likeObj = _.findWhere(mappedArray, {name: obj.name});
			//Combine children of like objects
			likeObj.children = _.union(obj.children, likeObj.children);
			likeObj.children = combineLikeObjs(likeObj.children);
			// logger.log('extended obj:',likeObj);
		}
	});
	return finishedArray;
}
