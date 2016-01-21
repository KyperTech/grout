import { extend, has, isString, isObject, last } from 'lodash';
import FileSystemEntity from './FileSystemEntity';
import matter from './Matter';
const { logger } = matter.utils;
class Folder extends FileSystemEntity {
	constructor(project, path, name) {
		super(project, path, name);
		this.entityType = 'folder';
	}

}

export default Folder;
