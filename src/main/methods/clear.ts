import { Error } from '../interfaces';

function clear() {
  const result = new Promise((resolve, reject) => {
    const modelName = this.modelName
    if (this.using_db) {
      const queryString = `TRUNCATE ${modelName}`;
      this.dbConnection.query(queryString)
        .then(() => {
          resolve({ message: `Successfully cleared ${modelName}` });
        })
        .catch((err: Error) => {
          if (err.message.includes('does not exist')) {
            return resolve({ message: `Table ${modelName} does not exist` })
          }
          reject(err)
        });
    } else {
      this.model.splice(0)
      resolve({ message: `Successfully cleared ${modelName}` });
    }
  });

  return result;
}

export default clear;
