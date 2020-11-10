import chai from 'chai';
import DataModel from '../main/DummyDataModel';
import { connect } from '../main/connection';
import { testData } from './helpers';

console.time('timeChecked');
const { expect } = chai;
const users = new DataModel('users', ['name', 'email'], ['name']);
const messages = new DataModel('messages');
if (parseInt(process.env.USE_DB)) {
	const connection = connect(process.env.DATABASE_URL, [ users, messages ]);
}
const {
	user1,
	user2,
	user3, // user3 and user2 has same address
	bulkUsers,
	user1DataToUpdate,
	user2DataToUpdate,
	wrongdUserDetails,
} = testData;
const createdUser1 = {};
const createdUser2 = {};
const createdUser3 = {};
const createdBulkUsers = [];

describe('Dummy Data Model', () => {
	describe('DataModel', () => {
		it('should export a function', () => {
			expect(DataModel).to.be.a('function');
		})
	});

	describe('Users', () => {
		it('should export a function', () => {
			expect(users).to.be.a('object');
		});
		it('should be an instance of DataModel', () => {
			expect(users).to.be.an.instanceOf(DataModel);
		})
	});

	describe('create method', () => {
		it('user model should be an array', () => {
			expect(users.model).to.be.an('array');
		})

		it('should not create without required field', () => {
			const user = { ...user1 };
			delete user.email;
			return users.create(user)
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error).to.eql({ message: `missing required field email` });
			});
		});

		it('should create a new user', () => {
			const user = { ...user1 };
			return users.create(user)
			.then((user) => {
				Object.assign(createdUser1, user);
				expect(user).to.have.property('id');
				expect(user.name).to.equal(user1.name);
				expect(user.email).to.equal(user1.email);
				expect(user.address).to.equal(user1.address);
				expect(user).to.have.property('createdAt');
				expect(user).to.have.property('updatedAt')
			})
		});

		it('should create a another user', () => {
			const user = { ...user2 };
			return users.create(user)
			.then((user) => {
				Object.assign(createdUser2, user);
				expect(user).to.have.property('id');
				expect(user.name).to.equal(user2.name);
				expect(user.email).to.equal(user2.email);
				expect(user.address).to.equal(user2.address);
				expect(user).to.have.property('createdAt');
				expect(user).to.have.property('updatedAt')
			});
		});

		it('should create a another user', () => {
			const user = { ...user3 };
			return users.create(user)
			.then((user) => {
				Object.assign(createdUser3, user);
				expect(user).to.have.property('id');
				expect(user.name).to.equal(user3.name);
				expect(user.email).to.equal(user3.email);
				expect(user.address).to.equal(user3.address);
				expect(user).to.have.property('createdAt');
				expect(user).to.have.property('updatedAt')
			});
		});
	
		it('should not create a model with unique key constriant', () => {
			const user = { ...user1 };
			return users.create(user)
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error).to.eql({ 
					message: `user with name = ${user1.name} already exists`,
				});
			});
		});
	});

	describe('Bulk Create method', () => {
		it('should not create multiple users if any user without a required field', () => {
			const bulkUsersObj = bulkUsers.map(user => {
				return { ...user };
			});
			delete bulkUsersObj[0].name;
			return users.bulkCreate(bulkUsersObj)
				.then(user => {
					expect(user[0].name).to.equal('undefined');
				})
				.catch(error => {
					expect(error).to.be.an('array')
					expect(error[0]).to.have.property('message')
						.to.equal('missing required field');
				})
		});

		it('should create multiple users using bulk create', () => {
			const bulkUsersObj = bulkUsers.map(user => {
				return { ...user };
			});
			return users.bulkCreate(bulkUsersObj)
				.then(res => res)
				.then(result => {
					expect(result.length).to.equal(3);
					Object.assign(createdBulkUsers, result);
				});
		});
	});

	describe('findById', () => {
		it('should return not found if model does not exist', () => {
			return users.findById(wrongdUserDetails.id)
				.then(user => {
					expect(user.name).to.equal('undefined');
				})
				.catch((error) => {
					expect(error).to.eql({ message: 'user not found' });
				});
		});
		it('should return the model with the given id', () => {
			return users.findById(createdUser1.id)
				.then((user) => {
					expect(user.id).to.equal(createdUser1.id);
					expect(user.name).to.equal(user1.name);
					expect(user.email).to.equal(user1.email);
					expect(user.address).to.equal(user1.address);
				});
		});
	});

	describe('find', () => {
		it('should return an error message if no where condition is specified', () => {
			return users.find()
				.then(user => {
					expect(user.name).to.equal('undefined');
				})
				.catch((error) => {
					expect(error).to.eql({
						message: `missing object propertiy 'where' to find model`,
					});
				});
		});

		it('should not return a model if all attributes does not match', () => {
			return users.find({
				where: {
					name: createdUser1.name,
					id: createdUser2.id,
				}
			})
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error).to.eql({ message: 'user not found' });
			});
		});

		it('should find a model that meet the given conditions', () => {
			return users.find({
				where: {
					name: createdUser2.name,
				}
			})
			.then((user) => {
				expect(user.id).to.equal(createdUser2.id);
				expect(user.name).to.equal(createdUser2.name);
				expect(user.email).to.equal(createdUser2.email);
				expect(user.address).to.equal(createdUser2.address);
			})
		});

		it('should find a model using multiple attributes', () => {
			return users.find({
				where: {
					address: createdUser1.address,
					name: createdUser1.name,
				}
			})
			.then((user) => {
				expect(user.id).to.equal(createdUser1.id);
				expect(user.name).to.equal(createdUser1.name);
				expect(user.email).to.equal(createdUser1.email);
				expect(user.address).to.equal(createdUser1.address);
			})
		});

		it('should find a model using multiple attributes value', () => {
			return users.find({
				where: {
					name: [createdUser1.name, createdUser2.name],
				}
			})
			.then((user) => {
				expect(user.id).to.equal(createdUser1.id);
				expect(user.name).to.equal(createdUser1.name);
				expect(user.email).to.equal(createdUser1.email);
				expect(user.address).to.equal(createdUser1.address);
			})
		});
	});

	describe('findAll', () => {
		it('should return an empty if all conditions does not match', () => {
			return users.findAll({
				where: {
					address: user1.address,
					email: user2.email,
				},
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			});
		});

		it('should return empty array non of the fields match', () => {
			return users.findAll({
				where: {
					address: wrongdUserDetails.address,
					email: wrongdUserDetails.email,
				},
				type: 'or',
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			});
		});

		it('should return all models if no condition is specified', () => {
			return users.findAll()
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(6);
			});
		});

		it('should return all models that meets the specified conditions', () => {
			return users.findAll({
				where: {
					address: 'somewhere in the world',
				}
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers).to.have.length.of.at.least(1);
			});
		});

		it('should return models matching any of the field', () => {
			return users.findAll({
				where: {
					address: createdUser2.address,
					email: createdUser2.email,
				},
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
			});
		});

		it('should return models matching any of the field', () => {
			return users.findAll({
				where: {
					address: wrongdUserDetails.address,
					email: createdUser2.email,
				},
				type: 'or',
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
			});
		});

		it('should return models matching fields based on their groupings', () => {
			return users.findAll({
				where: {
					address: createdUser2.address,
					email: createdUser2.email,
					name: createdUser3.name,
				},
				type: 'or',
				groups: [['address', 'name'], ['address', 'email']],
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
			});
		});

		it('should return models with fields matching multiple value and or type search', () => {
			return users.findAll({
				where: {
					address: wrongdUserDetails.address,
					email: [createdUser2.email, createdUser1.email, createdBulkUsers[0].email ],
				},
				type: 'or',
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
			});
		});

		it('should return models matching for type or, and groups with multiple values of keys', () => {
			return users.findAll({
				where: {
					address: wrongdUserDetails.address,
					email: [createdUser2.email, createdUser1.email, createdBulkUsers[0].email ],
				},
				type: 'or',
				groups: [['email'], ['address']]
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
			});
		});
	});

	describe('update method', () => {
		it('should not update if no params are pass in', () => {
			return users.update()
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument at position 1 to specify update condition'
				);
			});
		});

		it('should return error no params if no params are pass in', () => {
			return users.update(
				{ where: {}},
			)
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument 2 of type object. only one argument supplied!'
				);
			});
		});

		it('should not update a model that does not exist', () => {
			return users.update({
				where: {
					id: wrongdUserDetails.id,
				}
			}, user1DataToUpdate)
			.catch((error) => {
				expect(error).to.eql({ message: `user not found` })
			})
		});

		it('should update a model', () => {
			return users.update({
				where: {
					id: createdUser1.id
				}
			}, user1DataToUpdate)
			.then((newUser1) => {
				expect(newUser1.id).to.equal(createdUser1.id);
				expect(newUser1.name).to.equal(user1DataToUpdate.name);
				expect(newUser1.email).to.equal(user1.email);
				expect(newUser1.address).to.not.equal(user1.address);
				expect(newUser1.address).to.equal(user1DataToUpdate.address);
				expect(newUser1.updatedAt).to.not.equal(createdUser1.updatedAt);
			});
		});

		it('should update a model with condition other than id specified', () => {
			return users.update({
				where: {
					email: user2.email,
					name: user2.name,
				}
			}, user2DataToUpdate)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(createdUser2.id);
				expect(newUser2.name).to.equal(createdUser2.name);
				expect(newUser2.email).to.equal(createdUser2.email);
				expect(newUser2.address).to.not.equal(user2.address);
				expect(newUser2.address).to.equal(user2DataToUpdate.address);
			});
		});

		it('should not update model that does not have matching group condition', () => {
			return users.update({
				where: {
					id: createdUser2.id,
					email: user1.email,
					name: user1.name,
				},
				type: 'or',
				groups: [['id', 'name'], ['id', 'email']]
			}, user2DataToUpdate)
			.then((newUser2) => {
				expect(newUser2.name).to.equal('undefined');
			})
			.catch(error => {
				expect(error)
					.to.have.property('message')
					.to.equal('user not found');
			});
		});

		it('should update model that matches a group condition', () => {
			return users.update({
				where: {
					id: createdUser2.id,
					email: user1.email,
					name: user2.name,
				},
				type: 'or',
				groups: [['id', 'name'], ['id', 'email']]
			}, user2DataToUpdate)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(createdUser2.id);
				expect(newUser2.name).to.equal(createdUser2.name);
				expect(newUser2.email).to.equal(createdUser2.email);
				expect(newUser2.address).to.not.equal(user2.address);
				expect(newUser2.address).to.equal(user2DataToUpdate.address);
			});
		});
	});

	describe('destroy', () => {
		it('should delete a model that meets the specified condition', () => {
			return users.destroy({
				where: {
					id: createdUser1.id,
				}
			})
			.then((message) => {
				expect(message).to.eql({ message: 'user has been deleted' });
			});
		});

		it('should not delete a model that does not meets the specified condition', () => {
			return users.destroy({
				where: {
					id: createdBulkUsers[1].id,
				}
			})
			.catch((message) => {
				expect(message).to.eql({ message: 'user not found, not action taken' });
			});
		});
	});

	describe('Clear', () => {
		it('should get available users', () => {
			return users.findAll().then(result => {
				expect(result.length).to.equal(4);
			})
		});

		it('should clear the model users', () => {
			return users.clear().then(res => {
				expect(res)
					.to.have.property('message')
					.to.equal('Successful cleared users')
			});
		});

		it('should return 0 users', () => {
			return users.findAll().then(result => {
				expect(result.length).to.equal(0);
			})
		})
	});

	describe('Message', () => {
		it('should validate the type of required and unique field', () => {
			const messages2 = new DataModel('message2', {}, {});
			expect(messages2).to.deep.equal({
				typeError: 'argument2 and argument3 must be of type array',
			});
		});
		it('should create bulk model with required fields', () => {
			const message = [
				{
					message: 'Hello world!!!'
				}
			];
			return messages.bulkCreate(message)
				.then(res => {
					expect(res.length).to.equal(1);
					expect(res[0]).to.have
						.property('message').to.equal('Hello world!!!')
				})
		});
		it('should create bulk model with required fields', () => {
			const message = { message: 'Hello world!' };
			return messages.create(message)
				.then(res => {
					expect(res).to.have.property('message')
						.to.equal('Hello world!')
				});
		});

		it('should clear the table', () => {
			return messages.clear()
				.then(res => {
					expect(res)
						.to.have.property('message')
						.to.equal('Successful cleared messages');
				});
		})
	})

	if (parseInt(process.env.USE_DB)) {
		let createdMessage = {}
		describe('Testing rawQuery func', () => {
			it('should create a message', () => {
				const message = 'good day everyone';
				const queryString = `INSERT INTO 
					messages ("message", "createdAt", "updatedAt")
					VALUES('${message}', 'now()', 'now()') returning *;`;
				return messages.rawQuery(queryString)
					.then(res => {
						expect(res[0]).to.have.property('id');
						expect(res[0]).to.have.property('message').to.equal(message)
						Object.assign(createdMessage, res[0])
					});
			});

			it('should delete message with id from table', () => {
				const queryString = `DELETE FROM messages WHERE id = ${createdMessage.id} returning *`;
				return messages.rawQuery(queryString)
					.then(res => {
						expect(res[0])
							.to.have.property('id')
							.to.equal(createdMessage.id);
					});
			});
		});
	}
});

console.timeEnd('timeChecked')
