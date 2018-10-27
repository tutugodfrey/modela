
import chai from 'chai';
import DataModel from './../src/DummyDataModel';

const { expect } = chai;
const users = new DataModel('users', ['name'], ['name', 'email']);
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
			users.create(user1)
			.then((user) => {
				Object.assign(createdUser1, user);
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			});
		});

		it('should create a another user', () => {
			users.create(user2)
			.then((user) => {
				Object.assign(createdUser2, user);
				expect(user).to.eql({
					id: 2,
					name: 'alice',
					email: 'alice@somebody.com',
					address: 'lives in another planet'
				});
			});
		});
		it('should not create a model with unique key constriant', () => {
			users.create(user1)
			.catch((error) => {
				expect(error).to.eql({ message: 'duplicate entry for unique key name' });
			});
		});

		it('should not create a model if a required field is not present', () => {
			users.create(userWithoutEmail)
			.catch((error) => {
				expect(error).to.eql({ message: `missing required field email` });
			});
		});

		it('should create multiple users using bulk create', () => {
			users.bulkCreate(bulkUsers)
			.then(result => {
				expect(result.length).to.equal(3)
			})
		})

		it('lenght of model should increase', () => {
			expect(users.model.length).to.equal(5);
		})
	});

	describe('update method', () => {
		it('should update a model', () => {
			users.update(createdUser2, userToUpdate1)
			.then((newUser2) => {
				expect(newUser2).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth',
				});
			});
		});
		it('should not update a wrong model', () => {
			users.update(wrongdUser1, userToUpdate1)
			.catch((error) => {
				expect(error).to.eql({ message: `user not found` })
			})
		});
	});

	describe('findById', () => {
		it('should return the model with the given id', () => {
			users.findById(1)
			.then((user) => {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world',
				});
			});
		});

		it('should return not found if model with given id is not not found', () => {
			users.findById(10)
			.then((user) => {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world',
				});
			})
			.catch((error) => {
				expect(error).to.eql({ error: 'user not found' });
			});
		});
	});

	describe('find', () => {
		it('should return an error message if no where condition is specified', () => {
			users.find()
			.catch((error) => {
				expect(error).to.eql({ message: `missing object propertiy 'where' to find model`})
			})
		});

		it('should find a model that meet the given conditions', () => {
			users.find({
				where: {
					name: 'alice bob',
				}
			})
			.then((user) => {
				expect(user).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth',
				})
			})
		});

		it('should only return a model that meet all conditions', () => {
			users.find({
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
			users.findAll()
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(5);
			});
		});

		it('should return all models that meets the specified conditions', () => {
			users.findAll({
				where: {
					address: 'somewhere in the world',
				}
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers).to.have.length.of.at.least(1);
			});
		});

		it('should return an empty if no matching condition is found', () => {
			users.findAll({
				where: {
					address: 'somewhere in the world a',
				}
			})
			.then((allUsers) => {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			});
		});
	});

	describe('destroy', () => {
		it('should delete a model that meets the specified condition', () => {
			users.destroy({
				where: {
					id: 1,
				}
			})
			.then((message) => {
				expect(message).to.eql({ message: 'user has been deleted' });
			});
		});

		it('should  not delete a model that does not meets the specified condition', () => {
			users.destroy({
				where: {
					id: 5,
				}
			})
			.catch((message) => {
				expect(message).to.eql({ message: 'user not found, not action taken' });
			});
		});
	});
});
