import { isArray, isString, has, each } from 'lodash';
import matter from './Matter';
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
			url: this.project.fbRef, func: 'fbRef', obj: 'Directory'
		});
		return this.project.fbRef;
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
	addFile(path, content) {
		let file = new File(this.project, path, content);
		return file.save();
	}

	/**
	 * @description Add a folder
	 * @param {string} path - Path of where the folder should be saved
	 * @param {String} name - optionally provide name of folder
	 */
	addFolder(path) {
		let folder = new Folder(this.project, path);
		return folder.save();
	}

	/**
	 * @description Add multiple files/folders to project files
	 * @param {Array} files - Array of file objects to upload
	 */
	upload(files) {
		return new Promise((resolve, reject) => {
			resolve(console.log('files', files));
		});
		//TODO: Allow for options of where to add the file to
		if(!isArray(files)){
			return this.addToFb(files);
		} else {
			logger.warn({
				description: 'Upload called with multiple files.', files,
				project: this.project, func: 'upload', obj: 'Directory'
			});
			let promises = [];
			each(files, file => {
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
	delFromFb(path) {
		logger.debug({
			description: 'Del from fb called.', path,
			func: 'delFromFb', obj: 'Directory'
		});
		if (!path || !isString(path)) {
			logger.error({
				description: 'Invalid file path. Path must be included.',
				func: 'delFromFb', obj: 'Directory'
			});
			return Promise.reject({
				message: 'Invalid file path. Path must be included to delete.'
			});
		}
		let file = new File(this.project, path);
		return new Promise((resolve, reject) => {
			file.fbRef.remove(file, err => {
				if(err){
					logger.error({
						description: 'Error deleting from Firebase.',
						func: 'delFromFb', obj: 'Directory'
					});
					return reject(err);
				}
				logger.info({
					description: 'Successfully deleted.',
					func: 'delFromFb', obj: 'Directory'
				});
				resolve({message: 'Delete successful.'});
			});
		});
	}
}
