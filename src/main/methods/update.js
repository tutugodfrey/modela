function update(conditions, propsToUpdate) {
  /* 
    propsToUpdate contain the new properties to replace the old ones
    this method should be called on the particular object to update.
    which means that before call update you must use the finder methods to 
    get the particular object.
  */
  
  const result = new Promise((resolve, reject) => {
    if (!conditions || !conditions.where) {
      reject({ message:
        'require argument at position 1 to specify update condition' });
    }
    if (!propsToUpdate || (typeof propsToUpdate !== 'object')) {
      reject({ message:
        'require argument 2 of type object. only one argument supplied!' });
    }

    const props = Object.keys(propsToUpdate);
    let foundModel = this.model.filter((model) => {
      // use id as the primary condition to check
      if (conditions.where.id) {
        return model.id === conditions.where.id
      } else {
        let check = true;
        for(let key in conditions.where) {
          if (conditions.where[key] !== model[key]) {
            check = false;
          }
        }
        if (check) return true;
      }
    });
    if (!foundModel.length) {
      reject({ message: `${this.singleModel} not found` })
    }
    foundModel.forEach(model => {
      props.forEach((property) => {
        model[property] = propsToUpdate[property]
      });
      model.updatedAt = new Date();
    })
    // return a single object
    if (foundModel.length === 1) resolve(foundModel[0]);

    // return an array of the modified models
    resolve(foundModel);
  });
  return result;
}

export default update;
