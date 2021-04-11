import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const {
  log,
  addReturnString,
  generateWhereString,
  generateGroupString,
  escapeConditions,
} = functs;
function getQuery(modelName: string, conditions: Condition | any, returnFields: Array<any>=[]) {
  const typeOfCondition = (typeof conditions);
  const { schema } = this;
  if (typeOfCondition !== 'string' && typeOfCondition !== 'object' && typeOfCondition !== 'number') {
    return { message: 'type error!' };
  }
  const { limit } = conditions;
  const returnString = addReturnString.call(this, '', returnFields).substr(11);
  let queryString = `SELECT ${returnString} FROM ${modelName}`;
  if (conditions === 'all') return log.call(this, queryString);
  if (typeof conditions === 'number') return log.call(this, `${queryString} WHERE "id" = ${conditions}`);

  /* eslint-disable prefer-destructuring */
  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  const newConditions = escapeConditions(conditions, schema);
  let whereString: string = '';
  const groupString = conditions.groups ? generateGroupString(newConditions, type) : null;
  if (!groupString && newConditions.where) {
    whereString = generateWhereString(newConditions, type);
  }
  if (groupString) {
    queryString = `${queryString} WHERE ${groupString}`;
  } else if (whereString) {
    queryString = `${queryString} WHERE ${whereString}`;
  }
  queryString = limit ? `${queryString} LIMIT ${limit}` : queryString;
  return log.call(this, queryString);
}

export default getQuery;
