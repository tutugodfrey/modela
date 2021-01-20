import functs from '../helpers/functs';

const {
  log,
  addReturnString,
  generateWhereString,
  generateGroupString,
} = functs;
const getQuery = (modelName, conditions, returnFields=[]) => {
  const typeOfCondition = (typeof conditions);
  if (typeOfCondition !== 'string' && typeOfCondition !== 'object' && typeOfCondition !== 'number') {
    return { message: 'type error!' };
  }

  const returnString = returnFields.length ?
    addReturnString('', returnFields).substr(11) : '*';
  let queryString = `SELECT ${returnString} FROM ${modelName}`;
  if (conditions === 'all') return log(queryString);
  if (typeof conditions === 'number') return log(`${queryString} WHERE "id" = ${conditions}`);

  /* eslint-disable prefer-destructuring */
  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  const whereString = generateWhereString(conditions, type);
  const groupString = conditions.groups ? generateGroupString(conditions, type) : null;
  queryString = groupString !== null ? `${queryString} WHERE ${groupString}` : `${queryString} WHERE ${whereString}`;
  return log(queryString);
}

export default getQuery;
