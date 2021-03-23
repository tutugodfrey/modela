interface Condition {
  where: object;
  groups?: Array<Array<any>>;
  type?: string;
}

const functObj = {
  confirmPropMatch: (model: object, conditions: Condition) => {
    const whereConditions = conditions.where;
    const groupConditions = conditions.groups ? conditions.groups : null;
    const props = Object.keys(whereConditions);
    const matchType = conditions.type ? conditions.type : 'and';
    if (groupConditions && groupConditions.length && matchType === 'or') {
      const groupsPassingState = {};
      groupConditions.forEach((groupProps, index) => {
        groupsPassingState[index] = !groupProps.find((prop) => {
          if (Array.isArray(whereConditions[prop]))
            return whereConditions[prop].includes(model[prop]);
          return whereConditions[prop] !== model[prop];
        });
      });
      return Object.keys(groupsPassingState)
        .map(key => groupsPassingState[key]).includes(true);   
    } else {
      if (matchType === 'or') {
        const result = props.find((prop) => {
          if (Array.isArray(whereConditions[prop]))
            return (whereConditions[prop].includes(model[prop]));
          return (whereConditions[prop] === model[prop]);
        });

        if (result) return true;
        return false;
      }

      const finalResult = [];
      props.find((prop) => {
        if (Array.isArray(whereConditions[prop])) {
          finalResult.push(whereConditions[prop].includes(model[prop]));
        } else {
          finalResult.push(whereConditions[prop] === model[prop]);
        }
      });

      return !finalResult.includes(false);
    }
  },
  getFieldsToReturn: (model: object, returnFields=[]) => {
    if (!returnFields.length) return model;
    const modelToReturn = {}
    returnFields.forEach(field => model[field] ?
        modelToReturn[field] = model[field]: null);
    return modelToReturn;
  },
  addReturnString: (queryString: string, returnFields: Array<string>) => {
    let returnString = '';
    if (!returnFields.length) return `${queryString} returning *`;
    returnFields.forEach(field => returnString = `${returnString} "${field}",`);
    returnString = returnString.substr(0, returnString.length - 1)
    return `${queryString} returning ${returnString.trim()}`;
  },
  checkDatatype: (allowedFields: Array<string>, schema: object, modelToCreate: object) => {
    let datatypeValidationMessage = '';
    const datatypeField = allowedFields.find(field => {
      if (modelToCreate[field] === undefined && schema[field].default !== undefined) {
        return false;
      }
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
  updateTimestamp: function (model: any) {
    if (this.schema.createdAt && model.createdAt === undefined) {
      model.createdAt = new Date().toISOString();
    }

    if (this.schema.updatedAt && model.updatedAt === undefined) {
      model.updatedAt = new Date().toISOString();
    }
    return model;
  },
  generateGroupString: function(conditions: Condition, type: string) {
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
  generateWhereString: function(conditions: Condition, type: string) {
    let whereString = '';
    const whereCondition = conditions.where;
    const whereKeys = Object.keys(whereCondition);
    whereKeys.forEach((prop) => {

      if (Array.isArray(whereCondition[prop])) {
        let str = '';
        const matchValue = whereCondition[prop];
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
  getArrayField: (data, field, schema) => {
    const arrayFieldData = 
      `Array [${data.map((value) => `'${functObj.escapeString(JSON.stringify(value), field, schema)}'`)}]`;
    return arrayFieldData;
  },
  generatePropString: function(modelName: string, newProps: object) {
    let queryString: string;
    let propString = '';
    const newPropsKeys = Object.keys(newProps);
    queryString = `UPDATE ${modelName} SET`;
    newPropsKeys.forEach((prop: string) => {
      if (propString === '') {
        if (Array.isArray(newProps[prop]) && newProps[prop].length) {
          propString = `${propString}"${prop}" = ARRAY [ ${newProps[prop].map(value => `'${value}'`)} ]`;
        } else {
          propString = `${propString}"${prop}" = '${newProps[prop]}'`;
        }
      } else {
        if (Array.isArray(newProps[prop]) && newProps[prop].length) {
          propString = `${propString}, "${prop}" = ARRAY [ ${newProps[prop].map(value => `'${value}'`)} ]`;
        } else {
          propString = `${propString}, "${prop}" = '${newProps[prop]}'`;
        }
      }
    });
    queryString = `${queryString} ${propString}`;
    return queryString;
  },
  prepareDataForStorage: (dataObj: object, schema: object) => {
    const fields = Object.keys(dataObj);
    const preparedDataObj: object = {};
    fields.forEach((field: any) => {
      if (typeof dataObj[field] === 'string') {
        preparedDataObj[field] = functObj.escapeString(dataObj[field], field, schema);
      } else if (Array.isArray(dataObj[field])) {
        if (dataObj[field].length) {
          // Only add arrays containing data into the final object to store
          const arrayData = dataObj[field].map(row => functObj.escapeString(JSON.stringify(row), field, schema));
          preparedDataObj[field] = arrayData;
        }
      } else {
        preparedDataObj[field] = dataObj[field];
      }
    });
    return preparedDataObj;
  },
  escapeConditions: (conditions: object, schema: object) => {
    const newConditionsObj = { ...conditions };
    if (newConditionsObj.where) {
      const whereCondition2 = newConditionsObj.where;
      const whereKeyss = Object.keys(whereCondition2);
      whereKeyss.forEach(key => {
        if (Array.isArray(whereCondition2[key])) {
          whereCondition2[key] = whereCondition2[key]
            .map((value: string) => functObj.escapeString(value, key, schema));
        } else {
          whereCondition2[key] = functObj.escapeString(whereCondition2[key], key, schema);
        }
      });
      if (newConditionsObj.groups) {
        const newGroups = newConditionsObj.groups.map(group => group.map(value => {
          return functObj.escapeString(value, 'group', schema)
        }));
        newConditionsObj.groups = newGroups;
      }
    }
    return newConditionsObj;
  },
  escapeString: function(value: object, field: string, schema: object) {
    if (schema[field] && schema[field].dataType && schema[field].dataType.includes('timestamp')) {
      return value;
    } else {
      return escape(value);
    }
  },
  unescapeObj: (data: object) => {
    const keys = Object.keys(data);
    const unescapedObj = {};
    keys.forEach((key: string) => {
      if (data[key] && typeof data[key] === 'string') {
        unescapedObj[key] = unescape(data[key]);
      } else if (Array.isArray(data[key])) {
        unescapedObj[key] = data[key].map(value => unescape(value))
      } else {
        unescapedObj[key] = data[key];
      }
    });
    return unescapedObj;
  },
  unEscape: (data: any) => {
    if (typeof data === 'string') {
      return unescape(data);
    } else if (Array.isArray(data)) {
      const rows = data.map((row: object) => {
        return functObj.unescapeObj(row);
      });
      return rows;
    } else {
      return functObj.unescapeObj(data)
    }
  },
  jsonParser: (data: object, schema: object) => {
    const keys = Object.keys(data);
    const newObj = {}
    keys.forEach((key: string) => {
      if (schema[key].dataType === 'array') {
        try {
          const newArray = data[key].map(value => JSON.parse(value));
          newObj[key] = newArray;
        } catch(err) {
          newObj[key] = data[key];
        }
      } else {
        newObj[key] = data[key];
      }
    });
    return newObj;
  },
  parseJson: function (data: object, schema: object) {
    if (Array.isArray(data)) {
      const result = data.map(row => {
        return functObj.jsonParser(row, schema);
      });
      return result;
    } else {
      return functObj.jsonParser(data, schema);
    }
  },
  log: function  (queryString: string) {
    /* eslint-disable no-console */
   process.env.NODE_ENV === 'production' ? null : console.log(queryString);
   return queryString;
 }
}

export default functObj;
