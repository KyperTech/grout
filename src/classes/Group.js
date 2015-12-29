import matter from './Matter';
import {isString} from 'lodash';
const {logger} = matter.utils;
import Action from './Action';

export default class Group extends Action {
	constructor(actionData) {
		super('group', actionData);
	}
	/**
	 * @description Add accounts to a group
	 * @param {Array} accounts - List of accounts ids to add to group
	 * @return {Promise}
	 */
	addAccounts(accountsData) {
		logger.log({
			description: 'Group updated called.', accountsData: accountsData,
			func: 'update', obj: 'Group'
		});
		let accountsArray = accountsData;
		//Handle provided data being a string list
		if (isString(accountsData)) {
			accountsArray = accountsData.split(',');
		}
		//Check item in array to see if it is a string (username) instead of _id
		if (isString(accountsArray[0])) {
			logger.warn({
				description: 'Accounts array only currently supports account._id not account.username.',
				accountsData, func: 'update', obj: 'Group'
			});
			return Promise.reject({
				message: 'Accounts array only currently supports account._id not account.username.'
			});
		}
		logger.log({
			description: 'Updating group with accounts array.',
			accountsArray, func: 'update', obj: 'Group'
		});
		return this.update({accounts: accountsArray}).then(response => {
			logger.info({
				description: 'Account(s) added to group successfully.',
				response, func: 'addAccounts', obj: 'Group'
			});
			return response;
		})['catch'](error => {
			logger.error({
				description: 'Error addAccountseting group.',
				error, func: 'addAccounts', obj: 'Group'
			});
			return Promise.reject(error.response.text || error.response);
		});
	}
}
