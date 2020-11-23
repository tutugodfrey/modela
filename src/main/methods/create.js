import functs from '../helpers/functs';

const { getFieldsToReturn, checkDatatype } = functs;

// public interface to create a single model
function create(modelToCreate, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    const missingSchemaProp = Object.keys(modelToCreate).find(field => {
      return !this.allowedFields.includes(field);
    });
    if (missingSchemaProp) {  
      reject({ message: `${missingSchemaProp} is not defined in schema for ${this.modelName}` });
    }

    // add default value for missing fields with default values specified in schema
    this.allowedFields.forEach(field => {
      if (!Object.keys(modelToCreate).includes(field)) {
        if (this.schema[field].defaultValue !== undefined) {
          modelToCreate[field] = this.schema[field].defaultValue;
        };
      };
    });

    const datatypeChecking = checkDatatype(this.allowedFields, this.schema, modelToCreate);
    if (datatypeChecking[0]) {
      return reject({ message: datatypeChecking[1] });
    }

    if (!Array.isArray(returnFields)) {
      reject({ message: 'Expected an array of fields to return' });
    }

    if (this.schema.createdAt && modelToCreate.createdAt === undefined) {
      modelToCreate.createdAt = new Date().toISOString();
    }

    if (this.schema.updatedAt && modelToCreate.updatedAt === undefined) {
      modelToCreate.updatedAt = new Date().toISOString();
    }

    if (!this.requiredFields.length) {
      if (this.using_db) {
        return this.createModelWithDB(modelToCreate, returnFields, resolve, reject);
      } else {
        return this.createModel(modelToCreate, returnFields, resolve, reject);
      }
    } else {
      // check default value for missing required fields else return missing fields
      const missingRequiredField = this.requiredFields.find(field => {
        return !Object.keys(modelToCreate).includes(field);
      });
      if (missingRequiredField) {  
        return reject({ message: `missing required field ${missingRequiredField}` });
      }

      if (this.using_db) {
        return this.createModelWithDB(modelToCreate, returnFields, resolve, reject);
      } else {
        return this.createModel(modelToCreate, returnFields, resolve, reject);
      }
    }
  });
  return result;
}

// private interface for creating model
// check for unique keys
// then create a new model 
function createModel(modelToCreate, returnFields, resolve, reject) {
  if (!this.model.length) {
    if (this.schema.id && modelToCreate.id === undefined) {
      modelToCreate.id = 1;
    }
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
      this.model.push(modelToCreate);
      return resolve(getFieldsToReturn(modelToCreate, returnFields))
    } else {
      let foundDuplicate = false;
      this.model.forEach((model) => {
        this.uniqueKeys.forEach((prop) => {
          if (model[prop] === modelToCreate[prop]) {
            foundDuplicate = true;
            return reject({
              message: `${this.singleModel} with ${prop} = ${modelToCreate[prop]} already exists`,
            });
          }
        });
      });
      if (!foundDuplicate) {
        this.model.push(modelToCreate);
        return resolve(getFieldsToReturn(modelToCreate, returnFields));
      }
    }
  }
}

function createModelWithDB(modelToCreate, returnFields, resolve, reject) {
  const queryString = this.createQuery(this.modelName, modelToCreate, returnFields);
  return this.db_connection.query(queryString)
    .then(res => {
      if (Array.isArray(modelToCreate)) {
        return resolve(res.rows);
      }
      return resolve(res.rows[0]);
    })
    .catch(err => {
      if (err.detail && err.detail.includes('already exists')) {
        const key = err.detail.split('=')[0].split('(')[1].split(')')[0];
        const value = err.detail.split('=')[1].split(')')[0].split('(')[1];
        return reject({ message: `${this.singleModel} with ${key} = ${value} already exists` });
      }
      if (err.code === '42P01') {
        const createTableQuery = this.createTableQuery();
        console.log(createTableQuery)
         return this.db_connection.query(createTableQuery).then(tableResult => {
           return this.db_connection.query(queryString).then(res => {
            if (Array.isArray(modelToCreate)) {
              return resolve(res.rows);
            }
            return resolve(res.rows[0]);
           })
         })
      }
      return reject(err.detail);
    })
    .catch(err => {
      return reject(err);
    });
};

export {
  create,
  createModel,
  createModelWithDB,
};
