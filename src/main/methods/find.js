import functs from '../helpers/functs';

const { confirmPropMatch, getFieldsToReturn } = functs;
function find(condition, returnFields=[]) {
  /* return a single object that meet the condition
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }

  const result = new Promise((resolve, reject) => {
    if (!condition || !condition.where)
      reject({ message: `missing object propertiy 'where' to find model` });
    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, condition, returnFields);
      this.dbConnection.query(queryString)
        .then(res => {
          if (!res.rows.length) {
            reject({ message: `${this.singleModel} not found` });
          }
          resolve(res.rows[0])
        })
        .catch(err => {
          reject(err)
        });
    } else {
      this.model.find((model) => {
        const findMatchProps = confirmPropMatch(condition.where, model, condition.type);
        if (findMatchProps) return resolve(getFieldsToReturn(model, returnFields));
      });
      reject({ message: `${this.singleModel} not found`});
    }
  });
  return result;
};

export default find;
