import config from '../config';
// import Template from '../classes/Template';
import matter from '../classes/Matter';
let request = matter.utils.request;
let logger = matter.utils.logger;
//Actions for specific user
class TemplateAction {
	constructor(templateName) {
		//Call matter with name and settings
		if (templateName) {
			this.name = templateName;
		} else {
			logger.error({description: 'Template name is required to start a TemplateAction', func: 'construcotr', obj: ''});
			throw new Error('Template name is required to start a TemplateAction');
		}
	}
	get templateEndpoint() {
		return `${matter.endpoint}/templates/${this.name}`;
	}
	//Get userlications or single userlication
	get() {
		logger.log({description: 'Get template called.', name: this.name, func: 'get', obj: 'TemplateAction'});
		return request.get(this.templateEndpoint).then((response) => {
			logger.log({description: 'Get template responded.', response: response, func: 'get', obj: 'TemplateAction'});
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error getting template.', error: errRes, func: 'get', obj: 'TemplateAction'});
			return Promise.reject(errRes);
		});
	}
	//Update an userlication
	update(templateData) {
		logger.log({description: 'Update template called.', templateData: templateData, func: 'update', obj: 'TemplateAction'});
		return request.put(this.templateEndpoint, templateData).then((response) => {
			logger.log({description: 'Update template responded.', response: response, templateData: templateData, func: 'update', obj: 'TemplateAction'});
			//TODO: Return template object
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error updating template.', error: errRes, func: 'update', obj: 'TemplateAction'});
			return Promise.reject(errRes);
		});
	}
	//Delete a template
	del(templateData) {
		logger.log({description: 'Delete template called.', templateData: templateData, func: 'del', obj: 'TemplateAction'});
		return request.delete(this.endpoint, templateData).then((response) => {
			logger.log({description: 'Template deleted successfully.', response: response, func: 'del', obj: 'TemplateAction'});
			//TODO: Return template object
			return response;
		})['catch']((errRes) => {
			logger.error({description: 'Error deleting template.', error: errRes, func: 'del', obj: 'TemplateAction'});
			return Promise.reject(errRes);
		});
	}
}

export default TemplateAction;
