import config from '../config';
import matter from '../classes/Matter';
import AWS from 'aws-sdk';
import { has } from 'lodash';
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
  return new AWS.S3();
};
/**
 * @description Set AWS config credentials
 */
export function setConfig() {
	return AWS.config.update({
		credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: config.aws.cognito.poolId
	}),
		region: config.aws.region
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
