
import chai from 'chai';
import DataModel from '../main/DummyDataModel';
console.time('timeChecked');
const { expect } = chai;
const users = new DataModel('users', ['name', 'email'], ['name']);
const messages = new DataModel('messages');

const user1 = {
	name: 'jane doe',
	email: 'jane_doe@somebody.com',
	address: 'somewhere in the world',
}
const user2 = {
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet',
}

const userWithoutEmail ={
	name: 'alice',
	noEmail: 'alice@somebody.com',
	address: 'lives in another planet',
}

const bulkUsers = [
	{
		name: 'brain',
		email: 'brain@email.com',
		address: 'lives in pluto',
	},
	{
		name: 'walter',
		email: 'walter@email.com',
		address: 'lives in mars',
	},
	{
		name: 'ryan',
		email: 'ryan@email.com',
		address: 'lives in neptune',
	},
]
const createdUser2 = {};
const createdUser1 = {};
const wrongdUser1 = {
	id: 10,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet',
}
const userToUpdate1 = {
	name: 'alice bob',
	address: 'now living in planet earth',
}

const userToUpdate2 = {
	address: 'has moved to jupiter',
}
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
		it('should create a new user', () => {
			return users.create(user1)
			.then((user) => {
				Object.assign(createdUser1, user);
				expect(user.id).to.equal(1);
				expect(user.name).to.equal('jane doe');
				expect(user.email).to.equal('jane_doe@somebody.com');
				expect(user.address).to.equal('somewhere in the world');
				expect(user).to.have.property('createdAt');
				expect(user).to.have.property('updatedAt')
			})
		});

		it('should create a another user', () => {
			return users.create(user2)
			.then((user) => {
				Object.assign(createdUser2, user);
				expect(user.id).to.equal(2);
				expect(user.name).to.equal('alice');
				expect(user.email).to.equal('alice@somebody.com');
				expect(user.address).to.equal('lives in another planet');
				expect(user).to.have.property('createdAt');
				expect(user).to.have.property('updatedAt')
			});
		});
		it('should not create a model with unique key constriant', () => {
			return users.create(user1)
			.catch((error) => {
				expect(error).to.eql({ message: `duplicate entry for unique key "name" with value "${user1.name}"` });
			});
		});

		it('should not create a model if a required field is not present', () => {
			return users.create(userWithoutEmail)
			.catch((error) => {
				expect(error).to.eql({ message: `missing required field email` });
			});
		});

		it('should not create multiple users if any user without a required field', () => {
			const bulkUsersObj = bulkUsers.map(user => {
				return {...user };
			});
			delete bulkUsersObj[0].name;
			return users.bulkCreate(bulkUsersObj)
				.catch(error => {
					expect(error).to.be.an('array')
					expect(error[0]).to.have.property('message')
						.to.equal('missing required field');
				})
		});

		it('should create multiple users using bulk create', () => {
			return users.bulkCreate(bulkUsers)
				.then(res => res)
				.then(result => {
					expect(result.length).to.equal(3)
				})
		});

		it('lenght of model should increase', () => {
			expect(users.model.length).to.equal(5);
		});
	});

	describe('update method', () => {
		it('should return error no params if no params are pass in', () => {
			return users.update()
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument at position 1 to specify update condition'
				)
			})
		})
		it('should return error no params if no params are pass in', () => {
			return users.update(
				{ where: {}},
			)
			.catch(err => {
				expect(err).to.have.property('message')
				expect(err.message).to.equal(
					'require argument 2 of type object. only one argument supplied!'
				)
			})
		})
		it('should not update a wrong model', () => {
			return users.update({
				where: {
					id: wrongdUser1.id,
				}
			}, userToUpdate1)
			.catch((error) => {
				expect(error).to.eql({ message: `user not found` })
			})
		});

		it('should update a model', () => {
			return users.update({
				where: {
					id: createdUser2.id
				}
			}, userToUpdate1)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(2);
				expect(newUser2.name).to.equal('alice bob');
				expect(newUser2.email).to.equal('alice@somebody.com');
				expect(newUser2.address).to.equal('now living in planet earth');
				expect(newUser2.updatedAt).to.not.equal(createdUser2.updatedAt)
			});
		});

		it('should update a model with condition other than id specified', () => {
			return users.update({
				where: {
					email: createdUser2.email,
					name: 'alice bob',
				}
			}, userToUpdate2)
			.then((newUser2) => {
				expect(newUser2.id).to.equal(2);
				expect(newUser2.name).to.equal('alice bob');
				expect(newUser2.email).to.equal('alice@somebody.com');
				expect(newUser2.address).to.equal('has moved to jupiter');
			});
		});
	});

	describe('findById', () => {
		it('should return the model with the given id', () => {
			return users.findById(1)
			.then((user) => {
				expect(user.id).to.equal(1);
				expect(user.name).to.equal('jane doe');
				expect(user.email).to.equal('jane_doe@somebody.com');
				expect(user.address).to.equal('somewhere in the world');
			});
		});

		it('should return not found if model with given id is not not found', () => {
			return users.findById(10)
			.then((user) => {
				expect(user.id).to.equal(1);
				expect(user.name).to.equal('jane doe');
				expect(user.email).to.equal('jane_doe@somebody.com');
				expect(user.address).to.equal('somewhere in the world');
			})
			.catch((error) => {
				expect(error).to.eql({ error: 'user not found' });
			});
		});
	});

	describe('find', () => {
		it('should return an error message if no where condition is specified', () => {
			return users.find()
			.catch((error) => {
				expect(error).to.eql({ message: `missing object propertiy 'where' to find model`})
			})
		});

		it('should find a model that meet the given conditions', () => {
			return users.find({
				where: {
					name: 'alice bob',
				}
			})
			.then((user) => {
				expect(user.id).to.equal(2);
				expect(user.name).to.equal('alice bob');
				expect(user.email).to.equal('alice@somebody.com');
				expect(user.address).to.equal('has moved to jupiter');
			})
		});

		it('should only return a model that meet all conditions', () => {
			return users.find({
				where: {
					name: 'alice bob',
					id: 4,
				}
			})
			.then((user) => {
				expect(user).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth',
				});
			})
			.catch((error) => {
				expect(error).to.eql({ message: 'user not found' });
			});
		});
	});

	describe('findAll', () => {
		it('should return all models if no condition is specified', () => {
			return users.findAll()
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(5);
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

		it('should return an empty if all conditions does not match', () => {
			return users.findAll({
				where: {
					address: 'somewhere in the world a',
					email: 'jane_doe@somebody.com',
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
					address: 'somewhere in the world a',
					email: 'janne_doe@somebody.com',
				},
				type: 'or',
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			});
		});

		it('should return models matching any of the field', () => {
			return users.findAll({
				where: {
					address: 'somewhere in the world a',
					email: 'jane_doe@somebody.com',
				},
				type: 'or',
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(1);
			});
		});
	});

	describe('destroy', () => {
		it('should delete a model that meets the specified condition', () => {
			return users.destroy({
				where: {
					id: 1,
				}
			})
			.then((message) => {
				expect(message).to.eql({ message: 'user has been deleted' });
			});
		});

		it('should  not delete a model that does not meets the specified condition', () => {
			return users.destroy({
				where: {
					id: 5,
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
				expect(result.length).to.equal(3);
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
					message: 'Hello world!'
				}
			];
			return messages.bulkCreate(message)
				.then(res => {
					expect(res.length).to.equal(1);
					expect(res[0]).to.have
						.property('message').to.equal('Hello world!')
				});
		});
		it('should create bulk model with required fields', () => {
			const message = { message: 'Hello world!' };
			return messages.create(message)
				.then(res => {
					expect(res).to.have.property('message')
						.to.equal('Hello world!')
				});
		});
	})
});

console.timeEnd('timeChecked')
