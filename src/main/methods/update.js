import helpers from './helpers';

const { propMatchFail } = helpers;
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
    let modelsFound = this.model.filter((model) => {
      // if only id is specified
      if (Object.keys(conditions.where).length === 1 && conditions.where.id) {
        return model.id === conditions.where.id
      }
      const checkFail = propMatchFail(conditions.where, model, conditions.type, conditions.groups);
      if (!checkFail) return true;
    });

    if (!modelsFound.length) {
      reject({ message: `${this.singleModel} not found` })
    }

    const updatedModels = modelsFound.map((model) => {
      props.forEach((property) => {
        model[property] = propsToUpdate[property]
      });
      model.updatedAt = new Date();
      return model;
    })
    // return a single object
    if (updatedModels.length === 1) resolve(updatedModels[0]);

    // return an array of the modified models
    resolve(updatedModels);
  });
  return result;
}

export default update;
