import config from '../config';
import Matter from 'kyper-matter';
export default new Matter(config.appName, config.matterSettings);
