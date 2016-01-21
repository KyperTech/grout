import config from '../config';
import matter from '../classes/Matter';
import AWS from 'aws-sdk';
import { has, each, pick, take, findWhere, union  } from 'lodash';
const { logger } = matter.utils;
/**
 * @description Initial AWS Config
 */
export function init() {
  if (typeof AWS.config.credentials == 'undefined' || !AWS.config.credentials) {
    logger.log({
      description: 'AWS creds do not exist, so they are being set.',
      func: 'saveObject', obj: 'File'
    });
    setConfig();
  }
  if(typeof AWS.S3 === 'function'){
    return new AWS.S3();
  }
};
/**
 * @description Set AWS config credentials
 */
export function setConfig() {
	return AWS.config.update({
		credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: config.aws.cognito.poolId
	}), region: config.aws.region
	});
};
/**
 * @description Get objects from S3 bucket
 * @param {String} bucket - Bucket name to get objects from
 */
export function getObjects(bucket) {
  const listReq = {Bucket: bucket};
  const s3 = init();
  logger.debug({
    description: 'Getting objects for bucket.', listReq,
    func: 'getObject', obj: 's3'
  });
  return new Promise((resolve, reject) => {
    s3.listObjects(listReq, (error, data) => {
      if (error) {
        logger.error({
          description: 'Error getting objects from S3.',
          error, func: 'getObject', obj: 's3'
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
export function getObject(getData) {
  const { bucket, path } = getData;
  if (!bucket || !path) {
    logger.error({
      description: 'Bucket and path are required to get object.', getData,
      func: 'getObject', obj: 's3'
    });
    return Promise.reject({
      message: 'Bucket and path are required to get object.'
    });
  }
  let getReq = {
    Bucket: bucket,
    Key: path
  };
  logger.debug({
    description: 'File get params built.', getReq,
    func: 'getObject', obj: 's3'
  });
  return new Promise((resolve, reject) => {
    s3.getObject(getReq, (error, data) => {
      //[TODO] Add putting object ACL (make public)
      if (error) {
        logger.error({
          description: 'Error loading file from S3.',
          error, func: 'getObject', obj: 's3'
        });
        return reject(error);
      }
      let file;
      logger.info({
        description: 'File loaded successfully.',
        data, func: 'getObject', obj: 's3'
      });
      if (!has(data, 'Body')) {
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
        file, func: 'getObject', obj: 's3'
      });
      resolve(file);
    });
  });
};
/**
 * @description Save object to S3
 */
export function saveObject(saveData) {
  //TODO: Publish file to application
  const { bucket, content, path, contentType } = saveData;
  logger.debug({
    description: 'File saveObject called.',
    saveData, func: 'saveObject', obj: 'saveObject'
  });
  if (!content || !path || !bucket) {
    logger.error({
      description: 'Save data including path, bucket and content required to saveObject.',
      func: 'saveObject', obj: 'saveObject'
    });
    return Promise.reject({message: 'File data including path and content required to saveObject.'});
  }
  let saveParams = {
    Bucket: bucket,
    Key: path,
    Body: content,
    ACL: 'public-read'
  };
  //Set contentType from fileData to ContentType parameter of new object
  if (contentType) {
    saveParams.ContentType = contentType;
  }
  let s3 = this.init();
  logger.debug({
    description: 'File saveObject params built.',
    saveParams: saveParams, fileData: this,
    func: 'saveObject', obj: 'File'
  });
  return new Promise((resolve, reject) => {
    s3.putObject(saveParams, (error, response) => {
      //[TODO] Add putting object ACL (make public)
      if (error) {
        logger.error({
          description: 'Error saving file to S3.',
          error, func: 'saveObject', obj: 's3'
        });
        reject(error);
      }
      logger.log({
        description: 'File saved successfully.',
        response, func: 'saveObject', obj: 's3'
      });
      resolve(response);
    });
  });
};
/**
 * @description Delete object from S3
 */
export function deleteObject(deleteData) {
  logger.debug({
    description: 'Error loading file from S3.',
    error, func: 'deleteObject', obj: 'File'
  });
  //TODO: Publish file to application
  const { bucket, path } = deleteData;
  if (!path || !bucket) {
    logger.error({
      description: 'Delete data including path, and bucket required to deleteObject.',
      func: 'deleteObject', obj: 's3'
    });
    return Promise.reject({
      message: 'Delete data including path and content required to delete object.'
    });
  }
  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: bucket,
      Key: path
    }, (error, data) => {
      if (error) {
        logger.error({
          description: 'Error loading file from S3.',
          error, func: 'get', obj: 'File'
        });
        return reject(error);
      }
      logger.info({
        description: 'File loaded successfully.',
        data, func: 'get', obj: 'File'
      });
      if (!has(data, 'Body')) {
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
	let mappedStructure = fileArray.map((file) => {
		return buildStructureObject(file);
	});
	return combineLikeObjs(mappedStructure);
}
/**
 * @description Convert file with key into a folder/file children object
 * @private
 */
function buildStructureObject(file) {
	let pathArray;
	// console.log('buildStructureObject with:', file);
	if (has(file, 'path')) {
		//Coming from files already having path (structure)
		pathArray = file.path.split('/');
	} else if (has(file, 'Key')) {
		//Coming from aws
		pathArray = file.Key.split('/');
		// console.log('file before pick:', file);
		file = pick(file, 'Key');
		file.path = file.Key;
		file.name = file.Key;
	} else {
		logger.error({
			description: 'Invalid file.', file: file,
			func: 'buildStructureObject', obj: 'Directory'
		});
	}
	let currentObj = file;
	if (pathArray.length == 1) {
		currentObj.name = pathArray[0];
		if (!has(currentObj,'type')) {
			currentObj.type = 'file';
		}
		currentObj.path = pathArray[0];
		return currentObj;
	} else {
		let finalObj = {};
		each(pathArray, (loc, ind, list) => {
			if (ind != list.length - 1) {//Not the last loc
				currentObj.name = loc;
				currentObj.path = take(list, ind + 1).join('/');
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
	let takenNames = [];
	let finishedArray = [];
	each(mappedArray, (obj) => {
		if (takenNames.indexOf(obj.name) == -1) {
			takenNames.push(obj.name);
			finishedArray.push(obj);
		} else {
			let likeObj = findWhere(mappedArray, {name: obj.name});
			//Combine children of like objects
			likeObj.children = union(obj.children, likeObj.children);
			likeObj.children = combineLikeObjs(likeObj.children);
			// logger.log('extended obj:',likeObj);
		}
	});
	return finishedArray;
}
