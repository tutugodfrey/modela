import functs from '../helpers/functs';

const { addReturnString, generateWhereString, generateGroupString } = functs;
const deleteQuery = (modelName, conditions, returnFields=[]) => {
  const typeOfCondition = (typeof conditions);
  if (typeOfCondition !== 'object') {
    return { message: 'type error! expecting an object' };
  }

  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  let queryString = `DELETE FROM ${modelName}`;
  const groupString = conditions.groups ? generateGroupString(conditions, type) : null;
  const whereString = generateWhereString(conditions, type);
  queryString = groupString !== null ?
    `${queryString} WHERE ${groupString}` :
    `${queryString} WHERE ${whereString}`;
  queryString = addReturnString(queryString, returnFields);

  /* eslint-disable no-console */
  process.env.NODE_ENV === 'production' ? null :  console.log(queryString); 
  return queryString;
}

export default deleteQuery;
