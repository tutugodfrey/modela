function clear() {
  const result = new Promise((resolve, reject) => {
    this.model.splice(0)
    resolve({ message: `Successful cleared ${this.modelName}` });
  });

  return result;
}

export default clear;
