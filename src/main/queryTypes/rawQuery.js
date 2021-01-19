function rawQuery(queryString) {
  if (!queryString) return 'Please provide a query string'
  const result = new Promise((resolve, reject) => {
    this.dbConnection.query(queryString)
      .then((res) => {
        return resolve(res.rows);
      })
      .catch(error => reject(error));
  });
  return result;
}

export default rawQuery;
