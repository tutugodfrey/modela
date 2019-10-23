export default {
  propMatchFail: (condition, model, matchType='and') => {
    const props = Object.keys(condition);
    if (matchType === 'and') {
      return props.find((prop) => {
        if (condition[prop] !== model[prop]) {
          // return the prop that fail the search
          return prop;
        }
      });
    }
    if (matchType === 'or') {
      const result = props.find((prop) => {
        if (condition[prop] === model[prop]) {
          return props;
        }
      });
      if (result) {
        // indicative that there is a match
        return undefined
      }

      // return the model that does not match the search
      return model
    }
  },
}
