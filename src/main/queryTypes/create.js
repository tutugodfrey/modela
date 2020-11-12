import functs from '../helpers/functs';

const { addReturnString } = functs;
const createQuery = (modelName, condition, returnFields=[]) => {
  if (!condition) {
    return { message: 'type error! expecting an object' };
  }
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  const keys = Object.keys(condition);
  let queryString = `INSERT INTO ${modelName}`;
  let keyString = '(';
  keys.forEach((key) => {
    if (keyString === '(') {
      keyString = `${keyString} "${key}"`;
    } else {
      keyString = `${keyString}, "${key}"`;
    }
  });
  keyString = `${keyString}) VALUES`;

  let valueString = '(';
  keys.forEach((key) => {
    if (valueString === '(') {
      valueString = `${valueString} '${condition[key]}'`;
    } else {
      valueString = `${valueString}, '${condition[key]}'`;
    }
  });
  valueString = `${valueString})`;
  queryString = addReturnString(`${queryString} ${keyString} ${valueString}`, returnFields)

  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.log(queryString);
  }
  return queryString;
}

export default createQuery;
