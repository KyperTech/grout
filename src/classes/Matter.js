import Matter from 'kyper-matter';
import merge from 'lodash/object/merge';

let instance = null;
class MatterInstance {
	constructor() {
		if (!instance) {
      instance = this;
    }
		// console.log({description: 'Matter object created.', config: merge(this, defaultMatter), func: 'constructor', obj: 'Matter'});
		return merge(instance, defaultMatter);
	}
}

export default MatterInstance;
