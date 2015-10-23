import Matter from 'kyper-matter';
import {extend} from 'lodash';

let instance = null;
class MatterInstance {
	constructor(appName, options) {
		if (!instance) {
      instance = new Matter(appName, options);
    }
		console.log({description: 'Matter object created.', config: instance, func: 'constructor', obj: 'Matter'});
		return instance;
	}
}
let matter = new MatterInstance('tessellate');
export default matter;
