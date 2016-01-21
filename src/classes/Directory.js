import config from '../config';
import { toArray, isArray, has, pick, take, each, findWhere, union, clone, extend } from 'lodash';
import matter from './Matter';
import Firebase from 'firebase';
import Project from './Project';
import File from './File';
import Folder from './Folder';
import * as S3 from '../utils/s3';
//Convenience vars
const { logger } = matter.utils;

export default class Directory {
	constructor(project) {
		logger.debug({
			description: 'Directory object constructed.',
			func: 'constructor', obj: 'Directory', dir: this
		});
		if(!project) {
			throw new Error('Project is required to create directory');
		}
		this.project = project;
	}

	/**
	 * @description Firebase reference of directory
	 */
	get fbRef() {
		logger.debug({
			description: 'Url created for directory fbRef.',
			url: this.project.fbUrl, func: 'fbRef', obj: 'Directory'
		});
		return new Firebase(this.project.fbUrl);
	}



	/**
	 * @description Get files list single time
	 */
	get() {
		logger.log({
			description: 'Directory get called.',
			func: 'get', obj: 'Directory'
		});
		return new Promise(resolve => {
			this.fbRef.once('value', filesSnap => {
				logger.info({
					description: 'Directory loaded from firebase.',
					func: 'get', obj: 'Directory'
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
					description: 'Directory array built.',
					filesArray, func: 'get', obj: 'Directory'
				});
				resolve(filesArray);
			});
		});
	}

	/**
	 * @description Get synced files list from firebase
	 */
	sync(callback) {
		// TODO: get files list from firebase
		logger.debug({
			description: 'Directory sync called.',
			func: 'sync', obj: 'Directory'
		});
		this.listenerCallback = callback;
		return this.fbRef.on('value', this.listenerCallback);
	}

	/**
	 * @description Get synced files list from firebase
	 */
	unsync() {
		// TODO: get files list from firebase
		logger.debug({
			description: 'Directory sync called.',
			func: 'sync', obj: 'Directory'
		});
		return this.fbRef.off('value', this.listenerCallback);
	}



	/**
	 * @description Add a new file or files
	 * @param {Object|Array} fileData - Array of objects or single object containing file data
	 * @param {Object} fileData.path - Path of file relative to project
	 */
	addFile(objData) {
		//TODO: Allow for options of where to add the file to
		if(isArray(objData)){
			return this.upload(objData);
		}
		return this.addToFb(objData);
	}

	/**
	 * @description Add a folder
	 * @param {string} path - Path of where the folder should be saved
	 * @param {String} name - optionally provide name of folder
	 */
	addFolder(path, name) {
		let folder = new Folder(this.project, path, name);
		return folder.save();
	}

