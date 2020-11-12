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
  const type = conditions.type;
  const whereCondition = conditions.where;
  if (conditions.groups && type === 'or') {
    groupCondition = conditions.groups;
    groupCondition.forEach(group => {
      if (groupString) {
        groupString = `${groupString} OR`;
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
  console.log('condition', whereCondition, groupCondition, groupString)
  const whereKeys = Object.keys(whereCondition);
  const newPropsKeys = Object.keys(newProps);
  queryString = `UPDATE ${modelName} SET`;
  let propString = '';
  newPropsKeys.forEach((prop) => {
    if (propString === '') {
      propString = `${propString}"${prop}" = '${newProps[prop]}'`;
    } else {
      propString = `${propString}, "${prop}" = '${newProps[prop]}'`;
    }
  });

  let whereString = '';
  whereKeys.forEach((prop) => {
    if (!whereString) {
      whereString = `${whereString}"${prop}" = '${whereCondition[prop]}'`;
    } else {
      whereString = `${whereString} AND "${prop}" = '${whereCondition[prop]}'`;
    }
  });

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
