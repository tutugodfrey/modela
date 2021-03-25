import functs from '../helpers/functs';
import { Condition, DataModelaType } from '../../main/interfaces';

const { confirmPropMatch, getFieldsToReturn, unEscape, parseJson } = functs;
function update(propsToUpdate: any, conditions: Condition, returnFields=[]) {
  /* 
    propsToUpdate contain the new properties to replace the old ones
    this method should be called on the particular object to update.
    which means that before call update you must use the finder methods to 
    get the particular object.
  */
  const allowedFields = this.allowedFields;
  const updateQuery = this.updateQuery;
  const dbConnection = this.dbConnection;
  const singleModel = this.singleModel;
  const modelName = this.modelName;
  const getQuery = this.getQuery
  const schema = this.schema;
  const model = this.model;
  const using_db = this.using_db;
  const whereCondition = conditions ? conditions.where : undefined;
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  const result = new Promise((resolve, reject) => {
    if (!propsToUpdate || (Object.prototype.toString.call(propsToUpdate) !== '[object Object]'))
    return reject({ message:
      'require argument 1 of type object. only one argument supplied!' });

    if (!whereCondition)
      return reject({ message:
        'require argument at position 2 to specify update condition' });

    const missingSchemaProp = propsToUpdate && Object.keys(propsToUpdate).find(field => {
      if (!['id', 'updatedAt', 'createdAt'].includes(field)) {
        return !allowedFields.includes(field);
      }
    });
    if (missingSchemaProp) {
      reject({ message: `${missingSchemaProp} is not defined in schema for ${modelName}`});
    }
      
    
    if (using_db) {
      propsToUpdate.updatedAt = 'now()';
      const queryString = getQuery(modelName, conditions, returnFields);
      dbConnection.query(queryString)
        .then((res: Object) => res.rows[0])
        .then(( /* user created */ ) => updateQuery(
          modelName, conditions, propsToUpdate, returnFields
        ))
        .then((queryString: String) => dbConnection.query(queryString))
        .then((res: Object) => {
          const rows = res.rows;
          if (!rows.length)
            return reject({ message: `${singleModel} not found` });
          return resolve(parseJson(unEscape(rows[0]), schema));
        })
        .catch((err: Object) => reject(err));
    } else {
      const props = Object.keys(propsToUpdate);
      let modelsFound = model.filter((model: any) => {
        // if only id is specified
        if (Object.keys(whereCondition).length === 1 && whereCondition.id) 
          return model.id === whereCondition.id;
        const findMatchProps = confirmPropMatch(model, conditions);
        if (findMatchProps) return true;
      });

      if (!modelsFound.length) reject({ message: `${singleModel} not found` });
      const updatedModels = modelsFound.map((model_: any) => {
        props.forEach((property) => {
          model_[property] = propsToUpdate[property]
        });
        model_.updatedAt = new Date();
        return resolve(getFieldsToReturn(model_, returnFields))
      });
      // return a single object
      if (updatedModels.length === 1) resolve(parseJson(unEscape(updatedModels[0]), schema));

      // return an array of the modified models
      resolve(parseJson(unEscape(updatedModels), schema));
    }
  });
  return result;
}

export default update;
