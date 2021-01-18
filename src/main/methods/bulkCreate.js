function bulkCreate(modelsToCreate, returnFields=[]) {
  // create a new model
  let createdModels = [];
  const failingObj = [];
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  if (!this.requiredFields.length) {
    if (this.using_db) {
      return this.createBulkItemWithDB(modelsToCreate, returnFields);
    } else {
      const result = new Promise((resolve, reject) => {
        modelsToCreate.forEach((modelToCreate) => {
          this.createBulkItem(modelToCreate, returnFields)
            .then(response => {
              return createdModels.push(response);
            });
            resolve(createdModels);
        });
      }); 
      return result;
    }
  }

  if (this.requiredFields.length) {
    const requiredFieldsChecked = modelsToCreate.filter((modelToCreate) => {
      return this.requiredFields.filter((required) => {
        return !modelToCreate[required];
      }).length;
    });

    if (requiredFieldsChecked.length) {
      failingObj.push({ message: 'missing required field' });
    } else {
      if (this.using_db) {
        return this.createBulkItemWithDB(modelsToCreate, returnFields);
      } else {
        modelsToCreate.forEach((modelToCreate) => {
          this.createBulkItem(modelToCreate, returnFields)
            .then(response => {
              return createdModels.push(response);
            });
        });

        const result =  new Promise((resolve, reject) => {
          if (failingObj.length) return reject(failingObj);
          return resolve(createdModels);
        });
      
        return result
      }
    }
  }
  if (failingObj.length) {
    const result =  new Promise((resolve, reject) => {
      return reject(failingObj);
    });
    return result;
  }
}

// send each item to createModel 
// and resolve result as a promise
function createBulkItem(modelToCreate, returnFields) {
  const result =  new Promise((resolve, reject) => {
    this.createModel(modelToCreate, returnFields, resolve, reject);
  });
	return result;
}

// will attempt to eliminate this function in future
function createBulkItemWithDB(modelsToCreate, returnFields=[]) {
  const newModel = new Promise((resolve, reject) => {
    return this.createModelWithDB(modelsToCreate, returnFields, resolve, reject);
  });
  return newModel;
}

export default bulkCreate;

export { createBulkItem, createBulkItemWithDB };
