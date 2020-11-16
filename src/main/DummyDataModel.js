import { create, createModel, createModelWithDB }from './methods/create';
import update from './methods/update';
import find from './methods/find';
import findById from './methods/findById'
import findAll from './methods/findAll';
import destroy from './methods/destroy';
import clear from './methods/clear';
import {
	createQuery,
	updateQuery,
	deleteQuery,
	getQuery,
	rawQuery,
} from './queryTypes';

import bulkCreate, {createBulkItem, createBulkItemWithDB } from './methods/bulkCreate';

const DummyDataModel = class {
	constructor(modelName, schema = {}) {
		if (Object.prototype.toString.call(schema) !== '[object Object]') {
      return { typeError: 'expected argument 2 (schema) to be an object' };
		}
		this.using_db = 0;
		if (parseInt(process.env.USE_DB) === 1) {
			this.db_connection = null;
			this.using_db = 1;
		};

		this.modelName = modelName;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.schema = schema;
		this.allowedFields = Object.keys(this.schema);
		this.uniqueKeys = [];
		this.requiredFields = [];
		this.model = [];
		this.create = create.bind(this);
		this.createModel = createModel.bind(this);
		this.createModelWithDB = createModelWithDB.bind(this);
		this.bulkCreate = bulkCreate.bind(this);
		this.createBulkItem = createBulkItem.bind(this);
		this.createBulkItemWithDB = createBulkItemWithDB.bind(this);
		this.update = update.bind(this);
		this.findById = findById.bind(this);
		this.find = find.bind(this);
		this.findAll = findAll.bind(this);
		this.destroy = destroy.bind(this);
		this.clear = clear.bind(this);

		// db methods
		this.createQuery = createQuery.bind(this);
		this.getQuery = getQuery.bind(this);
		this.updateQuery = updateQuery.bind(this);
		this.deleteQuery = deleteQuery.bind(this);
		this.rawQuery = rawQuery.bind(this);

		this.allowedFields.forEach(field => {
			if (schema[field].required) return this.requiredFields.push(field);
		});

		this.allowedFields.forEach(field => {
			if (schema[field].unique) return this.uniqueKeys.push(field);
		});
	}
}
export default DummyDataModel;
