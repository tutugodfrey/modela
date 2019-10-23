import helpers from './helpers';

const { propMatchFail } = helpers;
function findAll(condition = 'all') {
  /* return all objects that meet the condition 
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject)  => {
    if (condition === 'all') {
      // all model in this instance
      resolve(this.model);
    }

    // array of objects that meet the condition
    const models = this.model.filter((model) => {
      const mismatch = propMatchFail(condition.where, model, condition.type);
      if (!mismatch) {
        // a match was found
        return model;
      };
    });
    resolve(models)
  });
  return result;
}

export default findAll;
