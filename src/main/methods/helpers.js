export default {
  propMatchFail: (condition, model) => {
    const props = Object.keys(condition);
    return props.find((prop) => {
      if(condition[prop] !== model[prop]) {
        return prop;
      }
    });
  },
}
