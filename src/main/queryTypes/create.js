const createQuery = (modelName, condition) => {
  if (!condition) {
    return { message: 'type error! expecting an object' };
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
  queryString = `${queryString} ${keyString} ${valueString} returning *`;

  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.log(queryString);
  }
  return queryString;
}

export default createQuery;
