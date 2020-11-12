import functs from '../helpers/functs';

const { getFieldsToReturn, confirmPropMatch } = functs;
function findAll(condition = 'all', returnFields=[]) {
  /* return all objects that meet the condition 
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }

  const result = new Promise((resolve, reject)  => {
    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, condition, returnFields);
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
    return resolve(models.map(model => {
      return getFieldsToReturn(model, returnFields)
    }));
  }
  });

  return result;
}

export default findAll;
