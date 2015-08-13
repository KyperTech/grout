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

###getcurrentUser()
Get currently logged in user.

Example: 
```
Matter.getCurrentUser().then(function(){ console.log('User logged in')});
```

###getAuthToken()
Get Auth token for currently logged in user

Example: `var token = Matter.getAuthToken();`

###getApps()
Log user in provided username/email and password.

Example: 
```
Matter.getApps().then(function(appsList){ console.log('Users apps:', appsList)});
```
