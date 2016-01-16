# Grout

[![npm version](https://img.shields.io/npm/v/kyper-grout.svg?style=flat-square)](https://www.npmjs.com/package/kyper-grout)
[![npm downloads](https://img.shields.io/npm/dm/kyper-grout.svg?style=flat-square)](https://www.npmjs.com/package/kyper-grout)
[![build status](https://img.shields.io/travis/KyperTech/grout/master.svg?style=flat-square)](https://travis-ci.org/KyperTech/grout)
[![dependencies status](https://img.shields.io/david/KyperTech/grout/master.svg?style=flat-square)](https://david-dm.org/KyperTech/grout)
[![codeclimate](https://img.shields.io/codeclimate/github/KyperTech/grout.svg?style=flat-square)](https://codeclimate.com/github/KyperTech/grout)
[![coverage](https://img.shields.io/codeclimate/coverage/github/KyperTech/grout.svg?style=flat-square)](https://codeclimate.com/github/KyperTech/grout)
[![license](https://img.shields.io/npm/l/kyper-grout.svg?style=flat-square)](https://github.com/KyperTech/grout/blob/master/LICENSE)

Client library to simplify communication with Tessellate application building service.

## Getting Started

Grout is isomorphic, so it can be used within a front-end or on a server. Below are options for setups:

### NodeJS
1. Install:
    `npm install --save kyper-grout`

2. Include and use `kyper-grout`:

    ```javascript
    var Grout = require('kyper-grout');
  var grout = new Grout();
    ```

### ES6
1. Install:
    `npm install --save kyper-grout`

2. Include and use `kyper-grout`:

    ```javascript
  import Grout from 'kyper-grout';
  let grout = new Grout();
    ```

### Browser
  1. Include the Grout library using one of the following:
    #### CDN
    Add script tag to index.html:

      ```html
      <script src="http://cdn.kyper.io/js/grout/0.1.8/grout.js"></script>
      ```

    #### Bower
    Run `bower install --save kyper-grout`
    Then include the following in your index.html:
    ```html
    <script src="./bower_components/kyper-grout/dist/grout.js"></script>
    ```
  2. Begin using grout:

    ```javascript
    var grout = new Grout();
    if(grout.isLoggedIn){
      console.log('The currently logged in user is', grout.currentUser);
    } else {
      console.warn('Not logged into grout');
    }
    ```

## Documentation

### [API Documentation](https://github.com/KyperTech/grout/wiki/API-Documentation)

### [Main Wiki](https://github.com/KyperTech/grout/wiki)
