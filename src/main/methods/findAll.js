function findAll(condition = 'all') {
  /* return all objects that meet the condition 
    condition is single object with property where whose value is further
    an object with key => value pair of the properties of the object to find
  */
  const result = new Promise((resolve, reject)  => {
    if(condition === 'all') {
      // all model in this instance
      resolve(this.model);
    } else {
      // find model that meets the given condition
      const props = Object.keys(condition.where);

      // array of objects that meet the condition
      const searchResult = [];
      let propMatch;
      this.model.forEach((model) => {
        propMatch = true;
        props.forEach((property) => {
          if(condition.where[property] !== model[property]) {
            propMatch = false;
          }
        });
        if(propMatch) {
          searchResult.push(model);;
        }
      });
      resolve(searchResult)
    }
  });
  return result;
}

export default findAll;
