'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.setConfig = setConfig;
exports.getObjects = getObjects;
exports.getObject = getObject;
exports.saveObject = saveObject;
exports.deleteObject = deleteObject;

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _Matter = require('../classes/Matter');

var _Matter2 = _interopRequireDefault(_Matter);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _Matter2.default.utils.logger;
/**
 * @description Initial AWS Config
 */

function init() {
  if (typeof _awsSdk2.default.config.credentials == 'undefined' || !_awsSdk2.default.config.credentials) {
    logger.log({
      description: 'AWS creds do not exist, so they are being set.',
      func: 'saveObject', obj: 'File'
    });
    setConfig();
  }
  if (typeof _awsSdk2.default.S3 === 'function') {
    return new _awsSdk2.default.S3();
  }
};
/**
 * @description Set AWS config credentials
 */
function setConfig() {
  return _awsSdk2.default.config.update({
    credentials: new _awsSdk2.default.CognitoIdentityCredentials({
      IdentityPoolId: _config2.default.aws.cognito.poolId
    }), region: _config2.default.aws.region
  });
};
/**
 * @description Get objects from S3 bucket
 * @param {String} bucket - Bucket name to get objects from
 */
function getObjects(bucket) {
  var listReq = { Bucket: bucket };
  var s3 = init();
  logger.debug({
    description: 'Getting objects for bucket.', listReq: listReq,
    func: 'getObject', obj: 's3'
  });
  return new Promise(function (resolve, reject) {
    s3.listObjects(listReq, function (error, data) {
      if (error) {
        logger.error({
          description: 'Error getting objects from S3.',
          error: error, func: 'getObject', obj: 's3'
        });
        return reject(error);
      }
      logger.debug({
        description: 'Objects list loaded.', filesData: data,
        func: 'getObject', obj: 's3'
      });
      resolve(data.Contents);
    });
  });
};
/**
 * @description Get object from S3
 */
function getObject(getData) {
  var bucket = getData.bucket;
  var path = getData.path;

  if (!bucket || !path) {
    logger.error({
      description: 'Bucket and path are required to get object.', getData: getData,
      func: 'getObject', obj: 's3'
    });
    return Promise.reject({
      message: 'Bucket and path are required to get object.'
    });
  }
  var getReq = {
    Bucket: bucket,
    Key: path
  };
  logger.debug({
    description: 'File get params built.', getReq: getReq,
    func: 'getObject', obj: 's3'
  });
  return new Promise(function (resolve, reject) {
    s3.getObject(getReq, function (error, data) {
      //[TODO] Add putting object ACL (make public)
      if (error) {
        logger.error({
          description: 'Error loading file from S3.',
          error: error, func: 'getObject', obj: 's3'
        });
        return reject(error);
      }
      var file = undefined;
      logger.info({
        description: 'File loaded successfully.',
        data: data, func: 'getObject', obj: 's3'
      });
      if (!(0, _lodash.has)(data, 'Body')) {
        return resolve(data);
      }
      logger.info({
        description: 'File has content.',
        content: data.Body.toString(),
        metaData: data.Metadata.toString(),
        func: 'getObject', obj: 's3'
      });
      file.content = data.Body.toString();
      logger.info({
        description: 'File content has been added to file.',
        file: file, func: 'getObject', obj: 's3'
      });
      resolve(file);
    });
  });
};
/**
 * @description Save object to S3
 */
function saveObject(saveData) {
  //TODO: Publish file to application
  var bucket = saveData.bucket;
  var content = saveData.content;
  var path = saveData.path;
  var contentType = saveData.contentType;

  logger.debug({
    description: 'File saveObject called.',
    saveData: saveData, func: 'saveObject', obj: 'saveObject'
  });
  if (!content || !path || !bucket) {
    logger.error({
      description: 'Save data including path, bucket and content required to saveObject.',
      func: 'saveObject', obj: 'saveObject'
    });
    return Promise.reject({ message: 'File data including path and content required to saveObject.' });
  }
  var saveParams = {
    Bucket: bucket,
    Key: path,
    Body: content,
    ACL: 'public-read'
  };
  //Set contentType from fileData to ContentType parameter of new object
  if (contentType) {
    saveParams.ContentType = contentType;
  }
  var s3 = this.init();
  logger.debug({
    description: 'File saveObject params built.',
    saveParams: saveParams, fileData: this,
    func: 'saveObject', obj: 'File'
  });
  return new Promise(function (resolve, reject) {
    s3.putObject(saveParams, function (error, response) {
      //[TODO] Add putting object ACL (make public)
      if (error) {
        logger.error({
          description: 'Error saving file to S3.',
          error: error, func: 'saveObject', obj: 's3'
        });
        reject(error);
      }
      logger.log({
        description: 'File saved successfully.',
        response: response, func: 'saveObject', obj: 's3'
      });
      resolve(response);
    });
  });
};
/**
 * @description Delete object from S3
 */
