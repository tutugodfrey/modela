import chai from 'chai';
import DataModela from '../main/DataModela';
import { connect } from '../main/connection';
import { testData } from './helpers';

console.time('timeChecked');
const usingDB = process.env.USE_DB
const { expect } = chai;
const users = new DataModela('users', {
	id: {},
	name: {
		required: true,
		unique: true
	},
	email: {
		required: true
	},
	address: {},
	createdAt: {
		dataType: 'timestamp',
	},
	updatedAt: {
		dataType: 'timestamp',
	}
}, { logQuery: 'yes'});

// use to test datatype checking
const todos = new DataModela('todos', {
	id: {},
	userId: {
		dataType: 'number',
	},
	title: {
		dataType: 'string',
		required: true,
		unique: true
	},
	description: {
		dataType: 'string',
		defaultValue: 'My latest todo'
	},
	completed: {
		dataType: 'boolean',
		required: true,
		defaultValue: false,
	},
	deadline: {
		dataType: 'timestamptz',
	},
	links: {
		dataType: 'array',
		arrayOfType: 'varchar',
		charLength: 500
	},
	createdAt: {
		dataType: 'timestamp'
	},
	updatedAt: {
		dataType: 'timestamp'
	}
});

const messages = new DataModela('messages', {
	id: {},
	message: {},
	createdAt: {
		dataType: 'timestamp',
	},
	updatedAt: {
		dataType: 'timestamp',
	}
});
if (parseInt(usingDB)) {
	const connection = connect(process.env.DATABASE_URL, [ users, messages, todos ]);
}
const {
	user1,
	user2,
	user3, // user3 and user2 has same address
	bulkUsers,
	user1DataToUpdate,
	user2DataToUpdate,
	user2DataToUpdate2,
	wrongdUserDetails,
} = testData;
const createdUser1 = {};
const createdUser2 = {};
const createdUser3 = {};
const createdMessage1 = {};
const createdBulkUsers = [];

