const DummyDataModel = class {
	constructor(modelName) {
		this.modelName = modelName;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.model = [];
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
	// define class methods
	create(modelToCreate) {
		// create a new model
		if(this.model.length === 0) {
			modelToCreate.id = 1;
		} else {
			const lastModel = this.model[this.model.length - 1];
			const lastModelId = this.getFields(lastModel, 'id');
			modelToCreate.id = lastModelId + 1;
		}
		const result = new Promise((resolve, reject)  => {
			if(this.model.push(modelToCreate)) {
				resolve(modelToCreate);
			};
			reject({message: `Can not create ${this.singleModel}`});
		});
		return result;
	}

	update(modelToUpdate) {
		// update the model 

	}

	findById(id) {
		// return an object with the given id
		let modelToFind;
		this.model.filter((model) => {
			if(model.id === id) {
				modelToFind = model;
			}
		});
		const result = new Promise((resolve, reject) => {
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
			if(!condition.where) {
				reject(`missing object propertiy 'where' to find model`);
			} else {
				const props = Object.keys(condition.where);
				let propMatch;
				let searchResult;
				this.model.filter((model) => {
					propMatch = true;
					props.forEach((property) => {
						if(condition.where[property] !== model[property]) {
							propMatch = false;
						}
					});
					if(propMatch) {
						searchResult = model;
						resolve(searchResult);
					}
				});
				if(!searchResult) {
					resolve({ messsage: `No ${this.singleModel} found`});
				}
			}
		});

		return result;
	}

	findAll() {
		// return all the collection
		const result = new Promise((resolve, reject)  => {
			
			resolve(this.model);
			reject({message: `Can not create ${this.model}`});
		});
		return result;
	}

	destroy(id) {
		// delete an object from the collection

	}
}

export default DummyDataModel;
