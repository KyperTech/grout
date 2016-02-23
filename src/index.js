import { isString, isObject } from 'lodash'
import config from './config'
import Matter from 'kyper-matter'
import Project from './classes/Project'
import Group from './classes/Group'
import ApiAction from './classes/ApiAction'

/** Grout Class
 * @description Extending matter provides token storage and login/logout/signup capabilities
 */
export default class Grout extends Matter {
  constructor (projectName, groutOptions) {
    const name = (projectName && isString(projectName)) ? projectName : config.defaultProject
    let options = (groutOptions && isObject(groutOptions)) ? groutOptions : config.matterSettings
    if (isObject(projectName)) {
      options = projectName
    }
    super(name, config.matterSettings)
    config.applySettings(options)
  }

  /**
   * @description Projects action
   */
  Projects (username) {
    return new ApiAction(`users/${username}/projects`)
  }

  /**
   * @description Project action
   * @param {Object} projectData - Data of project with which to start action
   * @param {String} projectData.owner - Project Owner's username (in url)
   * @param {String} projectData.name - Name of project with which to start action
   */
  Project (name, owner) {
    return new Project(name, owner)
  }

  /**
   * @description Users action
   */
  get Users () {
    return new ApiAction('users')
  }

  /**
   * @description Users action
   * @param {Object|String} accountData - Data of account with which to start action
   * @param {String} accountData.username - Username of account with which to start action
   * @param {String} accountData.email - Email of account with which to start action
   */
  User (username) {
    return new ApiAction(`users/${username}`)
  }

  /**
   * @description Groups action
   */
  get Groups () {
    const action = new ApiAction('groups')
    return action
  }

  /**
   * @description Start a new Group action
   * @param {String} groupName - Name of group
   */
  Group (groupName) {
    const action = new Group(groupName)
    return action
  }

  /**
   * @description Start a new Templates ApiAction
   */
  get Templates () {
    const action = new ApiAction('templates')
    return action
  }

  /**
   * @description Start a new Template action
   * @param {String} templateName - Name of template
   */
  Template (templateName) {
    const action = new ApiAction(`templates/${templateName}`)
    return action
  }
}
