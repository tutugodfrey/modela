import functs from '../helpers/functs';

const { confirmPropMatch, getFieldsToReturn } = functs;
function find(condition, returnFields=[]) {
  /* return a single object that meet the condition
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject) => {
    if (!condition || !condition.where) {
      reject({ message: `Missing object property 'where' to find model` });
    }

    if (!Array.isArray(returnFields)) {
      reject({ message: 'Expected an array of fields to return' });
    }

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
        const findMatchProps = confirmPropMatch(model, condition);
        if (findMatchProps) return resolve(getFieldsToReturn(model, returnFields));
      });
      reject({ message: `${this.singleModel} not found`});
    }
  });
  return result;
};

export default find;
