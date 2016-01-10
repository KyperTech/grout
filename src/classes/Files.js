import config from '../config';
import { toArray, isArray, has, pick, take, each, findWhere, union, clone, extend } from 'lodash';
import AWS from 'aws-sdk';
import matter from './Matter';
import Firebase from 'firebase';
import File from './File';
//Convenience vars
const { logger } = matter.utils;

export default class Files {
	constructor(filesData) {
		if(!filesData || !has(filesData, 'project')){
			logger.error({
				description: 'Action data object with name is required to start a Files Action.',
				func: 'constructor', obj: 'Files'
			});
			throw new Error('Files Data object with name is required to start a Files action.');
		}
		extend(this, filesData);
		logger.debug({
			description: 'Files object constructed.',
			func: 'constructor', obj: 'Files', files: this
		});
	}
	/**
	 * @description Firebase URL for files list
	 */
	get fbUrl() {
		if(!this.project.owner){
			logger.warn({
				description: 'No owner provided. FbUrl does not contain owner name.',
				func: 'fbUrl', obj: 'Files'
			});
			return `${config.fbUrl}/files/${this.project.name}`;
		}
		return `${config.fbUrl}/files/${this.project.owner.id}/${this.project.name}`;
	}
	/**
	 * @description Firebase reference of files list
	 */
	get fbRef() {
		logger.debug({
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
		const pathArray = this.fbRef.path.o.splice(0, removeArray.length);
		logger.info({
			description: 'Path array built.',
			pathArray, func: 'fbRef', obj: 'Files'
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
		return new Promise(resolve => {
			this.fbRef.once('value', filesSnap => {
				logger.info({
					description: 'Files loaded from firebase.',
					func: 'get', obj: 'Files'
				});
				let filesArray = [];
				filesSnap.forEach(objSnap => {
					let objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : {path: objSnap.key()};
					//TODO: Have a better fallback for when meta does not exist
					// if (!objData.path) {
					// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
					// }
					objData.key = objSnap.key();
					filesArray.push(objData);
				});
				logger.debug({
					description: 'Files array built.',
					filesArray, func: 'get', obj: 'Files'
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
		logger.debug({
			description: 'Files sync called.',
			func: 'sync', obj: 'Files'
		});
		return new Promise(resolve => {
			this.fbRef.on('value', filesSnap => {
				logger.info({
					description: 'Files synced with Firebase.',
					func: 'sync', obj: 'Files'
				});
				let filesArray = [];
				// let filesPathArray =  this.pathArrayFromFbRef;
				filesSnap.forEach(objSnap => {
					let objData = objSnap.hasChild('meta') ? objSnap.child('meta').val() : {path: objSnap.key()};
					//TODO: Have a better fallback for when meta does not exist
					// if (!objData.path) {
					// 	objSnap.ref().path.o.splice(0, filesPathArray.length);
					// }
					objData.key = objSnap.key();
					filesArray.push(objData);
				});
				logger.log({
					description: 'Files array built.',
					filesArray, func: 'get', obj: 'Files'
				});
				resolve(filesArray);
			});
		});
	}
	/**
	 * @description Add a new file or files
	 * @param {Object|Array} fileData - Array of objects or single object containing file data
	 * @param {Object} fileData.path - Path of file relative to project
	 */
	add(fileData) {
		//TODO: Allow for options of where to add the file to
		if(isArray(fileData)){
			return this.upload(fileData);
		}
		return this.addToFb(fileData);
	}
	upload(filesData) {
		//TODO: Allow for options of where to add the file to
		if(!isArray(filesData)){
			return this.addToFb(filesData);
		} else {
			logger.warn({
				description: 'Add called with multiple files.', files,
				app: this.project, func: 'upload', obj: 'Files'
			});
			let promises = [];
			each(filesData, file => {
				promises.push(this.addToFb(file));
			});
			return Promise.all(promises).then(resultsArray => {
				logger.info({
					description: 'Files uploaded successfully.', resultsArray,
					func: 'upload', obj: 'Files'
				});
				return Promise.resolve(this);
			});
		}
	}
	/**
	 * @description Remove object from files (folder or file)
	 */
	remove(objData) {
		//TODO: Delete file from S3 as well if it exists
		return this.delFromFb(objData);
	}
	/**
	 * @description Alias for remove
	 */
	del(objData) {
		//TODO: Delete file from S3 as well if it exists
		return this.remove(objData);
	}
	publish() {
		//TODO: Publish all files
	}
	addFolder(folderData) {
		let dataObj = folderData;
		dataObj.app = this;
		let folder = new Folder({app: this})
		return folder.save();
	}

	/**
	 * @description Add a file to Firebase
	 * @param {Object} fileData - Data object for new file
	 * @param {String} fileData.path - Path of file within project
	 * @param {String} fileData.content - Content of file
	 */
	addToFb(addData) {
		logger.debug({
			description: 'Add to fb called.', addData,
			func: 'addToFb', obj: 'Files'
		});
		if (!addData) {
			logger.debug({
				description: 'Object data is required to add.', addData,
				func: 'addToFb', obj: 'Files'
			});
			return Promise.reject({
				message: 'Object data is required to add.'
			});
		}
		if (isArray(addData)) {
			let promises = [];
			addData.forEach(file => {
				promises.push(this.addToFb(file));
			});
			return Promise.all(promises);
		}
		const { size, path, name, type } = addData;
		if (size) {
			return this.addLocalToFb(addData);
		}
		if (!path) {
			logger.error({
				description: 'Invalid file data. Path must be included.',
				func: 'addToFb', obj: 'Files'
			});
			return Promise.reject({
				message: 'Invalid file data. Path must be included.'
			});
		}
		let newData = {project: this.project, data: { path }};
		if(name){
			newData.data.name = name;
		}
		if (type && type === 'folder') {
			return new Folder(newData).save();
		} else {
			return new File(newData).save();
		}
	}
	/**
	 * @description Delete a file or folder from Firebase
	 * @param {Object} objData - Data of file or folder
	 * @param {String} path - Path of file or folder
	 */
	delFromFb(fileData) {
		logger.debug({
			description: 'Del from fb called.', fileData,
			func: 'delFromFb', obj: 'Files'
		});
		if (!fileData || !fileData.path) {
			logger.error({
				description: 'Invalid file data. Path must be included.',
				func: 'delFromFb', obj: 'Files'
			});
			return Promise.reject({
				message: 'Invalid file data. Path must be included.'
			});
		}
		let file = new File({app: this.project, fileData});
		return new Promise((resolve, reject) => {
			file.fbRef.remove(fileData, err => {
				if (!err) {
					resolve(fileData);
				} else {
					reject(err);
				}
			});
		});
	}
	/**
	 * @description Upload a local file to Firebase
	 * @param {File} file - Local file with content to be uploaded
	 */
	addLocalToFb(fileData) {
		logger.debug({
			description: 'Add local to fb called.', fileData,
			func: 'addLocalToFb', obj: 'Files'
		});
		if (!fileData) {
			logger.error({
				description: 'File is required to upload to Firebase.',
				func: 'addLocalToFb', obj: 'Files'
			});
			return Promise.reject({
				message: 'File is required to upload to Firebase.'
			});
		}
		return getContentFromFile(fileData).then(content => {
			logger.debug({
				description: 'Content loaded from local file.', content,
				func: 'addLocalToFb', obj: 'Files'
			});
			fileData.content = content;
			fileData.path = fileData.name;
			const file = new File({app: this.project, fileData});
			logger.info({
				description: 'File object created.', file,
				func: 'addLocalToFb', obj: 'Files'
			});
			return file.save();
		});
	}
	/**
	 * @description Get files list from S3
	 */
	getFromS3() {
		if (!this.project.frontend || !this.project.frontend.bucketName) {
			logger.warn({
				description: 'Files Frontend data not available. Calling .get().',
				app: this.project, func: 'getFromS3', obj: 'Files'
			});
			return this.project.get().then(applicationData => {
				logger.log({
					description: 'Files get returned.',
					data: applicationData, func: 'getFromS3', obj: 'Files'
				});
				this.project = applicationData;
				if (has(applicationData, 'frontend')) {
					return this.get();
				} else {
					logger.error({
						description: 'Files does not have Frontend to get files from.',
						func: 'getFromS3', obj: 'Files'
					});
					return Promise.reject({
						message: 'Files does not have frontend to get files from.'
					});
				}
			}, err => {
				logger.error({
					description: 'Files Frontend data not available. Make sure to call .get().',
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
			const s3 = new AWS.S3();
			const listParams = {Bucket: this.project.frontend.bucketName};
			return new Promise((resolve, reject) => {
				s3.listObjects(listParams, (err, data) => {
					if (!err) {
						logger.info({
							description: 'Files list loaded.', filesData: data,
							func: 'get', obj: 'Files'
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
	 * @description build child structure from files list
	 */
	buildStructure() {
		logger.debug({
			description: 'Build Structure called.',
			func: 'buildStructure', obj: 'Files'
		});
		return this.get().then(filesArray => {
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Files'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Files'
			});
			return childStruct;
		}, error => {
			logger.error({
				description: 'Error getting application files.',
				error, func: 'buildStructure', obj: 'Files'
			});
			return Promise.reject({
				message: 'Error getting files.',
				error
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
			func: 'syncStructure', obj: 'Files'
		});
		return this.sync().then(filesArray => {
			logger.log({
				description: 'Child struct from array.',
				childStruct, func: 'syncStructure', obj: 'Files'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStruct, func: 'syncStructure', obj: 'Files'
			});
			return childStruct;
		}, error => {
			logger.error({
				description: 'Error getting application files.',
				error, func: 'syncStructure', obj: 'Files'
			});
			return Promise.reject({
				message: 'Error getting files.',
				error
			});
		});
	}
}
//------------------ Utility Functions ------------------//
// AWS Config
function setAWSConfig() {
	return AWS.config.update({
		credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: config.aws.cognito.poolId
	}),
		region: config.aws.region
	});
}
function getContentFromFile(fileData) {
	//Get initial content from local file
	logger.debug({
		description: 'getContentFromFile called', fileData,
		func: 'getContentFromFile', obj: 'Files'
	});
	return new Promise(resolve => {
		try {
			let reader = new FileReader();
			logger.debug({
				description: 'reader created', reader,
				func: 'getContentFromFile', obj: 'Files'
			});
			reader.onload = e => {
				const contents = e.target.result;
				logger.debug({
					description: 'Contents loaded', contents,
					func: 'getContentFromFile', obj: 'Files'
				});
				resolve(contents);
			}
			reader.readAsText(fileData);
		} catch(error){
			logger.error({
				description: 'Error getting file contents.', error,
				func: 'getContentFromFile', obj: 'Files'
			});
			reject(error);
		}
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
	let mappedStructure = fileArray.map((file) => {
		return buildStructureObject(file);
	});
	return combineLikeObjs(mappedStructure);
}
/**
 * @description Convert file with key into a folder/file children object
 * @private
 */
function buildStructureObject(file) {
	let pathArray;
	// console.log('buildStructureObject with:', file);
	if (has(file, 'path')) {
		//Coming from files already having path (structure)
		pathArray = file.path.split('/');
	} else if (has(file, 'Key')) {
		//Coming from aws
		pathArray = file.Key.split('/');
		// console.log('file before pick:', file);
		file = pick(file, 'Key');
		file.path = file.Key;
		file.name = file.Key;
	} else {
		logger.error({
			description: 'Invalid file.', file: file,
			func: 'buildStructureObject', obj: 'Files'
		});
	}
	let currentObj = file;
	if (pathArray.length == 1) {
		currentObj.name = pathArray[0];
		if (!has(currentObj,'type')) {
			currentObj.type = 'file';
		}
		currentObj.path = pathArray[0];
		return currentObj;
	} else {
		let finalObj = {};
		each(pathArray, (loc, ind, list) => {
			if (ind != list.length - 1) {//Not the last loc
				currentObj.name = loc;
				currentObj.path = take(list, ind + 1).join('/');
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
	let takenNames = [];
	let finishedArray = [];
	each(mappedArray, (obj) => {
		if (takenNames.indexOf(obj.name) == -1) {
			takenNames.push(obj.name);
			finishedArray.push(obj);
		} else {
			let likeObj = findWhere(mappedArray, {name: obj.name});
			//Combine children of like objects
			likeObj.children = union(obj.children, likeObj.children);
			likeObj.children = combineLikeObjs(likeObj.children);
			// logger.log('extended obj:',likeObj);
		}
	});
	return finishedArray;
}
