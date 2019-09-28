import { create, createModel }from './methods/create';
import update from './methods/update';
import find from './methods/find';
import findById from './methods/findById'
import findAll from './methods/findAll';
import destroy from './methods/destroy';
import clear from './methods/clear';

import bulkCreate, {createBulkItem } from './methods/bulkCreate';

const DummyDataModel = class {
	constructor(modelName, requiredFields = [], uniqueKeys = []) {
		if (!Array.isArray(uniqueKeys) || !Array.isArray(requiredFields)) {
      return { typeError: 'argument2 and argument3 must be of type array' };
    }
		this.modelName = modelName;
		this.uniqueKeys = uniqueKeys;
    this.requiredFields = requiredFields;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.model = [];
		this.create = create.bind(this);
		this.createModel = createModel.bind(this);
		this.bulkCreate = bulkCreate.bind(this);
		this.createBulkItem = createBulkItem.bind(this);
		this.update = update.bind(this);
		this.findById = findById.bind(this);
		this.find = find.bind(this);
		this.findAll = findAll.bind(this);
		this.destroy = destroy.bind(this);
		this.clear = clear.bind(this);
	}
}
export default DummyDataModel;
