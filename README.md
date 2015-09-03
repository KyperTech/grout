# Grout
<p align="center">
  <!-- Npm Version -->
  <a href="https://npmjs.org/package/kyper-grout">
    <img src="https://img.shields.io/npm/v/kyper-grout.svg" alt="npm version">
  </a>
  <!-- Build Status -->
  <a href="https://travis-ci.org/KyperTech/grout">
    <img src="http://img.shields.io/travis/KyperTech/grout.svg" alt="build status">
  </a>
  <!-- Dependency Status -->
  <a href="https://david-dm.org/KyperTech/grout">
    <img src="https://david-dm.org/KyperTech/grout.svg" alt="dependency status">
  </a>
  <!-- Codeclimate -->
  <a href="https://codeclimate.com/github/kypertech/grout">
    <img src="https://codeclimate.com/github/KyperTech/grout/badges/gpa.svg" alt="codeclimate">
  </a>
  <!-- Coverage -->
  <a href="https://codeclimate.com/github/KyperTech/grout">
    <img src="https://codeclimate.com/github/KyperTech/grout/badges/coverage.svg" alt="coverage">
  </a>
  <!-- License -->
  <a href="https://github.com/KyperTech/grout/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/kyper-grout.svg" alt="license">
  </a>
</p>

Client library to simplify communication with Tessellate application building service.

## Getting Started

Grout is isomorphic, so it can be used within a frontend or on a server. Below are setups for both:

### Browser
1. Include the Grout library using one of the following:
  #### CDN
  Add script tag to index.html:
    
    ```html
    <script src="http://cdn.kyper.io/js/grout/0.0.1/grout.js"></script>
    ```

  #### Bower
  Run `bower install --save kyper-grout`

### Node
1. Run:
    ```
    npm install --save kyper-grout
    ```
2. Include and use grout

    ```javascript
    require('grout');
    var grout = new Grout();
    ```
    **or in ES6:**
    ```javascript
    import Grout from ('grout');
    let grout = new Grout();
    ```
## Documentation

### Logout()
Log current user out
Example: 
```
grout.logout().then(function(){ console.log('User logged out')});}
```

### Login()
Log user in provided username/email and password.

Example: 
```
grout.login({username: 'test', password: 'test'})
.then(function(){ console.log('User logged in')});
```

###Signup()
Create a new user and login

Example: 
```
grout.signup({username: 'test', name:'Test User', password: 'test'})
.then(function(){ console.log('User logged in')});
```

###getCurrentUser()
Get currently logged in user.

Example: 
```
grout.getCurrentUser().then(function(){ console.log('User logged in')});
```

###getAuthToken()
Get Auth token for currently logged in user

Example: `var token = grout.getAuthToken();`

### apps
Begin an applications action such as creating a new application or getting this list of applications

#### apps.get()

Get list of applications.

Get List Example: 
```
//Get list of all of your apps
grout.apps.get().then(function(appsList){ console.log('Users apps:', appsList)});
```


#### apps.add(appData)

Add a new application:

```
//Delete example app
var appData = {name:'newApp1', frontend:{bucket:{url:"", }}, collaborators:[]};
grout.apps.add(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

### app(appName)
Begin an singular application action such as getting an existing application's data or modifying/deleting it.

#### app(appName).get()

Get Application: 
```
//Get app named example app
grout.app('exampleApp').get().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```


#### app(appName).update(updateData)

Update an application:

```
//Update exampleApp to the new name: newAppName
var appData = {name:'newAppName'};
grout.apps('exampleApp').update(appData).then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### app(appName).del()

Delete an application:

```
//Delete example app
grout.app('exampleApp').del().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```


#### app(appName).getFiles()
Get Application's files:
```
//Get app named example app
grout.app('exampleApp').getFiles().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```

#### app(appName).getStructure()
Get Files/Folders in structure/children format:
```
//Get app named example app
grout.app('exampleApp').getStructure().then(function(appData){ 
    console.log('Application data for exampleApp:', appData);
});
```