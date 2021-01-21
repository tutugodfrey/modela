function rawQuery(queryString: string) {
  if (!queryString) return 'Please provide a query string'
  const result = new Promise((resolve, reject) => {
    this.dbConnection.query(queryString)
      .then((res: { rows: unknown; }) => {
        return resolve(res.rows);
      })
      .catch((error: any) => reject(error));
  });
  return result;
}

export default rawQuery;
