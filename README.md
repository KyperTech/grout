# matter-client

[![Travis build status](https://travis-ci.org/KyperTech/matter-client.svg?branch=master)](https://travis-ci.org/KyperTech/matter-client)
[![Code Climate](https://codeclimate.com/github/KyperTech/matter-client/badges/gpa.svg)](https://codeclimate.com/github/KyperTech/matter-client)
[![Test Coverage](https://codeclimate.com/github/KyperTech/matter-client/badges/coverage.svg)](https://codeclimate.com/github/KyperTech/matter-client)
[![Dependency Status](https://david-dm.org/KyperTech/matter-client.svg)](https://david-dm.org/KyperTech/matter-client)
[![devDependency Status](https://david-dm.org/KyperTech/matter-client/dev-status.svg)](https://david-dm.org/KyperTech/matter-client#info=devDependencies)

Client library to simplify communication with Matter application building service.

## Documentation

### Logout()
Log current user out
Example: 
```
Matter.logout().then(function(){ console.log('User logged out')});}
```

### Login()
Log user in provided username/email and password.

Example: 
```
Matter.login({username: 'test', password: 'test'})
.then(function(){ console.log('User logged in')});
```

###Signup()
Create a new user and login

Example: 
```
Matter.signup({username: 'test', name:'Test User', password: 'test'})
.then(function(){ console.log('User logged in')});
```

###getCurrentUser()
Get currently logged in user.

Example: 
```
Matter.getCurrentUser().then(function(){ console.log('User logged in')});
```

###getAuthToken()
Get Auth token for currently logged in user

Example: `var token = Matter.getAuthToken();`

### apps
Begin an applications action such as creating a new application or getting this list of applications

#### apps.get()

Get list of applications.

Get List Example: 
```
//Get list of all of your apps
Matter.apps.get().then(function(appsList){ console.log('Users apps:', appsList)});
```


#### apps.add(appData)

Add a new application:

```
//Delete example app
var appData = {name:'newApp1', frontend:{bucket:{url:"", }}, collaborators:[]};
Matter.apps.add(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

### app(appName)
Begin an singular application action such as getting an existing application's data or modifying/deleting it.

#### app(appName).get()

Get Application: 
```
//Get app named example app
Matter.app('exampleApp').get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```


#### app(appName).update(updateData)

Update an application:

```
//Update exampleApp to the new name: newAppName
var appData = {name:'newAppName'};
Matter.apps('exampleApp').update(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### app(appName).del()

Delete an application:

```
//Delete example app
Matter.app('exampleApp').del().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```


#### app(appName).getFiles()
Get Application's files:
```
//Get app named example app
Matter.app('exampleApp').getFiles().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### app(appName).getStructure()
Get Files/Folders in structure/children format:
```
//Get app named example app
Matter.app('exampleApp').getStructure().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```