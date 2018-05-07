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
    this.createModel = this.createModel.bind(this);
    this.getObjectByField = this.getObjectByField.bind(this);
    this.getFields = this.getFields.bind(this);
  }

  getObjectByField(arrayOfObjects, objectField, fieldValue) {
    for (const objCollection of arrayOfObjects) {
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
    const result = new Promise((resolve, reject) => {
      if (this.requiredFields.length === 0) {
        this.createModel(modelToCreate, resolve, reject);
      } else {
        let allFieldsPassed = true;
        this.requiredFields.forEach((required) => {
          if (!modelToCreate[required]) {
            allFieldsPassed = false;
          }
        });
        if (!allFieldsPassed) {
          reject({ message: 'missing required field' });
        } else {
          this.createModel(modelToCreate, resolve, reject);
        }
      }
    });
    return result;
  }

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
              reject({ message: 'duplicate entry for unique key' });
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

  update(modelToUpdate, propsToUpdate) {
    /*
      propsToUpdate contain the new properties to replace the old ones
      this method should be called on the particular object to update.
      which means that before call update you must use the finder methods to
      get the particular object.
    */
    const result = new Promise((resolve, reject) => {
      if ((typeof propsToUpdate === 'object') && (typeof modelToUpdate === 'object')) {
        const props = Object.keys(propsToUpdate);
        this.model.forEach((model) => {
          if (modelToUpdate.id === model.id) {
            let wrongModel = false;
            if (this.uniqueKeys.length !== 0) {
              this.uniqueKeys.forEach((prop) => {
                if (modelToUpdate[prop] !== model[prop]) {
                  wrongModel = true;
                  reject({ message: `${this.singleModel} not found` });
                }
              });
            }
            if (!wrongModel) {
              const indexOfModel = this.model.indexOf(model);
              props.forEach((property) => {
                model[property] = propsToUpdate[property];
              });
              this.model[indexOfModel] = model;
              resolve(model);
            }
          }
        });
      } else {
        reject({ message: 'invalid argument passed to update! expects argument1 and argument2 to be objects' });
      }
    });
    return result;
  }

  findById(id) {
    // return an object with the given id
    let modelToFind;
    this.model.filter((model) => {
      if (model.id === id) {
        modelToFind = model;
      }
    });
    const result = new Promise((resolve, reject) => {
      if (modelToFind) {
        resolve(modelToFind);
      } else {
        reject({ error: `${this.singleModel} not found` });
      }
    });
    return result;
  }

  find(condition) {
    /* return a single object that meet the condition
      condition is single object with property where whose value is further
      an object with key => value pair of the properties of the object to find
    */
    const result = new Promise((resolve, reject) => {
      if (!condition || !condition.where) {
        reject({ message: 'missing object propertiy \'where\' to find model' });
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
            resolve(searchResult);
          }
        });
        if (!searchResult) {
          reject({ message: `${this.singleModel} not found` });
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
    const result = new Promise((resolve, reject) => {
      if (condition === 'all') {
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
            if (condition.where[property] !== model[property]) {
              propMatch = false;
            }
          });
          if (propMatch) {
            searchResult.push(model);
          }
        });
        if (searchResult) {
          resolve(searchResult);
        } else {
          resolve(searchResult);
        }
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
    const result = new Promise((resolve, reject) => {
      const props = Object.keys(condition.where);
      let propMatch;
      this.model.forEach((model) => {
        propMatch = true;
        props.forEach((property) => {
          if (condition.where[property] !== model[property]) {
            propMatch = false;
          }
        });
        if (propMatch) {
          const indexOfMatchedModel = this.model.indexOf(model);
          if (this.model.splice(indexOfMatchedModel, 1)) {
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
};

export default DummyDataModel;
