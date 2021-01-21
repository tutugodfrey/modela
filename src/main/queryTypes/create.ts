import functs from '../helpers/functs';

const { log, addReturnString } = functs;
const createQuery = (modelName: string, modelToCreate: any, returnFields=[]) => {
  if (!modelToCreate) {
    return { message: 'type error! expecting an object' };
  }
  if (!Array.isArray(returnFields)) {
    throw new TypeError('Expected an array of fields to return');
  }
  let keys = [];
  let arrayOfModels = []
  if (Array.isArray(modelToCreate)) {
    keys = Object.keys(modelToCreate[0])
    arrayOfModels = [ ...modelToCreate ];
  } else {
    keys = Object.keys(modelToCreate);
    arrayOfModels.push(modelToCreate);
  }
  let queryString = `INSERT INTO ${modelName}`;
  let keyString = '(';
  keys.forEach((key) => {
    if (keyString === '(') {
      keyString = `${keyString}"${key}"`;
    } else {
      keyString = `${keyString}, "${key}"`;
    }
  });
  keyString = `${keyString}) VALUES`;
  let valueString = '';

  arrayOfModels.forEach(item => {
    let itemValueString = '(';
    keys.forEach((key) => {
      if (itemValueString === '(') {
        if (Array.isArray(item[key])) {
          itemValueString = `${itemValueString}ARRAY [${item[key].map((value: any) => `'${value}'`)}]`;
        } else {
          itemValueString = `${itemValueString}'${item[key]}'`;
        }
      } else {
        if (Array.isArray(item[key])) {
          itemValueString = `${itemValueString}, ARRAY [${item[key].map((value: any) => `'${value}'`)}]`;
        } else {
          itemValueString = `${itemValueString}, '${item[key]}'`;
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
  queryString = addReturnString(`${queryString} ${keyString} ${valueString}`, returnFields)

  return log(queryString);
}

export default createQuery;
