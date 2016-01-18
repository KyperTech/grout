import { extend, has, isString, isObject, last } from 'lodash';
import Files from './Files';
import FileSystemEntity from './FileSystemEntity';
import matter from './Matter';
const { logger } = matter.utils;
class Folder extends FileSystemEntity {
	constructor(project, path, name) {
		super(project, path, name);
		this.entityType = 'folder';
	}

	/**
	 * @description Add folder to project
	 * @return {Promise}
	 */
	add() {
		return this.addToFb();
	}

}

export default Folder;
