import functs from '../helpers/functs';

const { confirmPropMatch, getFieldsToReturn } = functs;
function destroy(condition, returnFields=[]) {
		/* 
			delete the object that meet the condition 
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find.
			if several object match the specified condition, only the first match will
			be deleted
		*/
		if (!Array.isArray(returnFields)) {
			throw new TypeError('Expected an array of fields to return');
		}
	
		const result = new Promise((resolve, reject)  => {
			if (this.using_db) {
				const queryString = this.deleteQuery(this.modelName, condition, returnFields);
				this.dbConnection.query(queryString)
					.then(res => {
						if (!res.rowCount) 
							return reject({ message: `${this.singleModel} not found, not action taken` });
						const message = `${this.singleModel} has been deleted`;
						if (!returnFields.length) return resolve({ message });
						const deletedModel = res.rows[0];
						deletedModel.message = message;
						return resolve(deletedModel);
					})
					.catch(err => reject(err));
			} else {
				this.model.forEach((model, index) => {
					const findMatchProp = confirmPropMatch(condition.where, model, condition.type)
					if(findMatchProp) {
						 const deletedModel = this.model.splice(index, 1);
						 const message = `${this.singleModel} has been deleted`;
						if (!returnFields.length) return resolve({ message });

						const fieldsToReturn = getFieldsToReturn(deletedModel[0], returnFields);
						fieldsToReturn.message = message;
						return resolve(fieldsToReturn);
					}
				});
				return reject({ message: `${this.singleModel} not found, not action taken` });
			}
		});

		return result;
	}

export default destroy;
