import functs from '../helpers/functs';

const { getFieldsToReturn, unEscape, parseJson } = functs;
function findById(id: number | string, returnFields=[]) {
  const result = new Promise((resolve, reject) => {
    if (!id) reject({ message: 'Expected argument 1 to be id of model to search' });
    if (!Array.isArray(returnFields))
      reject({ message: 'Expected an array of fields to return' });
    const dbConnection = this.dbConnection;
    const singleModelName = this.singleModel;
    const modelName = this.modelName;
    const model = this.model;
    const getQuery = this.getQuery;
    const useDB = this.using_db;
    if (useDB) {
      const queryString = getQuery(modelName, id, returnFields);
      return dbConnection.query(queryString)
        .then((res: Object) => {
          if (!res.rows.length) return reject({ message: `${singleModelName} not found` });
          return resolve(parseJson(unEscape(res.rows[0]), this.schema));
        })
        .catch((err: any) => reject(err));
    }
    // return an object with the given id
    let modelFound = model.find((model_: any) => model_.id === id);

    if (modelFound) return resolve(getFieldsToReturn(modelFound, returnFields))
    return reject({ message: `${singleModelName} not found` });
  });
  return result;
}

export default findById;
