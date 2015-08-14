# matter-client


[![Travis build status](https://travis-ci.org/KyperTech/matter-client.svg?branch=master)](https://travis-ci.org/kypertech/matter-client)
[![Code Climate](https://codeclimate.com/github/KyperTech/matter-client/badges/gpa.svg)](https://codeclimate.com/github/kypertech/matter-client)
[![Test Coverage](https://codeclimate.com/github/KyperTech/matter-client/badges/coverage.svg)](https://codeclimate.com/github/KyperTech/matter-client)
[![Dependency Status](https://david-dm.org/kypertech/matter-client.svg)](https://david-dm.org/kypertech/matter-client)
[![devDependency Status](https://david-dm.org/kypertech/matter-client/dev-status.svg)](https://david-dm.org/kypertech/matter-client#info=devDependencies)

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

### apps(appName)
Begin an app action such as creating a new application or getting an application's data. Providing a name makes the action apply to a specific application matching the name provided.

#### apps().get()

Get list of applications or data for a specific application.

Get List Example: 
```
//Get list of all of your apps
Matter.apps().get().then(function(appsList){ console.log('Users apps:', appsList)});
```

Get Application: 
```
//Get app named example app
Matter.apps('exampleApp').get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### apps().get()

Get list of applications or data for a specific application.

Get List Example: 
```
//Get list of all of your apps
Matter.apps().get().then(function(appsList){ console.log('Users apps:', appsList)});
```

Get Application: 
```
//Get app named example app
Matter.apps('exampleApp').get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### apps().add(appData)

Add a new application:

```
//Delete example app
var appData = {name:'newApp1', frontend:{bucket:{url:"", }}, collaborators:[]};
Matter.apps().add(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### apps(appName).update()

Update an application:

```
//Update exampleApp to the new name: newAppName
var appData = {name:'newAppName'};
Matter.apps('exampleApp').update(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### apps(appName).del()

Delete an application:

```
//Delete example app
Matter.apps('exampleApp').del().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```


#### apps().files().get()
Get Application's files:
```
//Get app named example app
Matter.apps('exampleApp').files().get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### apps().structure().get()
Get Files/Folders in structure/children format:
```
//Get app named example app
Matter.apps('exampleApp').structure().get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```