import functs from '../helpers/functs';

const {
  addReturnString,
  generateGroupString,
  generateWhereString,
  generatePropString
} = functs;



const updateQuery = (modelName, conditions, newProps, returnFields=[]) => {
  if (typeof newProps !== 'object' || typeof conditions !== 'object') {
    return { message: 'type error! expecting an object' };
  }

  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  let queryString;
  let groupString = '';
  let whereString = '';
  const type = conditions.type ? conditions.type.toUpperCase() : 'AND';
  if (conditions.groups && type === 'OR') {
    groupString = generateGroupString(conditions, type);
  }

  if (!groupString) {
    whereString = generateWhereString(conditions, type);
  }

  queryString = generatePropString(modelName, newProps);
  const generatedQueryString = new Promise((resolve, reject) => {
      if (groupString) {
        queryString = `${queryString} WHERE ${groupString}`;
      } else {
        queryString = `${queryString} WHERE ${whereString}`;
      }

      queryString = addReturnString(queryString, returnFields)
      if (process.env.NODE_ENV !== 'production') {
        /* eslint-disable no-console */
        console.log(queryString);
      }

      if (queryString) resolve(queryString);
  });
  return generatedQueryString;
}

export default updateQuery;
