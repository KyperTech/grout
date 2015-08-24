import config from '../config';
import _ from 'underscore';

class Folder {
	constructor(fileData) {
		this.type = 'folder';
		if (fileData && !_.isString(fileData)) {
			_.extend(this, fileData);
		}
	}
}

export default Folder;
