import config from './config';
import {has, isString} from 'lodash';
import Action from './classes/Action';

export class Accounts extends Action {
  constructor(actionData) {
    super('accounts', actionData);
  }
}
export class Account extends Action {
  constructor(actionData) {
    super('account', actionData);
  }
}
export class Projects extends Action {
  constructor(actionData) {
    super('apps', actionData);
  }
}
export class Project extends Action {
  constructor(actionData) {
    super('app', actionData);
  }
}
export class Groups extends Action {
  constructor(actionData) {
    super('groups', actionData);
  }
}
export class Group extends Action {
  constructor(actionData) {
    super('group', actionData);
  }
}
export class Templates extends Action {
  constructor(actionData) {
    super('templates', actionData);
  }
}
export class Template extends Action {
  constructor(actionData) {
    super('template', actionData);
  }
}
