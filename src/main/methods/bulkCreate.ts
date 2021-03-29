function bulkCreate(modelsToCreate: any, returnFields: Array<any>=[]) {
  // create a new model
  let createdModels: Array<object> = [];
  const failingObj: Array<object> = [];
  const useDB = this.using_db;
  const requiredFieldsLength = this.requiredFields.length;
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  if (!requiredFieldsLength) {
    if (useDB) {
      return this.createBulkItemWithDB(modelsToCreate, returnFields);
    } else {
      const result = new Promise((resolve, reject) => {
        modelsToCreate.forEach((modelToCreate: any) => {
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

  if (requiredFieldsLength) {
    const requiredFieldsChecked = modelsToCreate.filter((modelToCreate: any) => {
      return this.requiredFields.filter((field: string) => {
        return !modelToCreate[field];
      }).length;
    });

    if (requiredFieldsChecked.length) {
      failingObj.push({ message: 'missing required field' });
    } else {
      if (useDB) {
        return this.createBulkItemWithDB(modelsToCreate, returnFields);
      } else {
        modelsToCreate.forEach((modelToCreate: any) => {
          this.createBulkItem(modelToCreate, returnFields)
            .then((response: any) => {
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
function createBulkItem(modelToCreate: any, returnFields: Array<any>) {
  const result =  new Promise((resolve, reject) => {
    this.createModel(modelToCreate, returnFields, resolve, reject);
  });
	return result;
}

// will attempt to eliminate this function in future
function createBulkItemWithDB(modelsToCreate: any, returnFields: Array<any>) {
  const newModel = new Promise((resolve, reject) => {
    return this.createModelWithDB(modelsToCreate, returnFields, resolve, reject);
  });
  return newModel;
}

export default bulkCreate;

export { createBulkItem, createBulkItemWithDB };
