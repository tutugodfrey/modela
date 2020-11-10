import helpers from './helpers';

const { confirmPropMatch } = helpers;
function findAll(condition = 'all') {
  /* return all objects that meet the condition 
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject)  => {
    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, condition);
      this.db_connection.query(queryString)
        .then(res => {
          resolve(res.rows)
        })
        .catch(err => {
          reject(err)
        });
    } else {
    if (condition === 'all') resolve(this.model);
    // array of objects that meet the condition
    const models = this.model.filter((model) => {
      const findMatchProps = confirmPropMatch(
        condition.where,
        model,
        condition.type,
        condition.groups);
      if (findMatchProps) return model;
    });
    return resolve(models)
  }
  });

  return result;
}

export default findAll;
