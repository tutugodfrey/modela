
interface Condition {
  where?: Object;
  groups?: Array<Array<any>>;
  type?: String;
  limit?: Number
}

interface Error {
  message: String
}

interface IMapping {
  [propertyName: string]: any;
}

interface Options {
  logQuery?: string
}

interface DataModelaType {
	modelName: String | undefined;
  singleModel: String | undefined;
  schema: Object | any;
  allowedFields: Array<any>;
  uniqueKeys: Array<any>;
  requiredFields: Array<any>;
  model: Array<object>;
  supportedDataTypes: Array<any>;
  create: Function;
  createModel: Function;
  createModelWithDB: Function;
  bulkCreate: Function;
  createBulkItem: Function;
  createBulkItemWithDB: Function;
  update: Function;
  findById: Function;
  find: Function;
  findAll: Function;
  destroy: Function;
	clear: Function;
	dbConnection: Object | null;
	using_db: number;
  options: Options;
	
	// db methods
	createQuery: Function;
	getQuery: Function;
	updateQuery: Function;
	deleteQuery: Function;
	rawQuery: Function;
	createTableQuery: Function;
}

export {
  DataModelaType,
  Options,
  Condition,
  IMapping,
  Error,
}

