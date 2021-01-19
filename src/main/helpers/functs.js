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
            } else if (schema[field].dataType === 'varchar' || schema[field].dataType === 'char') {
              // pass
            } else {
              datatypeValidationMessage = `Expected input of type ${schema[field].dataType} for ${field}`;
              return true;
            }
          }
        }
      }
    });
    return [datatypeField, datatypeValidationMessage]
  },
  updateTimestamp: function (model) {
    if (this.schema.createdAt && model.createdAt === undefined) {
      model.createdAt = new Date().toISOString();
    }

    if (this.schema.updatedAt && model.updatedAt === undefined) {
      model.updatedAt = new Date().toISOString();
    }
    return model;
  },
  generateGroupString: (conditions, type) => {
    let groupString = '';
    const groupCondition = conditions.groups;
    const whereCondition = conditions.where;
    groupCondition.forEach(group => {
      if (groupString) {
        groupString = `${groupString} ${type}`;
      }
      let groupStr = '';
      group.forEach(prop => {
        if (Array.isArray(whereCondition[prop])) {
          let str = '';
          const matchValue = whereCondition[prop]
          matchValue.forEach(value => {
            if (!str) {
              str = `(${str} "${prop}" = '${value}'`;
            } else {
              str = `${str} OR "${prop}" = '${value}'`;
            }
          });
          groupStr = groupStr ? `${groupStr} ${type} ${str}` : `${str}`;
        } else if (!groupStr) {
          groupStr = `("${prop}" = '${whereCondition[prop]}'`;
        } else {
          groupStr = `${groupStr} AND "${prop}" = '${whereCondition[prop]}'`;
        }
      });
      groupString = `${groupString} ${groupStr})`;
    });
    return groupString;
  },
  generateWhereString: (conditions, type) => {
    let whereString = '';
    const whereCondition = conditions.where;
    const whereKeys = Object.keys(whereCondition);
    whereKeys.forEach((prop) => {

      if (Array.isArray(whereCondition[prop])) {
        let str = '';
        const matchValue = whereCondition[prop]
        matchValue.forEach(value => {
          if (!str) {
            str = `${str} "${prop}" = '${value}'`;
          } else {
            str = `${str} OR "${prop}" = '${value}'`;
          }
        });
        whereString = whereString ? `${whereString} ${type} ${str}` : `${str}`;
      } else if (!whereString) {
        whereString = `${whereString}"${prop}" = '${whereCondition[prop]}'`;
      } else {
        whereString = `${whereString} ${type} "${prop}" = '${whereCondition[prop]}'`;
      }
    });

    return whereString;
  },
  generatePropString: (modelName, newProps,) => {
    let queryString;
    let propString = '';
    const newPropsKeys = Object.keys(newProps);
    queryString = `UPDATE ${modelName} SET`;
    newPropsKeys.forEach((prop) => {
      if (propString === '') {
        propString = `${propString}"${prop}" = '${newProps[prop]}'`;
      } else {
        propString = `${propString}, "${prop}" = '${newProps[prop]}'`;
      }
    });
    queryString = `${queryString} ${propString}`;
    return queryString;
  }
}
