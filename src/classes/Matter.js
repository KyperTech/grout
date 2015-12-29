import config from '../config';
import Matter from 'kyper-matter';

let matter = new Matter(config.appName, config.matterOptions);
let { logger, request } = matter.utils;
export default matter;
export { logger, request };
