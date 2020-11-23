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
  checkDatatype: (allowedFields, schema, modelToCreate) => {
    let datatypeValidationMessage = '';
    const datatypeField = allowedFields.find(field => {
      if (schema[field].dataType) {
        if (typeof modelToCreate[field] === 'object') {
          let type = '';
          if (Object.prototype.toString.call(modelToCreate[field]) === '[object Array]') {
            type = 'array';
          }

          if (type !== schema[field].dataType) {
            if (field !== 'createdAt' || field !== 'updatedAt') {
              datatypeValidationMessage = `Expected input of type ${schema[field].dataType} for ${field}`;
              return true;
            }
          }
        } else {
          if (typeof modelToCreate[field] !== schema[field].dataType) {
            if (field === 'createdAt' || field === 'updatedAt') {
              // in case these fields are specified in schema but not in model creation
              // pass;
            }  else if (schema[field].dataType === 'timestamp' || schema[field].dataType === 'timestamptz') {
              if (new Date(modelToCreate[field]) === 'Invalid Date') {
                datatypeValidationMessage = `Expected input of type ${schema[field].dataType} for ${field}`;
                return true;
              }
            } else {
              datatypeValidationMessage = `Expected input of type ${schema[field].dataType} for ${field}`;
              return true;
            }
          }
        }
      }
    });
    return [datatypeField, datatypeValidationMessage]
  }
}
