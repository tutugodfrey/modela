import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const {
  log,
  addReturnString,
  generateGroupString,
  generateWhereString,
  generatePropString,
  escapeConditions,
  prepareDataForStorage,
} = functs;



function updateQuery(modelName: string, conditions: Condition, newProps: object, returnFields: Array<any>=[]) {
  if (typeof newProps !== 'object' || typeof conditions !== 'object') {
    return { message: 'type error! expecting an object' };
  }

  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  let queryString: string;
  let groupString: string = '';
  let whereString: string = '';
  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  const newConditions = escapeConditions(conditions, this.schema)
  if (conditions.groups && type === 'OR') {
    groupString = generateGroupString(newConditions, type);
  }

  if (!groupString) {
    whereString = generateWhereString(newConditions, type);
  }

  queryString = generatePropString(modelName, prepareDataForStorage(newProps, this.schema), this.schema);
  const generatedQueryString = new Promise((resolve, reject) => {
      if (groupString) {
        queryString = `${queryString} WHERE ${groupString}`;
      } else {
        queryString = `${queryString} WHERE ${whereString}`;
      }

      queryString = addReturnString.call(this, queryString, returnFields)

      if (queryString) resolve(log(queryString));
  });
  return generatedQueryString;
}

export default updateQuery;
