import functs from '../helpers/functs';
import { Condition } from '../../main/interfaces';

const { confirmPropMatch, getFieldsToReturn } = functs;
function destroy(conditions: Condition, returnFields=[]) {
		/* 
			delete the object that meet the conditions 
			conditions is single object with property where whose value is further
			an object with key => value pair of the properties of the object to find.
			if several object match the specified conditions, only the first match will
			be deleted
		*/
	
		const result = new Promise((resolve, reject)  => {
			if (!Array.isArray(returnFields)) 
				return reject({ message: 'Expected an array of fields to return' });
			
			const message  = `${this.singleModel} has been deleted`;
			const failMsg = `${this.singleModel} not found, not action taken`;
			if (this.using_db) {
				const queryString = this.deleteQuery(this.modelName, conditions, returnFields);
				this.dbConnection.query(queryString)
					.then((res: { rowCount: any; rows: any[]; }) => {
						if (!res.rowCount) 
							return reject({ message: failMsg });
						if (!returnFields.length) return resolve({ message });
						const deletedModel = res.rows[0];
						deletedModel.message = message;
						return resolve(deletedModel);
					})
					.catch((err: any) => reject(err));
			} else {
				this.model.forEach((model: object, index: any) => {
					const findMatchProp = confirmPropMatch(model, conditions)
					if(findMatchProp) {
						const deletedModel = this.model.splice(index, 1);
						if (!returnFields.length) return resolve({ message });

						const fieldsToReturn = getFieldsToReturn(deletedModel[0], returnFields);
						fieldsToReturn['message'] = message;
						return resolve(fieldsToReturn);
					}
				});
				return reject({ message: failMsg });
			}
		});

		return result;
	}

export default destroy;
