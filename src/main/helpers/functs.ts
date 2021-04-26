import { Condition, IMapping } from '../interfaces';

const functObj = {
  confirmPropMatch: (model: IMapping, conditions: Condition) => {
    const whereConditions: IMapping = conditions.where;
    const groupConditions = conditions.groups ? conditions.groups : null;
    const props = Object.keys(whereConditions);
    const matchType = conditions.type ? conditions.type : 'and';
    if (groupConditions && groupConditions.length && matchType === 'or') {
      const groupsPassingState: IMapping = {};
      groupConditions.forEach((groupProps, index) => {
        groupsPassingState[index] = !groupProps.find((prop) => {
          const wherePropValues = whereConditions[prop];
          const fieldValue = model[prop];
          if (Array.isArray(wherePropValues))
            return wherePropValues.includes(fieldValue);
          return wherePropValues !== fieldValue;
        });
      });
      return Object.keys(groupsPassingState)
        .map(key => groupsPassingState[key]).includes(true);   
    }
    if (matchType === 'or') {
      const result = props.find((prop) => {
        const wherePropValues = whereConditions[prop];
        const fieldValue = model[prop]
        if (Array.isArray(wherePropValues))
          return (wherePropValues.includes(fieldValue));
        return (wherePropValues === fieldValue);
      });

      if (result) return true;
      return false;
    }

    const finalResult: Array<boolean> = [];
    props.find((prop) => {
      const wherePropValues = whereConditions[prop];
      const fieldValue = model[prop]
      if (Array.isArray(wherePropValues)) {
        finalResult.push(wherePropValues.includes(fieldValue));
      } else {
        finalResult.push(wherePropValues === fieldValue);
      }
    });

    return !finalResult.includes(false);
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
      const fieldValue = modelToCreate[field];
      const schemaField = schema[field];
      if ((fieldValue === undefined) && 
        (schemaField.default !== undefined || !schemaField.required
      )) { return false; }

      const fieldDatatype = schemaField.dataType;
      const modelFieldValue = fieldValue;
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
    const schema = this.schema;
    if (schema.createdAt && model.createdAt === undefined) {
      model.createdAt = new Date().toISOString();
    }

    if (schema.updatedAt && model.updatedAt === undefined) {
      model.updatedAt = new Date().toISOString();
    }
    return model;
  },
  generateGroupString: function(conditions: Condition, type: string) {
    let groupString = '';
    const groupCondition: Array<Array<any>> = conditions.groups;
    const whereCondition: IMapping = conditions.where;
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
          matchValue.forEach(value => str = !str ? `(${str} "${prop}" = '${value}'` : `${str} OR "${prop}" = '${value}'`);
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
    const whereCondition: IMapping = conditions.where;
    const whereKeys = Object.keys(whereCondition);
    whereKeys.forEach((prop) => {
      const whereProp = whereCondition[prop];
      if (Array.isArray(whereProp )) {
        let str = '';
        const matchValue = whereProp;
        matchValue.forEach(value => str = !str ? 
          `${str} "${prop}" = '${value}'` : `${str} OR "${prop}" = '${value}'`);
        whereString = whereString ? `${whereString} ${type} ${str}` : `${str}`;
      } else if (!whereString) {
        whereString = `${whereString}"${prop}" = '${whereProp}'`;
      } else {
        whereString = `${whereString} ${type} "${prop}" = '${whereProp}'`;
      }
    });
    return whereString;
  },
  getArrayField: (data: IMapping, field: string, schema: IMapping) => {
    const arrayFieldData = 
      `Array [${data.map((value: string) => `'${functObj.escapeString(JSON.stringify(value), field, schema)}'`)}]`;
    return arrayFieldData;
  },
  generatePropString: function(modelName: string, newProps: IMapping, schema: IMapping) {
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
  prepareDataForStorage: (dataObj: IMapping, schema: IMapping) => {
    const fields = Object.keys(dataObj);
    const preparedDataObj: IMapping = {};
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
      const whereCondition: IMapping = newConditionsObj.where;
      const whereKeys = Object.keys(whereCondition);
      whereKeys.forEach(key => {
        const whereKeyValue: IMapping = whereCondition[key];
        if (Array.isArray(whereCondition[key])) {
          whereCondition[key] = whereKeyValue
            .map((value: string) => functObj.escapeString(value, key, schema));
        } else {
          whereCondition[key] = functObj.escapeString(whereKeyValue, key, schema);
        }
      });
      if (newConditionsObj.groups) {
        const newGroups = newConditionsObj.groups
          .map(group => group.map(value => functObj.escapeString(value, 'group', schema)));
        newConditionsObj.groups = newGroups;
      }
    }
    return newConditionsObj;
  },
  escapeString: function(value: any, field: string, schema: IMapping) {
    if (schema[field] && schema[field].dataType && schema[field].dataType.includes('timestamp')) {
      return value;
    } else {
      return escape(value);
    }
  },
  unescapeObj: (data: IMapping) => {
    const keys = Object.keys(data);
    const unescapedObj: IMapping = {};
    keys.forEach((key: string) => {
      const fieldValue = data[key]
      if (fieldValue && typeof fieldValue === 'string') {
        unescapedObj[key] = unescape(fieldValue);
      } else if (Array.isArray(fieldValue)) {
        unescapedObj[key] = fieldValue.map((value: string) => unescape(value))
      } else {
        unescapedObj[key] = fieldValue;
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
  jsonParser: (data: IMapping, schema: IMapping) => {
    const keys = Object.keys(data);
    const newObj: IMapping = {}

    keys.forEach((key: string) => {
      const fieldValue = data[key];
      const fieldDataType = schema[key].dataType;
      if (fieldDataType === 'array') {
        try {
          const newArray = fieldValue.map((value: string) => JSON.parse(value));
          newObj[key] = newArray;
        } catch(err) {
          newObj[key] = fieldValue;
        }
      } else {
        newObj[key] = fieldValue;
      }
    });
    return newObj;
  },
  parseJson: function (data: Object, schema: Object) {
    if (Array.isArray(data)) return data.map(row => functObj.jsonParser(row, schema));
    return functObj.jsonParser(data, schema);
  },
  log: function  (queryString: string) {
    /* eslint-disable no-console */
    if (this.options && this.options.logQuery === 'no') {
      // console.log(queryString);
      // Query logging disabled
    } else {
      console.log(queryString);
    }
   return queryString;
 }
}

export default functObj;
