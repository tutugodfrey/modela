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
  addReturnString: function (queryString: string, returnFields: Array<string>) {
    const schema = this.schema;
    const schemaFields = Object.keys(schema);
    const fields = returnFields.length ? returnFields : schemaFields;
    let returnString = '';
    fields.forEach(field => {
      const fieldDataType = schema[field].dataType;
      if ([ 'timestamp', 'timestamptz' ].includes(fieldDataType)) {
        returnString = `${returnString} extract(epoch FROM timestamptz ("${field}")) as "${field}",`
      } else {
        returnString = `${returnString} "${field}",`
      }
      return returnString;
    });
    returnString = returnString.substr(0, returnString.length - 1)
    return `${queryString} returning ${returnString.trim()}`;
  },
  checkDatatype: (schema: object, modelToCreate: object) => {
    // Return datatype fields that fail validation and a message
    const allowedFields = Object.keys(schema);
    let datatypeValidationMessage = '';
    const datatypeField = allowedFields.find(field => {
      if ((modelToCreate[field] === undefined) && 
        (schema[field].default !== undefined || !schema[field].required
      )) { return false; }

      const fieldDatatype = schema[field].dataType;
      const modelFieldValue = modelToCreate[field];
      const valuePrototype = Object.prototype.toString.call(modelFieldValue);
      datatypeValidationMessage = `Expected input of type ${fieldDatatype} for ${field}`;
      if (fieldDatatype) {
        // Feiled having datatype defined
        if (['varchar', 'char', 'string'].includes(fieldDatatype) && valuePrototype !== '[object String]') {
          return true;
        } else if (fieldDatatype === 'array' && valuePrototype !== '[object Array]') {
          return true;
        } else if (fieldDatatype === 'boolean' && valuePrototype !== '[object Boolean]') {
          return true;
        } else if ([ 'timestamp', 'timestamptz' ].includes(fieldDatatype)) {
          let dateObj = new Date(modelFieldValue);
          if (dateObj.toString() === 'Invalid Date') {
            dateObj = new Date(Number(modelFieldValue));
            if (dateObj.toString() === 'Invalid Date') {
              if (field === 'createdAt' || field === 'updatedAt') {
                // This field will be supplied at creation time if not provided
                return false;
              }
              return true;
            }
            return true;
          }
          return false;
        } else if ([ 'number' ].includes(fieldDatatype) && valuePrototype !== '[object Number]'){
          return true;
        } else if ([ 'bigint' ].includes(fieldDatatype) && valuePrototype !== '[object BigInt]') {
          return true;
        } else if ([ 'time', 'date'].includes(fieldDatatype) && valuePrototype !== '[object Date]') {
          return true;
        } 
        return false
      } else {
        // Field not having datatype defined
        // Assume string for field not having dataType defined when storing in db
        // or store as is when storing in-memory 
        // Safe to return false
        return false;
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
        const whereProp = whereCondition[prop];
        if (Array.isArray(whereProp )) {
          let str = '';
          const matchValue = whereProp;
          matchValue.forEach(value => {
            if (!str) {
              str = `(${str} "${prop}" = '${value}'`;
            } else {
              str = `${str} OR "${prop}" = '${value}'`;
            }
          });
          groupStr = groupStr ? `${groupStr} ${type} ${str}` : `${str}`;
        } else if (!groupStr) {
          groupStr = `("${prop}" = '${whereProp}'`;
        } else {
          groupStr = `${groupStr} AND "${prop}" = '${whereProp}'`;
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
      const whereProp = whereCondition[prop];
      if (Array.isArray(whereProp )) {
        let str = '';
        const matchValue = whereProp;
        matchValue.forEach(value => {
          if (!str) {
            str = `${str} "${prop}" = '${value}'`;
          } else {
            str = `${str} OR "${prop}" = '${value}'`;
          }
        });
        whereString = whereString ? `${whereString} ${type} ${str}` : `${str}`;
      } else if (!whereString) {
        whereString = `${whereString}"${prop}" = '${whereProp}'`;
      } else {
        whereString = `${whereString} ${type} "${prop}" = '${whereProp}'`;
      }
    });
    return whereString;
  },
  getArrayField: (data, field, schema) => {
    const arrayFieldData = 
      `Array [${data.map((value) => `'${functObj.escapeString(JSON.stringify(value), field, schema)}'`)}]`;
    return arrayFieldData;
  },
  generatePropString: function(modelName: string, newProps: Object, schema) {
    let queryString: string;
    let propString = '';
    const newPropsKeys = Object.keys(newProps);
    queryString = `UPDATE ${modelName} SET`;
    newPropsKeys.forEach((prop: string) => {
      const propValue = newProps[prop];
      const fieldDataType = schema[prop].dataType;
      if (propString === '') {
        if ([ 'timestamp', 'timestampz' ].includes(fieldDataType)) {
          if (typeof propValue === 'number') {
            propString = `${propString}"${prop}" = (SELECT to_timestamp(${propValue}))`;
          } else {
            propString= `${propString}"${prop}" = '${propValue}'`;
          }
        } else if (Array.isArray(propValue) && propValue.length) {
          propString = `${propString}"${prop}" = ARRAY [ ${propValue.map(value => `'${value}'`)} ]`;
        } else {
          propString = `${propString}"${prop}" = '${propValue}'`;
        }
      } else {
        if ([ 'timestamp', 'timestampz' ].includes(fieldDataType)) {
          if (typeof propValue === 'number') {
            propString = `${propString}, "${prop}" = (SELECT to_timestamp(${propValue}))`;
          } else {
            propString= `${propString}, "${prop}" = '${propValue}'`;
          }
        } else if (Array.isArray(propValue) && propValue.length) {
          propString = `${propString}, "${prop}" = ARRAY [ ${propValue.map(value => `'${value}'`)} ]`;
        } else {
          propString = `${propString}, "${prop}" = '${propValue}'`;
        }
      }
    });
    queryString = `${queryString} ${propString}`;
    return queryString;
  },
  prepareDataForStorage: (dataObj: object, schema: object) => {
    const fields = Object.keys(dataObj);
    const preparedDataObj: Object = {};
    fields.forEach((field: any) => {
      const fieldDataType = schema[field].dataType;
      const fieldValue = dataObj[field];
      if (fieldDataType === 'string' || fieldDataType === undefined) {
        preparedDataObj[field] = functObj.escapeString(fieldValue, field, schema);
      } else if ([ 'timestamp', 'timestampz' ].includes(fieldDataType)) {
        preparedDataObj[field] = functObj.escapeString(fieldValue, field, schema);
      } else if (Array.isArray(fieldValue)) {
        if (fieldValue.length) {
          // Only add arrays containing data into the final object to store
          const arrayData = fieldValue.map(row => functObj.escapeString(JSON.stringify(row), field, schema));
          preparedDataObj[field] = arrayData;
        }
      } else {
        preparedDataObj[field] = fieldValue;
      }
    });
    return preparedDataObj;
  },
  escapeConditions: (conditions: Condition, schema: object) => {
    const newConditionsObj = { ...conditions };
    if (newConditionsObj.where) {
      const whereCondition2: Object = newConditionsObj.where;
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
  escapeString: function(value: any, field: String, schema: object) {
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
