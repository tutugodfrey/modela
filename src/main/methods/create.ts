import { DataModelaType } from '../../main/interfaces';
import functs from '../helpers/functs';

const {
  getFieldsToReturn,
  checkDatatype,
  updateTimestamp,
  unEscape,
  parseJson,
  prepareDataForStorage,
} = functs;

function create(modelToCreate: object, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    if (!modelToCreate)
      reject({ message: 'Expected an object to create at position 1' });

    if (!Array.isArray(returnFields))
      reject({ message: 'Expected an array of fields to return' });

    if (Object.prototype.toString.call(modelToCreate) !== '[object Object]')
      return reject({ message: 'Expected an Object {} for model to create' });
    const allowedFields: Array<any> = this.allowedFields;
    const modelFields = Object.keys(modelToCreate);
    const requiredFields = this.requiredFields.length ? this.requiredFields : [];
    const schema = this.schema;
    const createModelWithDB = this.createModelWithDB;
    const createModel = this.createModel;
    const modelName = this.modelName
    const using_db = this.using_db;

    const missingSchemaProp = modelFields.find((field: any)=> !allowedFields.includes(field));
    if (missingSchemaProp)
      return reject({
        message: `${missingSchemaProp} is not defined in schema for ${modelName}`,
      });

    // check default value for missing required fields else return missing fields
    if (requiredFields.length) {
      const missingRequiredField = requiredFields.find((field: any)=> !modelFields.includes(field));
      if (missingRequiredField) {
        const fieldSchema = schema[missingRequiredField];
        // required fields not having & will not have value later.
        if (fieldSchema.defaultValue === undefined &&
          missingRequiredField !== 'createdAt' &&
          missingRequiredField !== 'updatedAt'
        ) return reject({ message: `missing required field ${missingRequiredField}` });
        modelToCreate[missingRequiredField] = schema[missingRequiredField].defaultValue;
      }
    }

    // add default value for missing fields with default values specified in schema
    allowedFields.forEach(field => {
      if (!modelFields.includes(field)) {
        if (schema[field].defaultValue !== undefined) {
          modelToCreate[field] = schema[field].defaultValue;
        };
      };
    });

    const dataTypeChecking = checkDatatype(schema, modelToCreate);
    if (dataTypeChecking[0]) return reject({ message: dataTypeChecking[1] });

    if (using_db) {      
      return createModelWithDB(prepareDataForStorage(modelToCreate, schema), returnFields, resolve, reject);
    }
    return createModel(modelToCreate, returnFields, resolve, reject);
  });
  return result;
}

// private interface for creating model
// check for unique keys
// then create a new model 
function createModel(modelToCreate: any, returnFields: Array<any>, resolve: Function, reject: Function) {
  const singleModel = this.singleModel;
  const uniqueKeys = this.uniqueKeys;
  const schema = this.schema;
  const model = this.model;

  updateTimestamp.call(this, modelToCreate); // update createdAt and updatedAt

  if (!model.length) {
    if (schema.id && modelToCreate.id === undefined) modelToCreate.id = 1;
    model.push(modelToCreate);
    return resolve(getFieldsToReturn(modelToCreate, returnFields))
  } else {
    if (schema.id && modelToCreate.id === undefined) {
      const lastModel = model[model.length - 1];
      const lastModelId = lastModel.id;
      modelToCreate.id = lastModelId + 1;
    }

    // verify uniqueKeys
    if (!uniqueKeys.length) {
      model.push(modelToCreate)
      return resolve(getFieldsToReturn(modelToCreate, returnFields));
    }

    let foundDuplicate = false;
    model.forEach((model_: any) => {
      uniqueKeys.forEach((prop: any) => {
        if (model_[prop] === modelToCreate[prop]) {
          foundDuplicate = true;
          return reject({ message:
            `${singleModel} with ${prop} = ${modelToCreate[prop]} already exists`,
          });
        }
      });
    });

    if (!foundDuplicate) {
      model.push(modelToCreate)
      return resolve(getFieldsToReturn(modelToCreate, returnFields));
    }
  }
}

function createModelWithDB(
  modelToCreate: any,
  returnFields: Array<any>,
  resolve: Function,
  reject: Function
) {
  const schema = this.schema;
  const modelName = this.modelName;
  const dbConnection = this.dbConnection;
  const createTableQuery = this.createTableQuery;
  const createQuery = this.createQuery;
  const singleModel = this.singleModel;
  if (Array.isArray(modelToCreate)) {
    modelToCreate.forEach((_modelToCreate)=> {
      updateTimestamp.call(this, _modelToCreate); // update createdAt and updatedAt
    });
  } else {
    updateTimestamp.call(this, modelToCreate);
  }

  const queryString =
    createQuery(modelName, modelToCreate, returnFields);
  return dbConnection.query(queryString)
    .then((res: object | any )=> {
      if (Array.isArray(modelToCreate)) return resolve(parseJson(unEscape(res.rows), schema));
      return resolve(parseJson(unEscape(res.rows[0]), schema));
    })
    .catch((err: any) => {
      if (err.detail && err.detail.includes('already exists')) {
        const key = err.detail.split('=')[0].split('(')[1].split(')')[0];
        const value = err.detail.split('=')[1].split(')')[0].split('(')[1];
        return reject({ message:
          `${singleModel} with ${key} = ${unEscape(value)} already exists`,
        });
      }
      if (err.code === '42P01') {
        return dbConnection.query(createTableQuery())
          .then(( /* create table query result */ ) => {
            return dbConnection.query(queryString);
          })
          .then((res: any) => {
            if (Array.isArray(modelToCreate))
              return resolve(parseJson(unEscape(res.rows), schema));
            return resolve(parseJson(unEscape(res.rows[0]), schema));
          });
      }
      return reject(err.message);
    })
    .catch((err: object )=> reject(err))
};

export {
  create,
  createModel,
  createModelWithDB,
};