	/**
	 * @description Add multiple files/folders to project files
	 * @param {Array} filesData - Array of file objects to upload
	 */
	upload(filesData) {
		//TODO: Allow for options of where to add the file to
		if(!isArray(filesData)){
			return this.addToFb(filesData);
		} else {
			logger.warn({
				description: 'Upload called with multiple files.', filesData,
				project: this.project, func: 'upload', obj: 'Directory'
			});
			let promises = [];
			each(filesData, file => {
				promises.push(this.addToFb(file));
			});
			return Promise.all(promises).then(resultsArray => {
				logger.info({
					description: 'Directory uploaded successfully.', resultsArray,
					func: 'upload', obj: 'Directory'
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
	 * @description Add a file to Firebase
	 * @param {Object} fileData - Data object for new file
	 * @param {String} fileData.path - Path of file within project
	 * @param {String} fileData.content - Content of file
	 */
	addToFb(addData) {
		logger.debug({
			description: 'Add to fb called.', addData,
			func: 'addToFb', obj: 'Directory'
		});
		if (!addData) {
			logger.debug({
				description: 'Object data is required to add.', addData,
				func: 'addToFb', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Object data is required to add.'
			});
		}
		//Array of files/folder to upload
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
				func: 'addToFb', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Invalid file data. Path must be included.'
			});
		}
		if (type && type === 'folder') {
			return new Folder(this.project, path, name).save();
		} else {
			return new File(this.project, path, name).save();
		}
	}

	/**
	 * @description Delete a file or folder from Firebase
	 * @param {Object} objData - Data of file or folder
	 * @param {String} path - Path of file or folder
	 */
	delFromFb(data) {
		logger.debug({
			description: 'Del from fb called.', data,
			func: 'delFromFb', obj: 'Directory'
		});
		if (!data || !data.path) {
			logger.error({
				description: 'Invalid file data. Path must be included.',
				func: 'delFromFb', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Invalid file data. Path must be included.'
			});
		}
		let file = new File({project: this.project, data});
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
	//  TODO: Handle folders
	addLocalToFb(data) {
		logger.debug({
			description: 'Add local to fb called.', data,
			func: 'addLocalToFb', obj: 'Directory'
		});
		if (!data) {
			logger.error({
				description: 'File is required to upload to Firebase.',
				func: 'addLocalToFb', obj: 'Directory'
			});
			return Promise.reject({
				message: 'File is required to upload to Firebase.'
			});
		}
		return getContentFromFile(data).then(content => {
			logger.debug({
				description: 'Content loaded from local file.', content,
				func: 'addLocalToFb', obj: 'Directory'
			});
			data.content = content;
			data.path = data.name;
			const file = new File({project: this.project, data});
			logger.info({
				description: 'File object created.', file,
				func: 'addLocalToFb', obj: 'Directory'
			});
			return file.save();
		});
	}

	getFrontEnd() {
		if (this.project && this.project.frontend) {
			return Promise.resolve(this.project);
		}
		logger.warn({
			description: 'Directory Frontend data not available. Calling .get().',
			project: this.project, func: 'getFromS3', obj: 'Directory'
		});
		return this.project.get().then(applicationData => {
			logger.log({
				description: 'Directory get returned.',
				data: applicationData, func: 'getFromS3', obj: 'Directory'
			});
			this.project = applicationData;
			if (has(applicationData, 'frontend')) {
				return this.get();
			}
			logger.error({
				description: 'Directory does not have Frontend to get files from.',
				func: 'getFromS3', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Directory does not have frontend to get files from.'
			});
		}, err => {
			logger.error({
				description: 'Directory Frontend data not available. Make sure to call .get().',
				error: err, func: 'getFromS3', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Bucket name required to get objects'
			});
		});
	}

	/**
	 * @description Get files list from S3
	 */
	getFromS3() {
		if (!this.project || !this.project.frontend || !this.project.frontend.bucketName) {
			logger.warn({
				description: 'Directory Frontend data not available. Calling .get().',
				project: this.project, func: 'getFromS3', obj: 'Directory'
			});
			return this.getFrontEnd().then(this.getFromS3);
		}
		const s3 = S3.init();
		s3.listObjects({bucket: this.project.frontend.bucketName}).then(filesList => {
			logger.info({
				description: 'Directory list loaded.', filesList,
				func: 'get', obj: 'Directory'
			});
			return filesList;
		}, error => {
			logger.error({
				description: 'Error getting files from S3.',
				error, func: 'get', obj: 'Directory'
			});
			return Promise.reject(error);
		});
	}

	/**
	 * @description build child structure from files list
	 */
	buildStructure() {
		logger.debug({
			description: 'Build Structure called.',
			func: 'buildStructure', obj: 'Directory'
		});
		return this.get().then(filesArray => {
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Directory'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStructure: childStruct,
				func: 'buildStructure', obj: 'Directory'
			});
			return childStruct;
		}, error => {
			logger.error({
				description: 'Error getting application files.',
				error, func: 'buildStructure', obj: 'Directory'
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
			func: 'syncStructure', obj: 'Directory'
		});
		return this.sync().then(filesArray => {
			logger.log({
				description: 'Child struct from array.',
				childStruct, func: 'syncStructure', obj: 'Directory'
			});
			const childStruct = childrenStructureFromArray(filesArray);
			//TODO: have child objects have correct classes (file/folder)
			logger.log({
				description: 'Child struct from array.',
				childStruct, func: 'syncStructure', obj: 'Directory'
			});
			return childStruct;
		}, error => {
			logger.error({
				description: 'Error getting application files.',
				error, func: 'syncStructure', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Error getting files.',
				error
			});
		});
	}
}
//------------------ Utility Functions ------------------//
function getContentFromFile(fileData) {
	//Get initial content from local file
	logger.debug({
		description: 'getContentFromFile called', fileData,
		func: 'getContentFromFile', obj: 'Directory'
	});
	return new Promise(resolve => {
		try {
			let reader = new FileReader();
			logger.debug({
				description: 'reader created', reader,
				func: 'getContentFromFile', obj: 'Directory'
			});
			reader.onload = e => {
				const contents = e.target.result;
				logger.debug({
					description: 'Contents loaded', contents,
					func: 'getContentFromFile', obj: 'Directory'
				});
				resolve(contents);
			};
			reader.readAsText(fileData);
		} catch(error){
			logger.error({
				description: 'Error getting file contents.', error,
				func: 'getContentFromFile', obj: 'Directory'
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
			func: 'buildStructureObject', obj: 'Directory'
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
				if (ind === 0) {
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
