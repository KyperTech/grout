import FileSystemEntity from './FileSystemEntity';
import matter from './Matter';
const { logger } = matter.utils;

export default class Folder extends FileSystemEntity {
	constructor(project, path, fileSystemEntities) {
		super(project, path);
		this.entityType = 'folder';
		logger.debug({
			description: 'Folder object created.', folder: this,
			func: 'constructor', obj: 'Folder'
		});
		this.children = fileSystemEntities;
	}

	getChildren() {
		return this.get().then(firebaseData => {
			delete firebaseData.key; delete firebaseData.meta;
			this.children = firebaseData;
			return this.children;
		});
	}

	addChild(fileSystemEntity) {
		this.children.push(fileSystemEntity);
	}
}
