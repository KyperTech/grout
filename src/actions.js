import Action from './classes/Action';
export Group from './classes/Group';

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

export class Groups extends Action {
  constructor(actionData) {
    super('groups', actionData);
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
