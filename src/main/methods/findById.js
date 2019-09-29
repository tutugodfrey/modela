function findById(id) {
  // return an object with the given id
  let modelFound =this.model.find((model) => {
    return model.id === id;
  });
  const result = new Promise((resolve, reject) => {
    if (modelFound) {
      resolve(modelFound)
    }
    reject({ error: `${this.singleModel} not found` });
  })
  return result;
}

export default findById;
