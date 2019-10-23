import helpers from './helpers';

const { propMatchFail } = helpers;
function find(condition) {
  /* return a single object that meet the condition
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject) => {
    if (!condition || !condition.where) {
      reject({ message: `missing object propertiy 'where' to find model` });
    };
    this.model.find((model) => {
      const mismatch = propMatchFail(condition.where, model, condition.type);
      if (!mismatch) {
        resolve(model);
      };
    });
    reject({ message: `${this.singleModel} not found`});
  });
  return result;
};

export default find;
