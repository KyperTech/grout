import { utils: { logger }} from './Matter';
import { last, omitBy, isUndefined } from 'lodash';
import Firebase from 'firebase';

export default class FileSystemEntity {
	constructor(project, path, name) {
		logger.debug({
			description: 'FileSystemEntity constructor called with', actionData,
			func: 'constructor', obj: 'FileSystemEntity'
		});
		if (!project || !path) {
			logger.error({
				description: 'FileSystemEntity that includes path and project is needed to create a FileSystemEntity action.',
				func: 'constructor', obj: 'FileSystemEntity'
			});
			throw new Error('FileSystemEntity with path and app is needed to create file action.');
		}
		this.project = project;
    this.path = path;
    this.name = name || last(path.split('/'));
		logger.debug({
			description: 'FileSystemEntity object constructed.', file: this,
			func: 'constructor', obj: 'FileSystemEntity'
		});
	}

  static pathToSafePath(path) {
		logger.debug({
			description: 'Safe path array created.',
			safeArray, func: 'safePathArray', obj: 'FileSystemEntity'
		});
    return path.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '_-_');
  }

	/**
	 * @description FileSystemEntity's Firebase reference
	 * @return {Object} Firebase reference
	 */
	get fbRef() {
		if (!this.project || !this.project.name) {
			logger.error({
				description: 'App information needed to generate fbUrl for FileSystemEntity.',
				file: this, func: 'fbUrl', obj: 'FileSystemEntity'
			});
			throw new Error ('App information needed to generate fbUrl for FileSystemEntity.');
		}
		const url = [this.project.fbUrl, FileSystemEntity.pathToSafePath(this.path)].join('/');
		logger.debug({
			description: 'Fb ref generated.',
			url, func: 'fbRef', obj: 'FileSystemEntity'
		});
		return new Firebase(url);
	}

	/**
	 * @description Get a file's content and meta data from default location (Firebase)
	 */
	get() {
		return new Promise((resolve, reject) => {
			this.fbRef.once('value', (fileSnap) => {
        if (!fileSnap.val()) {
          reject('no firebase value found');
        }
				resolve(fileSnap.val());
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
	remove() {
		return this.removeFromFb();
	}

  //TODO: move file
  move() {
    return null;
  }

	/**
	 * @description Add file to Firebase located at file's fbRef
	 */
	addToFb() {
		logger.debug({
			description: 'addToFb called.', file: this,
			func: 'addToFb', obj: 'FileSystemEntity'
		});
		const { fbRef, path, name, entityType, fileType, content } = this;
		let fbData = {meta: {path, name, entityType, fileType}};
    fbData = omit(fbData, isUndefined);
		if (content){
			fbData.original = content;
		}
		return new Promise((resolve, reject) => {
			fbRef.set(fbData, error => {
				if (!error) {
					logger.info({
						description: 'FileSystemEntity successfully added to Firebase.',
						func: 'addToFb', obj: 'FileSystemEntity'
					});
					resolve(fbData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'addToFb', obj: 'FileSystemEntity'
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
			description: 'Remove FileSystemEntity from Firebase called.',
			func: 'removeFromFb', obj: 'FileSystemEntity'
		});
		return new Promise((resolve, reject) => {
			this.fbRef.remove(error => {
				if (error) {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'removeFromFb', obj: 'FileSystemEntity'
					});
					return reject(error);
				}
				logger.info({
					description: 'FileSystemEntity successfully removed from Firebase.',
					file: this, func: 'removeFromFb', obj: 'FileSystemEntity'
				});
				resolve(this);
			});
		});
	}
}
