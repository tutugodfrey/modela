import functs from '../helpers/functs';
// import escape from 'pg-escape';

const { log, addReturnString } = functs;
function createQuery(modelName: string, modelToCreate: any, returnFields=[]) {
  if (!modelToCreate) {
    return { message: 'type error! expecting an object' };
  }
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  let keys: Array<string> = [];
  let arrayOfModels: Array<object> = []
  if (Array.isArray(modelToCreate)) {
    keys = Object.keys(modelToCreate[0])
    arrayOfModels = [ ...modelToCreate ];
  } else {
    keys = Object.keys(modelToCreate);
    arrayOfModels.push(modelToCreate);
  }
  let queryString: string = `INSERT INTO ${modelName}`;
  let keyString: string = '(';
  keys.forEach((key) => {
    if (keyString === '(') {
      keyString = `${keyString}"${key}"`;
    } else {
      keyString = `${keyString}, "${key}"`;
    }
  });
  keyString = `${keyString}) VALUES`;
  let valueString: string = '';

  arrayOfModels.forEach(item => {
    let itemValueString: string = '(';
    keys.forEach((key) => {
      const dataValue = item[key];
      const fieldDataType = this.schema[key].dataType;
      if (itemValueString === '(') {
        itemValueString = Array.isArray(dataValue) ?
          `${itemValueString}ARRAY [ ${dataValue.map(value => `'${value}'`)} ]` :
          `${itemValueString}'${dataValue}'`;
      } else {
        if (Array.isArray(dataValue)) {
          itemValueString = `${itemValueString}, ARRAY [ ${dataValue.map(value => `'${value}'`)} ]`;
        } else if ([ 'timestamp', 'timestampz' ].includes(fieldDataType)) {
          if (typeof dataValue === 'number') {
            itemValueString = `${itemValueString}, (SELECT to_timestamp(${dataValue}))`;
          } else {
            itemValueString = `${itemValueString}, '${dataValue}'`;
          }
        } else {
          itemValueString = `${itemValueString}, '${dataValue}'`;
        }
      }
    });
    itemValueString = `${itemValueString})`;
    if (valueString) {
      valueString = `${valueString}, ${itemValueString}`
    } else {
      valueString = `${itemValueString}`
    }
  });
  queryString = addReturnString.call(this, `${queryString} ${keyString} ${valueString}`, returnFields)
  return log(queryString);
}

export default createQuery;
