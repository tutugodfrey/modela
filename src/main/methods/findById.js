function findById(id) {
  // return an object with the given id
  let modelToFind =this.model.filter((model) => {
    return model.id === id;
  });
  const result = new Promise((resolve, reject) => {
    modelToFind = modelToFind[0];
    if(modelToFind) {
      resolve(modelToFind)
    } else {
      reject({ error: `${this.singleModel} not found` });
    }
  })
  return result;
}

export default findById;
