import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const { getFieldsToReturn, confirmPropMatch, unEscape, parseJson } = functs;
function findAll(conditions: Condition | String = 'all', returnFields=[]) {
  /* return all objects that meet the conditions 
    conditions is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const modelName = this.modelName;
  const schema = this.schema;
  const models = this.model;
  const dbConnection = this.dbConnection;
  const getQuery = this.getQuery;
  const useDB = this.using_db;
  const checkWhere = conditions.where;
  const checkGroup = conditions.group;
  const checkLimit = conditions.limit;
  const result = new Promise((resolve, reject)  => {
    if (!Array.isArray(returnFields)) reject({ message: 'Expected an array of fields to return'});

    let checkWhereKeys: Number | Boolean = false;
    const checkAll = conditions === 'all';
    const checkObjType = Object.prototype.toString.call(conditions) === '[object Object]';
    if (checkObjType && checkWhere) {
      checkWhereKeys = Object.keys(checkWhere) ? Object.keys(checkWhere).length : false;
    }

    if ((!checkAll && !checkObjType) ||
       (!checkAll && !checkWhere) ||
       (checkWhere && !checkWhereKeys)) {
        if (checkLimit) {
          // pass if limit is provided
        } else {
        reject({ message:
          'Expected an object with key \'where\' or the string \'all\' at position 1', 
        });
      }
    }

    if (useDB) {
      const queryString = getQuery(modelName, conditions, returnFields);
      return dbConnection.query(queryString)
        .then((res: any) => resolve(parseJson(unEscape(res.rows), schema)))
        .catch((err: any) => {
          if (err.code === '42P01') return reject({ message: `table ${modelName} does not exist`});
          return reject(err)
        });
    }
    if (conditions === 'all') {
      if (!returnFields.length) resolve(models);
      const model = models.map((model: Object) => {
        const model_ = {};
        returnFields.forEach(field => model[field] ? model_[field] = model[field] : null);
        return model_;
      });
      return resolve(model);
    }
    // array of objects that meet the conditions
    let modelsToReturn: Array<object> = [];
    let countLimit: number = 0
      for (let model_ of models) {
        if (countLimit === checkLimit) {
          break;
        }
        if (checkWhere || checkGroup) {
          const findMatchProps = confirmPropMatch(model_, conditions);
          if (findMatchProps) {
            modelsToReturn.push(model_);
            countLimit++;
          }
        } else {
          // No condition specified
          modelsToReturn.push(model_);
          countLimit++
        }
      }
    return resolve(modelsToReturn.map((model_: Object) => getFieldsToReturn(model_, returnFields)));
    
  });

  return result;
}

export default findAll;
