import { extend, isString } from 'lodash';
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
	get pathArrayFromRef() {
		if (!this.fbRef) {
			logger.error({
				description: 'Folder fbRef is required to get path array.', file: this,
				func: 'pathArrayFromRef', obj: 'Folder'
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
		const safeArray = this.pathArray.map(loc => {
			//Replace periods with colons and other unsafe chars as --
			return loc.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '--');
		});
		logger.debug({
			description: 'Safe path array created.',
			safeArray, func: 'safePathArray', obj: 'Folder'
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
		if (!this.project || !this.project.name) {
			logger.error({
				description: 'App information needed to generate fbUrl for Folder.',
				file: this, func: 'fbRef', obj: 'Folder'
			});
			throw new Error ('App information needed to generate fbUrl for Folder.');
		}
		let files = new Files({project: this.project});
		return [files.fbUrl, this.safePath].join('/');
	}
	get fbRef() {
		if (this.ref) {
			logger.log({
				description: 'File already has reference.',
				ref: this.ref, func: 'fbRef', obj: 'Folder'
			});
			return this.ref;
		}
		const ref = new Firebase(this.fbUrl)
		logger.debug({
			description: 'Fb ref generated.',
			ref, func: 'fbRef', obj: 'Folder'
		});
		return ref;
	}
	get fbUrl() {
		let files = new Files(this);
		return `${this.Files.fbUrl}`;
	}
	get fbRef() {
		let ref = new Files(this).fbRef;
		logger.debug({
			description: 'fbRef generated.', ref,
			func: 'fbRef', obj: 'Folder'
		});
		return ref;
	}
	FilesList() {
		return new Files({project: this.project});
	}
	save() {
		return this.add();
	}
	remove() {
		return this.Files.remove(this);
	}
	add() {
		return this.Files.add(this);
	}
}

export default Folder;
