import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const { getFieldsToReturn, confirmPropMatch, unEscape, parseJson } = functs;
function findAll(conditions: any = 'all', returnFields=[]) {
  /* return all objects that meet the conditions 
    conditions is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */

  const result = new Promise((resolve, reject)  => {
    if (!Array.isArray(returnFields)) {
      reject({ message: 'Expected an array of fields to return'});
    }

    let checkWhereKeys: number | boolean;
    const checkAll = conditions === 'all';
    const checkWhere = (conditions.where);
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
        .then((res: any) => {
          return resolve(parseJson(unEscape(res.rows), this.schema))
        })
        .catch((err: any) => {
          if (err.code === '42P01') {
            return reject({ message: `table ${this.modelName} does not exist`})
          }
          return reject(err)
        });
    } else {
      if (conditions === 'all') {
        if (!returnFields.length) resolve(this.model);
        const model = this.model.map((model: any) => {
          const model_ = {};
          returnFields.forEach(field => model[field] ? model_[field] = model[field] : null);
          return model_;
        });
        return resolve(model);
      }
      // array of objects that meet the conditions
      const models = this.model.filter((model: any) => {
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
