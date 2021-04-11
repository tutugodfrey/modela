import functs from  '../helpers/functs';

const { log } = functs;
function createTableQuery() {
  const fields: Array<any> = this.allowedFields;
  const schema = this.schema;
  const typeMapping = {
    number: 'INT',
    string: 'TEXT',
    boolean: 'BOOLEAN',
    timestamp: 'TIMESTAMP',
    timestamptz: 'TIMESTAMPTZ',
    time: 'TIME',
    date: 'DATE',
  }
  let tableQuery: string = `CREATE TABLE IF NOT EXISTS ${this.modelName} (`;
  if (schema.id) {
    tableQuery = `${tableQuery} id SERIAL NOT NULL PRIMARY KEY,`;
  }
  fields.forEach((field: string) => {
    if (field !== 'id') {
      let fieldContraint: string = `"${field}"`
      if (schema[field].dataType) {
        if (schema[field].dataType === 'string') {
          fieldContraint = `${fieldContraint} TEXT`;
        } else if (schema[field].dataType === 'number') {
          fieldContraint = `${fieldContraint} INT`;
        } else if (schema[field].dataType === 'bigint') {
          fieldContraint = `${fieldContraint} BIGINT`;
        } else if (schema[field].dataType === 'boolean') {
          fieldContraint = `${fieldContraint} BOOLEAN`;
        } else if (schema[field].dataType === 'char') {
          fieldContraint = `${fieldContraint} CHAR(${schema[field].charLength})`;
        } else if (schema[field].dataType === 'varchar') {
          fieldContraint = `${fieldContraint} VARCHAR(${schema[field].charLength})`;
        } else if (schema[field].dataType === 'array') {
          if (schema[field].arrayOfType === 'char') {
            fieldContraint = `${fieldContraint} CHAR(${schema[field].charLength}) []`;
          } else if (schema[field].arrayOfType === 'varchar') {
            fieldContraint = `${fieldContraint} VARCHAR(${schema[field].charLength}) []`;
          } else {
            fieldContraint = `${fieldContraint} ${typeMapping[schema[field].arrayOfType]} []`;
          }
        } else if (schema[field].dataType === 'DATE') {
          fieldContraint = `${fieldContraint} DATE`;
          // adding default values
        } else if (schema[field].dataType === 'TIME') {
          fieldContraint = `${fieldContraint} TIME`;
        } else {
          fieldContraint = `${fieldContraint} ${typeMapping[schema[field].dataType]}`;
        }
      } else {
        fieldContraint = `${fieldContraint} TEXT`;
      }
        // Add required constraint
        if (schema[field].required) {
          fieldContraint = `${fieldContraint} NOT NULL`;
        }
  
        // add default values
        if (schema[field].defaultValue !== undefined) {
          if (typeof schema[field].defaultValue === 'string') {
            fieldContraint = `${fieldContraint} DEFAULT '${schema[field].defaultValue}'`;
          }  else {
            fieldContraint = `${fieldContraint} DEFAULT ${schema[field].defaultValue}`;
          }
        }
        // Add unique constraint
        if (schema[field].unique) {
          fieldContraint = `${fieldContraint} UNIQUE`;
        }
        tableQuery = `${tableQuery} ${fieldContraint},`;
    }
  });

  tableQuery = tableQuery.slice(0, tableQuery.length - 1);
  return log.call(this, `${tableQuery});`);
}

export default createTableQuery;
