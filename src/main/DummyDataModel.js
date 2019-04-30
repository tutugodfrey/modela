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
} from './queryTypes';

import bulkCreate, {createBulkItem, createBulkItemWithDB } from './methods/bulkCreate';

const DummyDataModel = class {
	constructor(modelName, requiredFields = [], uniqueKeys = []) {
		if (!Array.isArray(uniqueKeys) || !Array.isArray(requiredFields)) {
      return { typeError: 'argument2 and argument3 must be of type array' };
		}
		this.using_db = 0;
		if (parseInt(process.env.USE_DB) === 1) {
			this.db_connection = null;
			this.using_db = 1;
		};

		this.modelName = modelName;
		this.uniqueKeys = uniqueKeys;
    this.requiredFields = requiredFields;
		this.singleModel = modelName.substring(0, modelName.length - 1);
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
	}
}
export default DummyDataModel;
