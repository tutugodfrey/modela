	// public interface to create a single model
function create(modelToCreate) {
  // create a new model
  const result = new Promise((resolve, reject) => {
    if (this.requiredFields.length === 0) {
      this.createModel(modelToCreate, resolve, reject);
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
        reject({ message: `missing required field ${requiredFieldsCollection}` });
      } else {
        this.createModel(modelToCreate, resolve, reject);
      }
    }
  });
  return result;
}

// private interface for creating model
// check for unique keys
// then create a new model 
function createModel(modelToCreate, resolve, reject) {
  if (this.model.length === 0) {
    modelToCreate.id = 1;
    modelToCreate.createdAt = new Date();
    modelToCreate.updatedAt = new Date();
    if (this.model.push(modelToCreate)) {
      return resolve(modelToCreate);
    }
    return reject({ message: `Can not create ${this.singleModel}` });
  } else {
    const lastModel = this.model[this.model.length - 1];
    const lastModelId = this.getFields(lastModel, 'id');

    // verify uniqueKeys
    if (this.uniqueKeys.length === 0) {
      modelToCreate.id = lastModelId + 1;
      modelToCreate.createdAt = new Date();
      modelToCreate.updatedAt = new Date();
      if (this.model.push(modelToCreate)) {
        return resolve(modelToCreate);
      }
      return reject({ message: `Can not create ${this.singleModel}` });
    } else {
      let foundDuplicate = false;
      this.model.forEach((model) => {
        this.uniqueKeys.forEach((prop) => {
          if (model[prop] === modelToCreate[prop]) {
            foundDuplicate = true;
            return reject({ message: `duplicate entry for unique key "${prop}" with value "${modelToCreate[prop]}"` });
          }
        });
      });
      if (!foundDuplicate) {
        modelToCreate.id = lastModelId + 1;
        modelToCreate.createdAt = new Date();
        modelToCreate.updatedAt = new Date();
        if (this.model.push(modelToCreate)) {
          return resolve(modelToCreate);
        }
        return reject({ message: `Can not create ${this.singleModel}` });
      }
    }
  }
}

export {
  create,
  createModel,
};
