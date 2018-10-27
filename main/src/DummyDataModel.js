const DummyDataModel = class {
	constructor(modelName, uniqueKeys = [], requiredFields = []) {
		if (!Array.isArray(uniqueKeys) || !Array.isArray(requiredFields)) {
      return { typeError: 'argument2 and argument3 must be of type array' };
    }
		this.modelName = modelName;
		this.uniqueKeys = uniqueKeys;
    this.requiredFields = requiredFields;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.model = [];
		this.createBulkItem = this.createBulkItem.bind(this)
		this.createModel = this.createModel.bind(this);
		this.getObjectByField = this.getObjectByField.bind(this);
		this.getFields = this.getFields.bind(this)
	}

	getObjectByField(arrayOfObjects, objectField, fieldValue) {
    for(let objCollection of arrayOfObjects) {
      // const objCollection = arrayOfObjects[arraySize];
      if (objCollection[objectField] === fieldValue) {
        return objCollection;
      }
    }
    return `No object with field ${objectField} found`;
  }

  getFields(objCollector, field) {
    if (objCollector[field]) {
      return objCollector[field];
    }
    return undefined;
	}

	// private interface for creating model
	// check for unique keys
	// then create a new model 
	createModel(modelToCreate, resolve, reject) {
    if (this.model.length === 0) {
      modelToCreate.id = 1;
      if (this.model.push(modelToCreate)) {
        resolve(modelToCreate);
      }
      reject({ message: `Can not create ${this.singleModel}` });
    } else {
      const lastModel = this.model[this.model.length - 1];
      const lastModelId = this.getFields(lastModel, 'id');
      // verify uniqueKeys
      if (this.uniqueKeys.length === 0) {
				modelToCreate.id = lastModelId + 1;
        if (this.model.push(modelToCreate)) {
          resolve(modelToCreate);
        }
        reject({ message: `Can not create ${this.singleModel}` });
      } else {
        let foundDuplicate = false;
        this.model.forEach((model) => {
          this.uniqueKeys.forEach((prop) => {
            if (model[prop] === modelToCreate[prop]) {
							foundDuplicate = true;
              reject({ message: `duplicate entry for unique key ${prop}` });
            }
          });
        });
        if (!foundDuplicate) {
          modelToCreate.id = lastModelId + 1;
          if (this.model.push(modelToCreate)) {
            resolve(modelToCreate);
          }
          reject({ message: `Can not create ${this.singleModel}` });
        }
      }
    }
	}
	
	// public interface to create a single model
	create(modelToCreate) {
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

	// send each item to createModel 
	// and resolve result as a promise
	createBulkItem(modelToCreate){
		const result =  new Promise((resolve, reject) => {
			this.createModel(modelToCreate, resolve, reject);
		});
		return result;
	}

	bulkCreate(modelsToCreate) {
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
	
	update(modelToUpdate, propsToUpdate) {
		/* 
			propsToUpdate contain the new properties to replace the old ones
			this method should be called on the particular object to update.
			which means that before call update you must use the finder methods to 
			get the particular object.
		*/
		const result = new Promise((resolve, reject) => {
			if((typeof propsToUpdate === 'object') && (typeof modelToUpdate === 'object')) {
				const props = Object.keys(propsToUpdate);
				let foundModel = this.model.filter((model) => {
					return model.id === modelToUpdate.id
				});
				foundModel = foundModel[0];
				if (!foundModel) {
					reject({ message: `${this.singleModel} not found` })
				} else {
					props.forEach((property) => {
						foundModel[property] = propsToUpdate[property]
					});
					resolve(foundModel);
				}
			} else {
				reject({ message: `missing object propertiy 'where' to find model` });
			}
		});
		return result;
	}

	findById(id) {
		// return an object with the given id
		let modelToFind =this.model.filter((model) => {
			return model.id === id;
		});
		const result = new Promise((resolve, reject) => {
			modelToFind = modelToFind[0];
			if(modelToFind) {
				resolve(modelToFind)
			} else {
				reject({ error: `${this.singleModel} not found` });
			}
		})
		return result;
	}

	find(condition) {
		/* return a single object that meet the condition
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find
		*/
		const result = new Promise((resolve, reject) => {
			if (!condition || !condition.where) {
				reject({ message: `missing object propertiy 'where' to find model` });
			} else {
				const props = Object.keys(condition.where);
				let propMatch;
				let searchResult;
				this.model.forEach((model) => {
					propMatch = true;
					props.forEach((property) => {
						if (condition.where[property] !== model[property]) {
							propMatch = false;
						}
					});
					if (propMatch) {
						searchResult = model;
					}
				});
				if (searchResult) {
					resolve(searchResult);
				} else {
					reject({ message: `${this.singleModel} not found`});
				}
			}
		});
		return result;
	}

	findAll(condition = 'all') {
		/* return all objects that meet the condition 
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find
		*/
		const result = new Promise((resolve, reject)  => {
			if(condition === 'all') {
				// all model in this instance
				resolve(this.model);
			} else {
				// find model that meets the given condition
				const props = Object.keys(condition.where);

				// array of objects that meet the condition
				const searchResult = [];
				let propMatch;
				this.model.forEach((model) => {
					propMatch = true;
					props.forEach((property) => {
						if(condition.where[property] !== model[property]) {
							propMatch = false;
						}
					});
					if(propMatch) {
						searchResult.push(model);;
					}
				});
				resolve(searchResult)
			}
		});
		return result;
	}

	destroy(condition) {
		/* 
			delete the object that meet the condition 
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find.
			if several object match the specified condition, only the first match will
			be deleted
		*/
		const result = new Promise((resolve, reject)  => {
			const props = Object.keys(condition.where);
			let propMatch;
			this.model.forEach((model) => {
				propMatch = true;
				props.forEach((property) => {
					if(condition.where[property] !== model[property]) {
						propMatch = false;
					}
				});
				if(propMatch) {
					const indexOfMatchedModel = this.model.indexOf(model);
					if(this.model.splice(indexOfMatchedModel, 1)) {
						resolve({ message: `${this.singleModel} has been deleted` });
					} else {
						reject({ message: `${this.singleModel} could not be deleted` });
					}
				}
			});
			reject({ message: `${this.singleModel} not found, not action taken` });
		});

		return result;
	}
}

export default DummyDataModel;
