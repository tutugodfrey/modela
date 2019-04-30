function clear() {
  const result = new Promise((resolve, reject) => {
    if (this.using_db) {
      const queryString = `DELETE from ${this.modelName}`;
      this.db_connection.query(queryString)
        .then(res => {
          resolve({ message: `Successful cleared ${this.modelName}` });
        })
        .catch(err => reject(err));
    } else {
      this.model.splice(0)
      resolve({ message: `Successful cleared ${this.modelName}` });
    }
  });

  return result;
}

export default clear;
