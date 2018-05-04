
import chai from 'chai';
import DataModel from './../src/DummyDataModel';

const { expect } = chai;
const users = new DataModel('users');
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
const createdUser2 = {
	id: 2,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet',
}
const wrongdUser2 = {
	id: 1,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet',
}
const updateUser2 = {
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
		it('it should a new user', () => {
			users.create(user1)
			.then((user) => {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			});
		});

		it('it should a another user', () => {
			users.create(user2)
			.then((user) => {
				expect(user).to.eql({
					id: 2,
					name: 'alice',
					email: 'alice@somebody.com',
					address: 'lives in another planet'
				});
			});
		});

		it('lenght of model should increase', () => {
			expect(users.model).to.be.an('array');
		})
	});

	describe('update method', () => {
		it('should update a model', () => {
			users.update(createdUser2, updateUser2)
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
			users.update(wrongdUser2, updateUser2)
			.then((newUser2) => {
				expect(newUser2).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth',
				});
			})
			.catch((error) => {
				expect(error).to.eql({ message: `user not found` })
			})
		});
	});
});
