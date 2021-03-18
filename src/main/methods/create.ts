import functs from '../helpers/functs';

const {
  getFieldsToReturn,
  checkDatatype,
  updateTimestamp,
} = functs;

function create(modelToCreate: any, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    if (!modelToCreate)
      reject({ message: 'Expected an object to create at position 1' });

    if (!Array.isArray(returnFields))
      reject({ message: 'Expected an array of fields to return' });

    const missingSchemaProp = Object.keys(modelToCreate)
      .find(field => !this.allowedFields.includes(field));
    if (missingSchemaProp)
      return reject({
        message: `${missingSchemaProp} is not defined in schema for ${this.modelName}`,
      });

    const requiredFields = this.requiredFields.length ? this.requiredFields : false;
    // check default value for missing required fields else return missing fields
    if (requiredFields) {
      const missingRequiredField = requiredFields
        .find(field => !Object.keys(modelToCreate).includes(field));
      if (missingRequiredField) {
        const schema_ = this.schema[missingRequiredField];
        // required fields not having & will not have value later.
        if (schema_.defaultValue === undefined &&
          missingRequiredField !== 'createdAt' &&
          missingRequiredField !== 'updatedAt'
        ) return reject({ message: `missing required field ${missingRequiredField}` });
        modelToCreate[missingRequiredField] = this.schema[missingRequiredField].defaultValue;
      }
    }

    // add default value for missing fields with default values specified in schema
    this.allowedFields.forEach(field => {
      if (!Object.keys(modelToCreate).includes(field)) {
        if (this.schema[field].defaultValue !== undefined) {
          modelToCreate[field] = this.schema[field].defaultValue;
        };
      };
    });

    const dataTypeChecking = checkDatatype(this.allowedFields, this.schema, modelToCreate);
    if (dataTypeChecking[0]) return reject({ message: dataTypeChecking[1] });

    if (this.using_db)
      return this.createModelWithDB(modelToCreate, returnFields, resolve, reject);
    return this.createModel(modelToCreate, returnFields, resolve, reject);
  });
  return result;
}

// private interface for creating model
// check for unique keys
// then create a new model 
function createModel(modelToCreate: any, returnFields: Array<any>, resolve: Function, reject: Function) {
  updateTimestamp.call(this, modelToCreate); // update createdAt and updatedAt
  if (!this.model.length) {
    if (this.schema.id && modelToCreate.id === undefined) modelToCreate.id = 1;
    this.model.push(modelToCreate);
    return resolve(getFieldsToReturn(modelToCreate, returnFields))
  } else {
    if (this.schema.id && modelToCreate.id === undefined) {
      const lastModel = this.model[this.model.length - 1];
      const lastModelId = lastModel.id;
      modelToCreate.id = lastModelId + 1;
    }

    // verify uniqueKeys
    if (!this.uniqueKeys.length) {
      this.model.push(modelToCreate)
      return resolve(getFieldsToReturn(modelToCreate, returnFields));
    }

    let foundDuplicate = false;
    this.model.forEach((model: any) => {
      this.uniqueKeys.forEach((prop) => {
        if (model[prop] === modelToCreate[prop]) {
          foundDuplicate = true;
          return reject({ message:
            `${this.singleModel} with ${prop} = ${modelToCreate[prop]} already exists`,
          });
        }
      });
    });

    if (!foundDuplicate) {
      this.model.push(modelToCreate)
      return resolve(getFieldsToReturn(modelToCreate, returnFields));
    }
  }
}

function createModelWithDB(modelToCreate: any, returnFields: Array<any>, resolve: Function, reject: Function) {
  if (Array.isArray(modelToCreate)) {
    modelToCreate.forEach((_modelToCreate)=> {
      updateTimestamp.call(this, _modelToCreate); // update createdAt and updatedAt
    });
  } else {
    updateTimestamp.call(this, modelToCreate);
  }

  const queryString = this.createQuery(this.modelName, modelToCreate, returnFields);
  return this.dbConnection.query(queryString)
    .then((res: object | any )=> {
      if (Array.isArray(modelToCreate))
        return resolve(res.rows);
      return resolve(res.rows[0]);
    })
    .catch((err: any) => {
      if (err.detail && err.detail.includes('already exists')) {
        const key = err.detail.split('=')[0].split('(')[1].split(')')[0];
        const value = err.detail.split('=')[1].split(')')[0].split('(')[1];
        return reject({ message: `${this.singleModel} with ${key} = ${value} already exists` });
      }
      if (err.code === '42P01') {
        const createTableQuery = this.createTableQuery();
        return this.dbConnection.query(createTableQuery)
          .then(( /* create table query result */ ) => {
            return this.dbConnection.query(queryString);
          })
          .then((res: any) => {
            if (Array.isArray(modelToCreate))
              return resolve(res.rows);
            return resolve(res.rows[0]);
          });
      }
      return reject(err.detail);
    })
    .catch((err: object )=> reject(err))
};

export {
  create,
  createModel,
  createModelWithDB,
};
