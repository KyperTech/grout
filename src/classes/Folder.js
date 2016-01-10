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
	get fbUrl() {
		let files = new Files(this);
		return `${this.Files.fbUrl}/this.path`;
	}
	get fbRef() {
		const { fbRef } = this.Files;
		let fbRef = new Files(this).fbRef;
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
		return this.Files.remove(this);
	}
	add() {
		return this.Files.add(this);
	}
}

export default Folder;
