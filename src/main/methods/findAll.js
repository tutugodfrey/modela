import functs from '../helpers/functs';

const { getFieldsToReturn, confirmPropMatch } = functs;
function findAll(conditions = 'all', returnFields=[]) {
  /* return all objects that meet the conditions 
    conditions is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */

  const result = new Promise((resolve, reject)  => {
    if (!Array.isArray(returnFields)) {
      reject({ message: 'Expected an array of fields to return'});
    }

    let checkWhereKeys;
    const checkAll = conditions === 'all';
    const checkWhere = conditions.where;
    const checkObjType = Object.prototype.toString.call(conditions) === '[object Object]';
    if (checkObjType && checkWhere) {
      checkWhereKeys = Object.keys(conditions.where) ? Object.keys(conditions.where).length : false;
    }

    if ((!checkAll && !checkObjType) ||
       (!checkAll && !checkWhere) ||
       (checkWhere && !checkWhereKeys)) {
        reject({ message:
          'Expected an object with key \'where\' or the string \'all\' at position 1', 
        });
    }

    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, conditions, returnFields);
      return this.dbConnection.query(queryString)
        .then(res => {
          return resolve(res.rows)
        })
        .catch(err => {
          if (err.code === '42P01') {
            return reject({ message: `table ${this.modelName} does not exist`})
          }
          return reject(err)
        });
    } else {
    if (conditions === 'all') {
      if (!returnFields.length) resolve(this.model);
      const model = this.model.map(model => {
        const model_ = {};
        returnFields.forEach(field => model[field] ? model_[field] = model[field] : null);
        return model_;
      });
      return resolve(model);
    }
    // array of objects that meet the conditions
    const models = this.model.filter((model) => {
      const findMatchProps = confirmPropMatch(model, conditions);
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
