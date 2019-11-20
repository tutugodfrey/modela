export default {
  propMatchFail: (condition, model, matchType='and', groups=[]) => {
    const props = Object.keys(condition);
    if (!groups.length) {
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
          return undefined;
        }
      }

      // return the model that does not match the search
      return model;
    } else if (groups.length && matchType === 'or') {
      let groupPropsPassing = '';
      const failingGroups = {};
      const failingFields = [];
      groups.map((groupProps, index) => {
        failingGroups[index] = false;
        groupPropsPassing = groupProps.find((prop) => {
          if (condition[prop] !== model[prop]) {
            // return the prop that fail the search
            failingGroups[index] = true;
            failingFields.push(props);
            return prop;
          }
        });
        return groupPropsPassing;
      });

      if (Object.keys(failingGroups).map(key => failingGroups[key]).indexOf(false === -1)) {
        return failingFields;
      }
    }
  },
}
