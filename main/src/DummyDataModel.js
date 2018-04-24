const DummyDataModel = class {
	constructor(modelName) {
		this.modelName = modelName;
		this.model = [];
	}

	// define class methods
	create(modelToCreate) {
		console.log(this.modelName);
		const result = new Promise((resolve, reject)  => {
			if(this.model.push(modelToCreate)) {
				resolve(modelToCreate);
			};
			reject({message: `Can not create ${modelName}`});
		});
		return result;
	}

	update(modelToUpdate) {

	}

	findById(id) {

	}

	findAll() {
		const result = new Promise((resolve, reject)  => {
			
			resolve(this.model);
			reject({message: `Can not create ${this.model}`});
		});
		return result;
	}

	destroy(id) {

	}
}

export default DummyDataModel;