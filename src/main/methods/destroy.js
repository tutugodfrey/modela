
function destroy(condition) {
		/* 
			delete the object that meet the condition 
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find.
			if several object match the specified condition, only the first match will
			be deleted
		*/
		const result = new Promise((resolve, reject)  => {
			const props = Object.keys(condition.where);
			let propMatch;
			this.model.forEach((model) => {
				propMatch = true;
				props.forEach((property) => {
					if(condition.where[property] !== model[property]) {
						propMatch = false;
					}
				});
				if(propMatch) {
					const indexOfMatchedModel = this.model.indexOf(model);
					if(this.model.splice(indexOfMatchedModel, 1)) {
						resolve({ message: `${this.singleModel} has been deleted` });
					} else {
						reject({ message: `${this.singleModel} could not be deleted` });
					}
				}
			});
			reject({ message: `${this.singleModel} not found, not action taken` });
		});

		return result;
	}

export default destroy;
