import {extend, isString} from 'lodash';
import Files from './Files';
import matter from './Matter';
const { logger } = matter.utils;
class Folder {
	constructor(folderData) {
		this.type = 'folder';
		if (!folderData || (!isString(folderData) && !isObject(folderData))) {
			throw new Error('Folder name or path required.');
		}
		if (isString(folderData)) {
			return this.path = folderData;
		}
		extend(this, folderData);
	}
	get Files() {
		return new Files(this);
	}
	get fbUrl() {
		return this.Files.fbUrl;
	}
	get fbRef() {
		const { fbRef } = this.Files;
		logger.debug({
			description: 'fbRef generated.', fbRef,
			func: 'fbRef', obj: 'Folder'
		});
		return fbRef;
	}
	save() {
		return this.add;
	}
	remove() {

	}
	add() {
		//TODO: Handle adding files to folder
		return this.addToFb();
	}
	addToFb() {
		logger.debug({
			description: 'addToFb called.', folder: this,
			func: 'addToFb', obj: 'Folder'
		});
		const { fbRef, path, name } = this;
		const fbData = {meta: {path, name, type: 'folder'}};
		return new Promise((resolve, reject) => {
			fbRef.set(fbData, error => {
				if (!error) {
					logger.info({
						description: 'File successfully added to Firebase.',
						func: 'addToFb', obj: 'Folder'
					});
					resolve(fbData);
				} else {
					logger.error({
						description: 'Error creating file on Firebase.',
						error, func: 'addToFb', obj: 'Folder'
					});
					reject(error);
				}
			});
		});
	}
}

export default Folder;
