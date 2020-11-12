export default {
  confirmPropMatch: (condition, model, matchType='and', groups=[]) => {
    const props = Object.keys(condition);
    if (groups.length && matchType === 'or') {
      const groupsPassingState = {};
      groups.forEach((groupProps, index) => {
        groupsPassingState[index] = !groupProps.find((prop) => {
          if (Array.isArray(condition[prop])) return condition[prop].includes(model[prop]);
          return condition[prop] !== model[prop];
        });
      });
      return Object.keys(groupsPassingState).map(key => groupsPassingState[key]).includes(true);   
    } else {
      if (matchType === 'or') {
        const result = props.find((prop) => {
          if (Array.isArray(condition[prop]))
            return (condition[prop].includes(model[prop]));
          return (condition[prop] === model[prop]);
        });

        if (result) return true;
        return false;
      } else {
        const finalResult = [];
        props.find((prop) => {
          if (Array.isArray(condition[prop])) {
            finalResult.push(condition[prop].includes(model[prop]));
          } else {
            finalResult.push(condition[prop] === model[prop]);
          }
        });

        return !finalResult.includes(false);
      }
    }
  },
  getFieldsToReturn: (model, returnFields=[]) => {
    if (!returnFields.length) return model;
    const modelToReturn = {}
    returnFields.forEach(field => model[field]? modelToReturn[field] = model[field]: null);
    return modelToReturn;
  },
  addReturnString: (queryString, returnFields) => {
    let returnString = '';
    if (!returnFields.length) return `${queryString} returning *`;
    returnFields.forEach(field => returnString = `${returnString} "${field}",`);
    returnString = returnString.substr(0, returnString.length - 1)
    return `${queryString} returning ${returnString.trim()}`;
  },
}