describe('Dummy Data Model', () => {
	describe('DataModela', () => {
		it('should export a function', () => {
			expect(DataModela).to.be.a('function');
		})
	});

	describe('DataType Checking Tests', () => {

		it('should throw an error if unsupported datatype is provided', () => {
			try {
				const users2 = new DataModela('users', {
					name: {
						dataType: 'list',
						required: true,
						unique: true
					},
					email: {
						required: true
					},
					address: {}
				});
				} catch (err) {
					expect(err).to.have.property('message').to.equal('dataType list in name is not supported');
					expect(err).to.have.property('supportedDataTypes').to.be.an('array');
				}
		});
	});

	describe('Clear Tables (Relation) that does not exist', () => {
		return users.clear()
			.then(res => {
				// When using DB the table might exist or might not already exit
				// If table does not already exits we still handle as successful
				expect(res).to.have.property('message');
				expect(['Table users does not exist', 'Successfully cleared users'])
					.to.to.includes(res.message);
			})
	});

	describe('Users', () => {
		it('should export a function', () => {
			expect(users).to.be.a('object');
		});
		it('should be an instance of DataModela', () => {
			expect(users).to.be.an.instanceOf(DataModela);
		})
	});

	describe('create method', () => {
		it('user model should be an array', () => {
			expect(users.model).to.be.an('array');
		})

		it('should return an error message if modelToCreate is not supplied', () => {
			const user = { ...user1 };
			delete user.email;
			return users.create()
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error).to.eql({ message: 'Expected an object to create at position 1' });
			});
		});

		it('should return an error message if returnFields is not an array', () => {
			const user = { ...user1 };
			delete user.email;
			return users.create(user, {})
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error)
					.to.have.property('message')
					.to.equal('Expected an array of fields to return');
			});
		});

		it('should return an error message if object to create does not contain properties', () => {
			const user = { ...user1 };
			return users.create({})
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error)
					.to.have.property('message')
					.to.contain('missing required field');
			});
		});

		it('should not create if field not specified in schema is supplied', () => {
			const user = { ...user1 };
			user.email;
			user.random = 'random value'
			return users.create(user)
			.catch((error) => {
				expect(error).to.eql({ message: `random is not defined in schema for users` });
			});
		});

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
				expect(user).to.have.property('updatedAt');
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

		it('should create a another user and return specified fields', () => {
			const user = { ...user3 };
			return users.create(user, ['id', 'name', 'email', 'address'])
			.then((user) => {
				Object.assign(createdUser3, user);
				expect(user).to.have.property('id');
				expect(user.name).to.equal(user3.name);
				expect(user.email).to.equal(user3.email);
				expect(user.address).to.equal(user3.address);
				expect(user).to.not.have.property('createdAt');
				expect(user).to.not.have.property('updatedAt')
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
				.then(res =>  res)
				.then(result => {
					expect(result.length).to.equal(3);
					expect(result[0]).to.have.property('id');
					expect(result[0]).to.have.property('name');
					expect(result[0]).to.have.property('email');
					expect(result[0]).to.have.property('address');
					expect(result[0]).to.have.property('updatedAt');
					expect(result[0]).to.have.property('createdAt');
					Object.assign(createdBulkUsers, result);
				});
		});
	});

	describe('findById', () => {
		it('should return not found if model does not exist', () => {
			return users.findById()
				.then(user => { /* */ })
				.catch((error) => {
					expect(error)
						.to.have.property('message')
						.equal('Expected argument 1 to be id of model to search');
				});
		});

		it('should return an error message if return fields is not an array', () => {
			return users.findById(wrongdUserDetails.id, {})
				.then(user => { /*  */ })
				.catch((error) => {
					expect(error)
						.to.have.property('message')
						.equal('Expected an array of fields to return');
				});
		});

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

		it('should return specified fields for model with given id', () => {
			return users.findById(createdUser1.id, ['id', 'name', 'email'])
				.then((user) => {
					expect(user.id).to.equal(createdUser1.id);
					expect(user.name).to.equal(user1.name);
					expect(user.email).to.equal(user1.email);
					expect(user).to.not.have.property('address');
				});
		});
	});

	describe('find', () => {
		it('should return an error message if condition is not specified', () => {
			return users.find()
				.then(user => {
					expect(user.name).to.equal('undefined');
				})
				.catch((error) => {
					expect(error).to.eql({
						message: `Missing object property 'where' to find model`,
					});
				});
		});

		it('should return an error message if where condition is not specified', () => {
			return users.find({})
				.then(user => {
					expect(user.name).to.equal('undefined');
				})
				.catch((error) => {
					expect(error).to.eql({
						message: `Missing object property 'where' to find model`,
					});
				});
		});

		it('should return an error message if returnFields is not an array', () => {
			return users.find({
				where: {
					name: createdUser1.name,
					id: createdUser2.id,
				}
			}, {})
			.then(user => {
				expect(user.name).to.equal('undefined')
			})
			.catch((error) => {
				expect(error).to.eql({ message: 'Expected an array of fields to return' });
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

		it('should find a model using multiple attributes with "or" type', () => {
			return users.find({
				where: {
					address: createdUser1.address,
					name: createdUser2.name,
				},
				type: 'or',
			})
			.then((user) => {
				expect([ createdUser1.id, createdUser2.id]).to.include(user.id);
				expect([ createdUser1.name, createdUser2.name]).to.include(user.name);
				expect([ createdUser1.email, createdUser2.email]).to.include(user.email);
				expect([ createdUser1.address, createdUser2.address]).to.include(user.address);
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

		it('should return specified fields for model with matching attributes', () => {
			return users.find({
				where: {
					name: [createdUser1.name, createdUser2.name],
				}
			},
			['id', 'name', 'address'])
			.then((user) => {
				expect(user.id).to.equal(createdUser1.id);
				expect(user.name).to.equal(createdUser1.name);
				expect(user).to.not.have.property('email');
				expect(user.address).to.equal(createdUser1.address);
			})
		});
	});

	describe('findAll', () => {
		it('should fail if condition is not all or {}', () => {
			return users.findAll([{
				where: {
					address: user1.address,
					email: user2.email,
				},
			}])
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			})
			.catch(err => {
				expect(err.message)
				.to.have.equal(
					'Expected an object with key \'where\' or the string \'all\' at position 1',
				);
			});
		});

		it('should fail if condition is not all and is does not have an {} wih where key', () => {
			return users.findAll({})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			})
			.catch(err => {
				expect(err.message)
					.to.have.equal(
						'Expected an object with key \'where\' or the string \'all\' at position 1',
					);
			});
		});

		it('should fail for where condition without properties', () => {
			return users.findAll({ where: {}})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			})
			.catch(err => {
				expect(err.message)
					.to.have.equal(
						'Expected an object with key \'where\' or the string \'all\' at position 1',
					);
			});
		});

		it('should fail if return fields is not an array, case 1', () => {
			return users.findAll('all', {})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			})
			.catch(err => {
				expect(err.message).to.equal('Expected an array of fields to return');
			});
		});

		it('should fail if return fields is not an array, case 2', () => {
			return users.findAll({
				where: {
					username: user1.username,
				}
			}, {})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			})
			.catch(err => {
				expect(err.message).to.equal('Expected an array of fields to return');
			});
		});

		it('should return all models if no condition is specified', () => {
			return users.findAll()
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(6);
				expect(allUsers[0]).to.have.property('id');
				expect(allUsers[0]).to.have.property('address');
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
				expect(allUsers[0]).to.have.property('createdAt');
				expect(allUsers[0]).to.have.property('updatedAt');
			});
		});

		it('should return all models if no condition is specified', () => {
			return users.findAll('all', ['name', 'email', 'createdAt', 'updatedAt'])
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(6);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('email');
				expect(allUsers[0]).to.have.property('createdAt');
				expect(allUsers[0]).to.have.property('updatedAt');
				expect(allUsers[0]).to.not.have.property('id');
				expect(allUsers[0]).to.not.have.property('address');
			});
		});

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

		it('should return specified field for matching models', () => {
			return users.findAll({
				where: {
					address: wrongdUserDetails.address,
					email: [createdUser2.email, createdUser1.email, createdBulkUsers[0].email ],
				},
				type: 'or',
				groups: [['email'], ['address']]
			},
			['id', 'name', 'createdAt', 'updatedAt'])
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.greaterThan(0);
				expect(allUsers[0]).to.have.property('name');
				expect(allUsers[0]).to.have.property('createdAt');
				expect(allUsers[0]).to.have.property('updatedAt');
				expect(allUsers[0]).to.not.have.property('email');
			});
		});

		// Testing for search limit
		it('should return result base on the limit specified in condition', () => {
			return users.findAll({ limit: 4 })
				.then(res => {
					expect(res).to.be.an('array');
					expect(res).to.have.length.not.greaterThan(4);
				});
		});

		it('should return result base on the limit with where conditions', () => {
			// should have returned 3 but we are limiting it to two
			return users.findAll({ where: {name: [createdUser1.name, createdUser2.name, createdUser3.name]}, limit: 2 })
				.then(res => {
					expect(res).to.be.an('array');
					expect(res).to.have.length.not.greaterThan(2);
				});
		});
	});

	describe('update method', () => {
		it('should not update if no params are pass in', () => {
			return users.update()
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument 1 of type object. only one argument supplied!'
				);
			});
		});

		it('should return error no params if no params are pass in', () => {
			return users.update(
				user1DataToUpdate,
				// { where: {}},
			)
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument at position 2 to specify update condition',
				);
			});
		});

		it('should not update a model that does not exist', () => {
			return users.update(
				user1DataToUpdate,
				{
					where: {
						id: wrongdUserDetails.id,
					},
				}
			)
			.catch((error) => {
				expect(error).to.eql({ message: `user not found` })
			})
		});

		it('should update a model', () => {
			return users.update(
				user1DataToUpdate,
				{
					where: {
						id: createdUser1.id,
					},
				}
			)
			.then((updatedUser1) => {
				expect(updatedUser1.id).to.equal(createdUser1.id);
				expect(updatedUser1.name).to.equal(user1DataToUpdate.name);
				expect(updatedUser1.email).to.equal(user1.email);
				expect(updatedUser1.address).to.not.equal(user1.address);
				expect(updatedUser1.address).to.equal(user1DataToUpdate.address);
				expect(updatedUser1.updatedAt).to.not.equal(createdUser1.updatedAt);
				Object.assign(createdUser1, updatedUser1);
			});
		});

		it('should update a model with condition other than id specified', () => {
			return users.update(
				user2DataToUpdate,
				{
					where: {
						email: user2.email,
						name: user2.name,
					}
				}
			)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(createdUser2.id);
				expect(newUser2.name).to.equal(createdUser2.name);
				expect(newUser2.email).to.equal(createdUser2.email);
				expect(newUser2.address).to.not.equal(user2.address);
				expect(newUser2.address).to.equal(user2DataToUpdate.address);
			});
		});

		it('should use type:or to update model where two or conditions are specified', () => {
			return users.update(
				user2DataToUpdate2,
				{
					where: {
						email: user2.email,
						name: user2.username,
					},
					type: 'or',
				}
			)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(createdUser2.id);
				expect(newUser2.name).to.equal(createdUser2.name);
				expect(newUser2.email).to.equal(createdUser2.email);
				expect(newUser2.address).to.not.equal(user2.address);
				expect(newUser2.address).to.not.equal(user2DataToUpdate.address);
				expect(newUser2.address).to.equal(user2DataToUpdate2.address);
			});
		});

		it('should not update model that does not have matching group condition', () => {
			return users.update(
				user2DataToUpdate,
				{
					where: {
						id: createdUser2.id,
						email: user1.email,
						name: user1.name,
					},
					type: 'or',
					groups: [['id', 'name'], ['id', 'email']]
				}
			)
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
			return users.update(
				user2DataToUpdate,
				{
					where: {
						id: createdUser2.id,
						email: user1.email,
						name: user2.name,
					},
					type: 'or',
					groups: [['id', 'name'], ['id', 'email']]
				},
				['id', 'name', 'email', 'address'],
			)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(createdUser2.id);
				expect(newUser2.name).to.equal(createdUser2.name);
				expect(newUser2.email).to.equal(createdUser2.email);
				expect(newUser2.address).to.not.equal(user2.address);
				expect(newUser2.address).to.equal(user2DataToUpdate.address);
				expect(newUser2).to.not.have.property('createdAt')
				expect(newUser2).to.not.have.property('updatedAt')
			});
		});
	});

	describe('destroy', () => {
		it('should return an error message if returnFields is not an array', () => {
			return users.destroy({
				where: {
					id: createdUser1.id,
				}
			},
			{},
			)
			.then((res) => {
				//
			})
			.catch(err => {
				expect(err)
					.to.have.property('message')
					.to.equal('Expected an array of fields to return');
			});
		});

		it('should delete a model that meets the specified condition', () => {
			return users.destroy({
				where: {
					id: createdUser1.id,
				}
			},
			['id', 'name', 'createdAt', 'updatedAt'],
			)
			.then((res) => {
				expect(res).to.have.property('message').to.eql('user has been deleted');
				expect(res).to.have.property('id').to.equal(createdUser1.id);
				expect(res).to.have.property('name').to.equal(createdUser1.name);
				expect(res).to.have.property('createdAt').to.eql(createdUser1.createdAt);
				expect(res).to.have.property('updatedAt').to.eql(createdUser1.updatedAt);
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

		it('should delete model based on grouping conditions', () => {
			return users.destroy({
				where: {
					id: createdBulkUsers[2].id,
					name: createdBulkUsers[1].name,
					email: createdBulkUsers[2].email,
				},
				groups: [['id', 'name'], ['id', 'email']],
				type: 'or',
			}, ['id', 'name', 'email', 'address'],
			)
			.then(res => {
				expect(res)
					.to.have.property('id')
					.to.equal(createdBulkUsers[2].id);
				expect(res)
					.to.have.property('name')
					.to.equal(createdBulkUsers[2].name);
				expect(res)
					.to.have.property('email')
					.to.equal(createdBulkUsers[2].email);
				expect(res)
					.to.have.property('address')
					.to.equal(createdBulkUsers[2].address);
			})
			.catch((message) => {
				// pass
			});
		});
		it('should delete model based on grouping conditions', () => {
			return users.destroy({
				where: {
					id: createdBulkUsers[2].id,
					name: [createdBulkUsers[0].name, createdBulkUsers[1].name, createdBulkUsers[2].name],

				},
				type: 'or',
			}, ['id', 'name', 'email', 'address'],
			)
			.then(res => {
				expect(res)
					.to.have.property('id')
					.to.equal(createdBulkUsers[2].id);
				expect(res)
					.to.have.property('name')
					.to.equal(createdBulkUsers[2].name);
				expect(res)
					.to.have.property('email')
					.to.equal(createdBulkUsers[2].email);
				expect(res)
					.to.have.property('address')
					.to.equal(createdBulkUsers[2].address);
			})
			.catch((message) => {
				// pass
			});
		});
	});

	describe('Message', () => {
		it('should validate the type of required and unique field', () => {
			const messages2 = new DataModela('message2', []);
			expect(messages2).to.deep.equal({
				typeError: 'expected argument 2 (schema) to be an object',
			});
		});

		it('should create bulk message model with required fields', () => {
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
		it('should create message model with required fields', () => {
			const message = { message: 'Hello world!' };
			return messages.create(message)
				.then(res => {
					expect(res).to.have.property('message')
						.to.equal('Hello world!')
				});
		});
	});

	describe('Missing Schema Prop Test', () => {
		it('should validate schema property when creating models', () => {
			const messages3 = new DataModela('message3', { message: {} });
			return messages3.create({
				message: 'hello',
				recipient: 'John',
			})
			.catch(err => {
				expect(err).to.have.property('message').to.equal('recipient is not defined in schema for message3')
			});
		});

		it('should validate schema properties when updating models', () => {
			return messages.update(
				{
					message: 'Hello world updated',
					recipient: 'john'
				},
				{
					where: {
						id: createdMessage1.id
					}
				}
			)
			.catch(err => {
				expect(err).to.have.property('message').to.equal('recipient is not defined in schema for messages')
			})
		});
	});

	describe('DataType Validation Test', () => {
		it('should fails on description datatype validation', () => {
			return todos.create({
				title: 'first activity for day',
				userId: 12,
				description: 123,
				completed: false,
				// deadline: new Date(Date.now()).toISOString(),
				deadline: new Date(1605788451842).toISOString(),
				links: ['link1', 'link2'],
			})
			.catch(err => {
				expect(err)
					.to.have.property('message')
					.to.equal('Expected input of type string for description');
			});
		});

		it('should fails on links field datatype validation', () => {
			return todos.create({
				title: 'first activity for day',
				userId: 12,
				description: 'description of the task to be completed',
				completed: false,
				// deadline: Date.now(),
				deadline: new Date(1605788451842).toISOString(),
				links: '[ link1, link2 ]',
			})
			.catch(err => {
				expect(err)
					.to.have.property('message')
					.to.equal('Expected input of type array for links');
			});
		});

		it('should return a not exist message if table does not exist', () => {
			return todos.findAll({
				where: {
					title: 'first activity for day',
				},
			})
			.then(res => {
				// active when using in-memory data or if database table already exist
				expect(res).to.be.an('array').to.have.length(0)
			})
			.catch(err => {
				// active when using db and db table does not exist
				expect(err).to.have.property('message').to.equal('table todos does not exist')
			});
		});

		it('should create model if fields datatype match schema datatype', () => {
			return todos.create({
				links: [ 'link1', 'link2' ],
				title: 'first activity for day',
				userId: 12,
				description: 'description of the task to be completed',
				completed: true,
				deadline: new Date(Date.now()).toISOString(),
			})
			.then(res => {
				expect(res).to.have.property('id');
				expect(res).to.have.property('links').to.be.an('array');
				expect(res).to.have.property('completed').to.equal(true);
			});
		});

		it('should create model and update missing fields with default values', () => {
			return todos.create({
				links: [ 'link1', 'link2' ],
				title: 'todo 2',
				userId: 12,
				description: 'description of the task to be completed',
				// completed: false,
				deadline: new Date(1605788451842).toISOString(),
			})
			.then(res => {
				expect(res).to.have.property('id');
				expect(res).to.have.property('links').to.be.an('array');
				expect(res).to.have.property('completed').to.equal(false);
			});
		});

		it('should use default value for missing un-required fields', () => {
			return todos.create({
				title: 'A second todo item',
				userId: 12,
				completed: true,
				deadline: new Date(1605788451842).toISOString(),
				links: ['link1', 'link2'],
			})
			.then(res => {
				expect(res).to.have.property('id');
				expect(res)
					.to.have.property('description')
					.to.equal(todos.schema.description.defaultValue);
				expect(res).to.have.property('completed').to.equal(true);
				expect(res).to.have.property('createdAt');
				expect(res).to.have.property('updatedAt');
			})
		});

		it('should create model with special character (enable string escaping)', () => {
			return todos.create({
				title: "Test escape's string",
				userId: 12,
				completed: true,
				deadline: new Date(1605788451842).toISOString(),
				links: [{link1: 'http://linktoasite.com'}, {link2: 'http://linktoanothersite.com' }],
			})
				.then(res => {
					expect(res.title).to.equal("Test escape's string");
				})
		})

		it('should create model with data have array that contains an object', () => {
			return todos.create({
				title: "Test escape link with object",
				userId: 12,
				completed: true,
				deadline: new Date(1605788451842).toISOString(),
				links: [{link1: 'http://linktoasite.com'}, {link2: 'http://linktoanothersite.com' }],
			})
				.then(res => {
					expect(res).to.have.property('links').to.have.length(2)
					expect(res.links[0]).to.be.an('object')
				})
		})

		it('should get todos matching search criteria', () => {
			return todos.findAll({
				where: {
					title: 'first activity for day',
				},
			})
			.then(res => {
				expect(res).to.be.an('array').to.have.length(1)
				expect(res[0]).to.have.property('id');
				expect(res[0]).to.have.property('links').to.be.an('array');
				expect(res[0]).to.have.property('completed').to.equal(true);
			});
		});
	});

	describe('Test Clear Method', () => {
		it('should get available users', () => {
			return users.findAll().then(result => {
				expect(result.length).to.equal(2);
			})
		});

		it('should clear the model users', () => {
			return users.clear().then(res => {
				expect(res)
					.to.have.property('message')
					.to.equal('Successfully cleared users')
			});
		});

		it('should return 0 users', () => {
			return users.findAll().then(result => {
				expect(result.length).to.equal(0);
			})
		});

		it('should clear messages', () => {
			return messages.clear()
				.then(res => {
					expect(res)
						.to.have.property('message')
						.to.equal('Successfully cleared messages');
				});
		});

		it('should return 0 users', () => {
			return messages.findAll().then(result => {
				expect(result.length).to.equal(0);
			});
		});

		it('should clear todos', () => {
			return todos.clear().then(res => {
				expect(res).to.have.property('message').to.equal('Successfully cleared todos')
			});
		});

		it('should return 0 users', () => {
			return todos.findAll().then(result => {
				expect(result.length).to.equal(0);
			});
		});
	});

	if (parseInt(usingDB)) {
		let createdMessage = {}
		describe('Testing rawQuery func', () => {
			const message = 'good day everyone';
			it('should create a message', () => {
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
				const queryString = `DELETE FROM messages WHERE id = ${createdMessage.id} returning id, "message", "createdAt"`;
				return messages.rawQuery(queryString)
					.then(res => {
						expect(res[0])
							.to.have.property('id')
							.to.equal(createdMessage.id);
						expect(res[0]).to.have.property('message').to.equal(message);
						expect(res[0]).to.have.property('createdAt');
					});
			});
		});
	}
});

console.timeEnd('timeChecked')
