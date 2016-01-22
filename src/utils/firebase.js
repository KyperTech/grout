import config from '../config';
import Firebase from 'firebase';

export default class firebaseUtil {
	/**
	 * @description Path array that is built from Firebase Reference
	 * @private
	 */
	static pathArrayFromFbRef(ref) {
		//Handle fbUrls that have multiple levels
		let removeArray = config.fbUrl.replace('https://', '').split('/');
		removeArray.shift();
		const pathArray = ref.path.o.splice(0, removeArray.length);
		logger.info({
			description: 'Path array built.',
			pathArray, func: 'fbRef', obj: 'Directory'
		});
		return pathArray;
	}

	/**
	 * @description Path array that is built from Firebase Reference
	 */
	static pathToSafePath(path) {
		logger.debug({
			description: 'Safe path array created.',
			path, func: 'safePathArray', obj: 'FileSystemEntity'
		});
		return path.replace(/[.]/g, ':').replace(/[#$\[\]]/g, '_-_');
	}

	/**
	 * @description Firebase reference from relative location
	 * @param {String} location - Relative location to create firebase ref for
	 */

	static ref(location) {
		return new Firebase(this.url(location));
	}

	/**
	 * @description Path array that is built from Firebase Reference
	 */
	static url(location) {
		return `${config.fbUrl}/files/${location}`;
	}
}
/**
 * @description Load firepad from local or global
 */
function getFirepadLib() {
	logger.debug({
		description: 'Get firepad lib called',
		func: 'File => getFirepadLib', file: 'classes/File'
	});
	if (typeof window !== 'undefined' && window.Firepad && window.ace) {
		return window.Firepad;
	} else if (typeof global !== 'undefined' && global.Firepad && global.ace) {
		return global.Firepad;
	} else {
		logger.debug({
			description: 'Firepad does not currently exist.',
			func: 'fbRef', obj: 'File'
		});
		return null;
		//TODO: Correctly load firepad
		// dom.loadJs('https://cdn.firebase.com/libs/firepad/1.2.0/firepad.js');
		// if (typeof global !== 'undefined' && global.Firepad) {
		// 	return global.Firepad;
		// } else if (typeof window !== 'undefined' && window.Firepad) {
		// 	return window.Firepad;
		// } else {
		// 	logger.error({
		// 		description: 'Adding firepad did not help.',
		// 		func: 'fbRef', obj: 'File'
		// 	});
		// }
	}
}
