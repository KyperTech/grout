import FileSystemEntity from './FileSystemEntity';
import matter from './Matter';
const { logger } = matter.utils;

export default class Folder extends FileSystemEntity {
	constructor(project, path, name) {
		super(project, path, name);
		this.entityType = 'folder';
		logger.debug({
			description: 'Folder object created.', folder: this,
			func: 'constructor', obj: 'Folder'
		});
	}
}
