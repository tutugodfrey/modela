function bulkCreate(modelsToCreate) {
  // create a new model
  let createdModels = [];
  const failingObj = [];
    if (!this.requiredFields.length) {
      modelsToCreate.forEach((modelToCreate) => {
        this.createBulkItem(modelToCreate)
          .then(response => {
            return createdModels.push(response);
          });
      });
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
         modelsToCreate.forEach((modelToCreate) => {
          this.createBulkItem(modelToCreate)
            .then(response => {
              return createdModels.push(response);
            });
        });
      }
    }
  const result =  new Promise((resolve, reject) => {
    if (failingObj.length) return reject(failingObj);
    return resolve(createdModels);
  });
  return result
}

// send each item to createModel 
// and resolve result as a promise
function createBulkItem(modelToCreate) {
  const result =  new Promise((resolve, reject) => {
    this.createModel(modelToCreate, resolve, reject);
  });
	return result;
}

export default bulkCreate;

export { createBulkItem };
