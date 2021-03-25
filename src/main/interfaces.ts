
interface Condition {
  where: object;
  groups?: Array<Array<any>>;
  type?: string;
}

interface DataModelaType {
	modelName: String | undefined;
  singleModel: String | undefined;
  schema: object | any;
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
	dbConnection: object | null;
	using_db: number;
	
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
  Condition,
}

