const deleteQuery = (modelName, condition) => {
  const typeOfCondition = (typeof condition);
  if (typeOfCondition !== 'object') {
    return { message: 'type error! expecting an object' };
  }
  let queryString;
  if (!condition) {
    queryString = `SELECT ALL FROM ${modelName}`;
  } else {
    const keys = Object.keys(condition.where);
    queryString = `DELETE FROM ${modelName}`;
    keys.forEach((key) => {
      if (queryString.indexOf('WHERE') < 0) {
        queryString = `${queryString} WHERE "${key}" = '${condition.where[key]}'`;
      } else {
        queryString = `${queryString} AND "${key}" = '${condition.where[key]}'`;
      }
    });
  }
  queryString = `${queryString} returning *`;
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.log(queryString);
  }
  return queryString;
}

export default deleteQuery;
