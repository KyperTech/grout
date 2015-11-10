import {extend, isString} from 'lodash';

class Folder {
	constructor(fileData) {
		this.type = 'folder';
		if (fileData && !isString(fileData)) {
			extend(this, fileData);
		}
	}
}

export default Folder;
