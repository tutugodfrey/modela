import { create, createModel, createModelWithDB }from './methods/create';
import update from './methods/update';
import find from './methods/find';
import findById from './methods/findById'
import findAll from './methods/findAll';
import destroy from './methods/destroy';
import clear from './methods/clear';
import { DataModelaType } from './interfaces';
import {
	createQuery,
	updateQuery,
	deleteQuery,
	getQuery,
	rawQuery,
	createTableQuery
} from './queryTypes';

import bulkCreate, {createBulkItem, createBulkItemWithDB } from './methods/bulkCreate';

class DataModela implements DataModelaType  {
	modelName: String | undefined;
  singleModel: String | undefined;
  schema: object | any;
  allowedFields: Array<any> = [];
  uniqueKeys: Array<any> = [];
  requiredFields: Array<any> = [];
  model: Array<object> = [];
  supportedDataTypes: Array<string> = [
		'string',
		'char',
		'varchar',
		'number',
		'boolean',
		'array',
		'time',
		'date',
		'timestamp',
		'timestamptz',
		'bigint',
	];
  create: Function = create.bind(this);
  createModel: Function = createModel.bind(this);
  createModelWithDB: Function = createModelWithDB.bind(this);
  bulkCreate: Function = bulkCreate.bind(this);
  createBulkItem: Function = createBulkItem.bind(this);
  createBulkItemWithDB: Function = createBulkItemWithDB.bind(this);
  update: Function = update.bind(this);
  findById: Function = findById.bind(this);
  find: Function = find.bind(this);
  findAll: Function = findAll.bind(this);
  destroy: Function = destroy.bind(this);
	clear: Function = clear.bind(this);
	dbConnection: object | null =  null;
	using_db: number = 0;
	
	// db methods
	createQuery: Function = createQuery.bind(this);
	getQuery: Function = getQuery.bind(this);
	updateQuery: Function = updateQuery.bind(this);
	deleteQuery: Function = deleteQuery.bind(this);
	rawQuery: Function = rawQuery.bind(this);
	createTableQuery: Function = createTableQuery.bind(this);

	"constructor"(modelName: string, schema: any = {}){
		if (Object.prototype.toString.call(schema) !== '[object Object]') {
      return { typeError: 'expected argument 2 (schema) to be an object' };
		}
		if (parseInt(process.env.USE_DB) === 1) {
			this.dbConnection = null;
			this.using_db = 1;
		};

		this.modelName = modelName;
		this.singleModel = this.modelName.substring(0, this.modelName.length - 1);
		this.schema = schema;
		this.allowedFields = Object.keys(schema);
		this.uniqueKeys = [];
		this.requiredFields = [];
		this.model = [];

		this.allowedFields.forEach(field => {
			if (schema[field].required) return this.requiredFields.push(field);
		});

		this.allowedFields.forEach(field => {
			if (schema[field].unique) return this.uniqueKeys.push(field);
		});

		const unsupportedTypeField = this.allowedFields.find(field => {
			if (schema[field].dataType) {
				return !this.supportedDataTypes.includes(schema[field].dataType);
			}
		});

		if (unsupportedTypeField) {
			throw ({ 
				message: `dataType ${schema[unsupportedTypeField].dataType} in ${unsupportedTypeField} is not supported`,
				supportedDataTypes: this.supportedDataTypes,
			});
		}
	}
}
export default DataModela;
