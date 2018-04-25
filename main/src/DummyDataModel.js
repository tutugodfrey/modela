const DummyDataModel = class {
	constructor(modelName) {
		this.modelName = modelName;
		this.model = [];
	}

	// define class methods
	create(modelToCreate) {
		// create a new model
		const result = new Promise((resolve, reject)  => {
			// check if data already exist
			if(this.model.length === 0) {
				if(this.model.push(modelToCreate)) {
					resolve(modelToCreate);
				};
				reject({message: `Can not create ${modelName}`});
			} else {
				this.model.forEach((model) => {
					modelToCreate.map((property, value) => {
						console.log(`model ${value}`);
					})
				})
			}
			
		});
		return result;
	}

	update(modelToUpdate) {
		// update the model 

	}

	findById(id) {
		// return an object with the given id

	}

	find(condition) {
		// return the collections that meet the condition
		const result = new Promise((resolve, reject)  => {
			resolve(this.model);
			reject({message: `Can not create ${this.model}`});
		});
		return result;
	}

	findAll() {
		// return all the collection
		const result = new Promise((resolve, reject)  => {
			
			resolve(this.model);
			reject({message: `Can not create ${this.model}`});
		});
		return result;
	}

	destroy(id) {
		// delete an object from the collection

	}
}

export default DummyDataModel;