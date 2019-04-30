function findById(id) {
  const result = new Promise((resolve, reject) => {
    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, id);
      this.db_connection.query(queryString)
        .then(res => {
          if (!res.rows.length) {
            reject({ message: `${this.singleModel} not found` })
          }
          resolve(res.rows[0])
        })
        .catch(err => {
          reject(err)
        });
    } else {
      // return an object with the given id
      let modelFound =this.model.find((model) => {
        return model.id === id;
      });

      if (modelFound) {
        resolve(modelFound)
      }
      reject({ message: `${this.singleModel} not found` });
    }
  })
  return result;
}

export default findById;
