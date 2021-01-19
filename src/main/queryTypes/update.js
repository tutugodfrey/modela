import functs from '../helpers/functs';

const { addReturnString } = functs;
const updateQuery = (modelName, conditions, newProps, returnFields=[]) => {
  if (typeof newProps !== 'object' || typeof conditions !== 'object') {
    return { message: 'type error! expecting an object' };
  }

  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  let queryString;
  let groupCondition;
  let groupString = '';
  let whereString = '';
  let propString = '';
  const whereCondition = conditions.where;
  const whereKeys = Object.keys(whereCondition);
  const newPropsKeys = Object.keys(newProps);
  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  if (conditions.groups && type === 'OR') {
    groupCondition = conditions.groups;
    groupCondition.forEach(group => {
      if (groupString) {
        groupString = `${groupString} ${type}`;
      }
      let groupStr = '';
      group.forEach(field => {
        if (!groupStr) {
          groupStr = `("${field}" = '${whereCondition[field]}'`;
        } else {
          groupStr = `${groupStr} AND "${field}" = '${whereCondition[field]}'`;
        }
      });
      groupString = `${groupString} ${groupStr})`;
    });
  }

  queryString = `UPDATE ${modelName} SET`;
  newPropsKeys.forEach((prop) => {
    if (propString === '') {
      propString = `${propString}"${prop}" = '${newProps[prop]}'`;
    } else {
      propString = `${propString}, "${prop}" = '${newProps[prop]}'`;
    }
  });

  if (!groupString) {
    whereKeys.forEach((prop) => {
      if (!whereString) {
        whereString = `${whereString}"${prop}" = '${whereCondition[prop]}'`;
      } else {
        whereString = `${whereString} ${type} "${prop}" = '${whereCondition[prop]}'`;
      }
    });
  }

  if (groupCondition && groupString) {
    queryString = `${queryString} ${propString} WHERE ${groupString}`;
  } else {
    queryString = `${queryString} ${propString} WHERE ${whereString}`;
  }
  queryString = addReturnString(queryString, returnFields)

  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.log(queryString);
  }
  return queryString;
}

export default updateQuery;
