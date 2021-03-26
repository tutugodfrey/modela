import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const {
  log,
  addReturnString,
  generateWhereString,
  generateGroupString,
  escapeConditions,
} = functs;
function deleteQuery(modelName: string, conditions: Condition, returnFields: Array<any>=[]) {
  const typeOfCondition = (typeof conditions);
  if (typeOfCondition !== 'object') {
    return { message: 'type error! expecting an object' };
  }

  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  let queryString = `DELETE FROM ${modelName}`;
  const newConditions = escapeConditions(conditions, this.schema);
  const groupString = conditions.groups ? generateGroupString(newConditions, type) : null;
  const whereString = generateWhereString(newConditions, type);
  queryString = groupString !== null ?
    `${queryString} WHERE ${groupString}` :
    `${queryString} WHERE ${whereString}`;
  queryString = addReturnString.call(this, queryString, returnFields);

  return log(queryString);
}

export default deleteQuery;