function deleteObject(deleteData) {
  logger.debug({
    description: 'Error loading file from S3.',
    error: error, func: 'deleteObject', obj: 'File'
  });
  //TODO: Publish file to application
  var bucket = deleteData.bucket;
  var path = deleteData.path;

  if (!path || !bucket) {
    logger.error({
      description: 'Delete data including path, and bucket required to deleteObject.',
      func: 'deleteObject', obj: 's3'
    });
    return Promise.reject({
      message: 'Delete data including path and content required to delete object.'
    });
  }
  return new Promise(function (resolve, reject) {
    s3.deleteObject({
      Bucket: bucket,
      Key: path
    }, function (error, data) {
      if (error) {
        logger.error({
          description: 'Error loading file from S3.',
          error: error, func: 'get', obj: 'File'
        });
        return reject(error);
      }
      logger.info({
        description: 'File loaded successfully.',
        data: data, func: 'get', obj: 'File'
      });
      if (!(0, _lodash.has)(data, 'Body')) {
        return resolve(data);
      }
      logger.info({
        description: 'File has content.',
        fileData: data.Body.toString(), func: 'get', obj: 'File'
      });
      resolve(data.Body.toString());
    });
  });
};

/**
 * @description Convert from array file structure (from S3) to 'children' structure used in Editor GUI
 * @private
 * @example
 * //Array structure: [{path:'index.html'}, {path:'testFolder/file.js'}]
 * //Children Structure [{type:'folder', name:'testfolder', children:[{path:'testFolder/file.js', name:'file.js', filetype:'javascript', contentType:'application/javascript'}]}]
 * var flatArray = [{path:'index.html'}, {path:'testFolder/file.js'}];
 * var childrenStructure = childrenStructureFromArray(flatArray);
 */
function childrenStructureFromArray(fileArray) {
  // logger.log('childStructureFromArray called:', fileArray);
  //Create a object for each file that stores the file in the correct 'children' level
  var mappedStructure = fileArray.map(function (file) {
    return buildStructureObject(file);
  });
  return combineLikeObjs(mappedStructure);
}
/**
 * @description Convert file with key into a folder/file children object
 * @private
 */
function buildStructureObject(file) {
  var pathArray = undefined;
  // console.log('buildStructureObject with:', file);
  if ((0, _lodash.has)(file, 'path')) {
    //Coming from files already having path (structure)
    pathArray = file.path.split('/');
  } else if ((0, _lodash.has)(file, 'Key')) {
    //Coming from aws
    pathArray = file.Key.split('/');
    // console.log('file before pick:', file);
    file = (0, _lodash.pick)(file, 'Key');
    file.path = file.Key;
    file.name = file.Key;
  } else {
    logger.error({
      description: 'Invalid file.', file: file,
      func: 'buildStructureObject', obj: 'Directory'
    });
  }
  var currentObj = file;
  if (pathArray.length == 1) {
    currentObj.name = pathArray[0];
    if (!(0, _lodash.has)(currentObj, 'type')) {
      currentObj.type = 'file';
    }
    currentObj.path = pathArray[0];
    return currentObj;
  } else {
    var finalObj = {};
    (0, _lodash.each)(pathArray, function (loc, ind, list) {
      if (ind != list.length - 1) {
        //Not the last loc
        currentObj.name = loc;
        currentObj.path = (0, _lodash.take)(list, ind + 1).join('/');
        currentObj.type = 'folder';
        currentObj.children = [{}];
        //TODO: Find out why this works
        if (ind === 0) {
          finalObj = currentObj;
        }
        currentObj = currentObj.children[0];
      } else {
        currentObj.type = 'file';
        currentObj.name = loc;
        currentObj.path = pathArray.join('/');
        if (file.$id) {
          currentObj.$id = file.$id;
        }
      }
    });
    return finalObj;
  }
}
/**
 * @description Recursivley combine children of object's that have the same names
 * @private
 */
function combineLikeObjs(mappedArray) {
  var takenNames = [];
  var finishedArray = [];
  (0, _lodash.each)(mappedArray, function (obj) {
    if (takenNames.indexOf(obj.name) == -1) {
      takenNames.push(obj.name);
      finishedArray.push(obj);
    } else {
      var likeObj = (0, _lodash.findWhere)(mappedArray, { name: obj.name });
      //Combine children of like objects
      likeObj.children = (0, _lodash.union)(obj.children, likeObj.children);
      likeObj.children = combineLikeObjs(likeObj.children);
      // logger.log('extended obj:',likeObj);
    }
  });
  return finishedArray;
}