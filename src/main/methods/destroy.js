import helpers from './helpers';

const { confirmPropMatch } = helpers;
function destroy(condition) {
		/* 
			delete the object that meet the condition 
			condition is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find.
			if several object match the specified condition, only the first match will
			be deleted
		*/
		const result = new Promise((resolve, reject)  => {
			if (this.using_db) {
				const queryString = this.deleteQuery(this.modelName, condition);
				this.db_connection.query(queryString)
					.then(res => {
						if (res.rowCount)
							return resolve({ message: `${this.singleModel} has been deleted` });

						return reject({ message: `${this.singleModel} not found, not action taken` });
					})
					.catch(err => reject(err));
			} else {
				this.model.forEach((model, index) => {
					const findMatchProp = confirmPropMatch(condition.where, model, condition.type)
					if(findMatchProp) {
						this.model.splice(index, 1)
						return resolve({ message: `${this.singleModel} has been deleted` });
					}
				});
				return reject({ message: `${this.singleModel} not found, not action taken` });
			}
		});

		return result;
	}

export default destroy;
