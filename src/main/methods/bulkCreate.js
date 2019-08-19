function bulkCreate(modelsToCreate) {
  // create a new model
  const createdModels = [];
    if (this.requiredFields.length === 0) {
      modelsToCreate.forEach((modelToCreate) => {
        const res =	this.createBulkItem(modelToCreate);
        res.then(response => {
          createdModels.push(response)
          if (createdModels.length === modelsToCreate.length) {
            return createdModels;
          }
        });
      });
    } else {
      let allFieldsPassed = true;
      let allModelsPassed = true;
      modelsToCreate.forEach((modelToCreate) => {
        this.requiredFields.forEach((required) => {
          if (!modelToCreate[required]) {
            allFieldsPassed = false;
            allModelsPassed = false;
          }
        });
      });

      if (!allFieldsPassed && !allModelsPassed) {
        reject({ message: 'missing required field' });
      } else {
        modelsToCreate.forEach((modelToCreate) => {
          const res =	this.createBulkItem(modelToCreate);
          res.then(response => {
            createdModels.push(response)
            if (createdModels.length === modelsToCreate.length) {
              return createdModels;
            }
          });
        });
      }
    }
    
  const result =  new Promise((resolve, reject) => {
    resolve(createdModels);
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
