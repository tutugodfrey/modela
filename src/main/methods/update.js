import functs from '../helpers/functs';

const { confirmPropMatch, getFieldsToReturn  } = functs;
function update(conditions, propsToUpdate, returnFields=[]) {
  /* 
    propsToUpdate contain the new properties to replace the old ones
    this method should be called on the particular object to update.
    which means that before call update you must use the finder methods to 
    get the particular object.
  */
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  const result = new Promise((resolve, reject) => {
    if (!conditions || !conditions.where)
      reject({ message:
        'require argument at position 1 to specify update condition' });

    if (!propsToUpdate || (typeof propsToUpdate !== 'object'))
      reject({ message:
        'require argument 2 of type object. only one argument supplied!' });
    
    if (this.using_db) {
      propsToUpdate.updatedAt = 'now()';
      const queryString = this.getQuery(this.modelName, conditions, propsToUpdate);
      this.db_connection.query(queryString)
        .then(res => {
          return res.rows[0]
        })
        .then((user) => {
          const queryString = this.updateQuery(this.modelName, conditions, propsToUpdate, returnFields);
          this.db_connection.query(queryString)
          .then(res => {
            if (!res.rows.length) {
              return reject({ message: `${this.singleModel} not found` });
            }
            return resolve(res.rows[0])
          })
        })
        .catch(err => {
          return reject(err)
        });
    } else {
      const props = Object.keys(propsToUpdate);
      let modelsFound = this.model.filter((model) => {
        // if only id is specified
        if (Object.keys(conditions.where).length === 1 && conditions.where.id) 
          return model.id === conditions.where.id;
        const findMatchProps = confirmPropMatch(conditions.where, model, conditions.type, conditions.groups);
        if (findMatchProps) return true;
      });

      if (!modelsFound.length) reject({ message: `${this.singleModel} not found` });

      const updatedModels = modelsFound.map((model) => {
        props.forEach((property) => {
          model[property] = propsToUpdate[property]
        });
        model.updatedAt = new Date();
        return resolve(getFieldsToReturn(model, returnFields))
      });
      // return a single object
      if (updatedModels.length === 1) resolve(updatedModels[0]);

      // return an array of the modified models
      resolve(updatedModels);
    }
  });
  return result;
}

export default update;
