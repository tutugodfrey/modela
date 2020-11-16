import functs from '../helpers/functs';

const { getFieldsToReturn } = functs;

// public interface to create a single model
function create(modelToCreate, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    const missingSchemaProp = Object.keys(modelToCreate).find(field => {
      return !this.allowedFields.includes(field);
    });
    if (missingSchemaProp) {  
      reject({ message: `${missingSchemaProp} is not defined in schema for ${this.modelName}` });
    }

    if (!Array.isArray(returnFields)) {
      reject({ message: 'Expected an array of fields to return' });
    }

    if (this.requiredFields.length === 0) {
      if (this.using_db) {
        return this.createModelWithDB(modelToCreate, returnFields, resolve, reject);
      } else {
        return this.createModel(modelToCreate, returnFields, resolve, reject);
      }
    } else {
      let allFieldsPassed = true;
      const requiredFieldsCollection = [];
      this.requiredFields.forEach((required) => {
        if (!modelToCreate[required]) {
          requiredFieldsCollection.push(required);
          allFieldsPassed = false;
        }
      });
      if (!allFieldsPassed) {
        return reject({ message: `missing required field ${requiredFieldsCollection}` });
      } else {
        if (this.using_db) {
          return this.createModelWithDB(modelToCreate, returnFields, resolve, reject);
        } else {
          return this.createModel(modelToCreate, returnFields, resolve, reject);
        }
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
    modelToCreate.id = 1;
    modelToCreate.createdAt = new Date();
    modelToCreate.updatedAt = new Date();
    this.model.push(modelToCreate);
    // return resolve(modelToCreate);
    return resolve(getFieldsToReturn(modelToCreate, returnFields))
  } else {
    const lastModel = this.model[this.model.length - 1];
    const lastModelId = lastModel.id;

    // verify uniqueKeys
    if (!this.uniqueKeys.length) {
      modelToCreate.id = lastModelId + 1;
      modelToCreate.createdAt = new Date();
      modelToCreate.updatedAt = new Date();
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
        modelToCreate.id = lastModelId + 1;
        modelToCreate.createdAt = new Date();
        modelToCreate.updatedAt = new Date();
        this.model.push(modelToCreate);
        return resolve(getFieldsToReturn(modelToCreate, returnFields));
      }
    }
  }
}

function createModelWithDB(modelToCreate, returnFields, resolve, reject) {
  modelToCreate.createdAt = 'now()';
  modelToCreate.updatedAt = 'now()';
  const queryString = this.createQuery(this.modelName, modelToCreate, returnFields);
  this.db_connection.query(queryString)
    .then(res => {
      return resolve(res.rows[0]);
    })
    .catch(err => {
      if (err.detail && err.detail.includes('already exists')) {
        const key = err.detail.split('=')[0].split('(')[1].split(')')[0];
        const value = err.detail.split('=')[1].split(')')[0].split('(')[1];
        return reject({ message: `${this.singleModel} with ${key} = ${value} already exists` });
      }
      return reject(err.detail);
    });
};

export {
  create,
  createModel,
  createModelWithDB,
};
