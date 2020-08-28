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
}
