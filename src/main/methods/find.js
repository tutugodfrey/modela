import helpers from './helpers';

const { confirmPropMatch } = helpers;
function find(condition) {
  /* return a single object that meet the condition
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject) => {
    if (!condition || !condition.where)
      reject({ message: `missing object propertiy 'where' to find model` });
    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, condition);
      this.db_connection.query(queryString)
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
        if (findMatchProps) resolve(model);
      });
      reject({ message: `${this.singleModel} not found`});
    }
  });
  return result;
};

export default find;
