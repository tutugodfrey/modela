function find(condition) {
  /* return a single object that meet the condition
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject) => {
    if (!condition || !condition.where) {
      reject({ message: `missing object propertiy 'where' to find model` });
    } else {
      const props = Object.keys(condition.where);
      let propMatch;
      let searchResult;
      this.model.forEach((model) => {
        propMatch = true;
        props.forEach((property) => {
          if (condition.where[property] !== model[property]) {
            propMatch = false;
          }
        });
        if (propMatch) {
          searchResult = model;
        }
      });
      if (searchResult) {
        resolve(searchResult);
      } else {
        reject({ message: `${this.singleModel} not found`});
      }
    }
  });
  return result;
}

export default find;