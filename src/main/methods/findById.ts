import functs from '../helpers/functs';

const { getFieldsToReturn, unEscape, parseJson } = functs;
function findById(id: number | string, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    if (!id) reject({ message: 'Expected argument 1 to be id of model to search' });
    if (!Array.isArray(returnFields))
      reject({ message: 'Expected an array of fields to return' });

    if (this.using_db) {
      const queryString = this.getQuery(this.modelName, id, returnFields);
      this.dbConnection.query(queryString)
        .then(res => {
          if (!res.rows.length) return reject({ message: `${this.singleModel} not found` });
          return resolve(parseJson(unEscape(res.rows[0]), this.schema));
        })
        .catch((err: any) => reject(err));
    } else {
      // return an object with the given id
      let modelFound = this.model.find((model: any) => model.id === id);

      if (modelFound) return resolve(getFieldsToReturn(modelFound, returnFields))
      return reject({ message: `${this.singleModel} not found` });
    }
  })
  return result;
}

export default findById;
