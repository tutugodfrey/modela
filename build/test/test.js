'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _DummyDataModel = require('./../src/DummyDataModel');

var _DummyDataModel2 = _interopRequireDefault(_DummyDataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;

var users = new _DummyDataModel2.default('users', ['name'], ['name', 'email']);
var user1 = {
	name: 'jane doe',
	email: 'jane_doe@somebody.com',
	address: 'somewhere in the world'
};
var user2 = {
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet'
};

var userWithoutEmail = {
	name: 'alice',
	noEmail: 'alice@somebody.com',
	address: 'lives in another planet'
};

var bulkUsers = [{
	name: 'brain',
	email: 'brain@email.com',
	address: 'lives in pluto'
}, {
	name: 'walter',
	email: 'walter@email.com',
	address: 'lives in mars'
}, {
	name: 'ryan',
	email: 'ryan@email.com',
	address: 'lives in neptune'
}];
var createdUser2 = {};
var createdUser1 = {};
var wrongdUser1 = {
	id: 10,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet'
};
var userToUpdate1 = {
	name: 'alice bob',
	address: 'now living in planet earth'
};

describe('Dummy Data Model', function () {
	describe('DataModel', function () {
		it('should export a function', function () {
			expect(_DummyDataModel2.default).to.be.a('function');
		});
	});

	describe('Users', function () {
		it('should export a function', function () {
			expect(users).to.be.a('object');
		});
		it('should be an instance of DataModel', function () {
			expect(users).to.be.an.instanceOf(_DummyDataModel2.default);
		});
	});

	describe('create method', function () {
		it('user model should be an array', function () {
			expect(users.model).to.be.an('array');
		});
		it('should create a new user', function () {
			users.create(user1).then(function (user) {
				Object.assign(createdUser1, user);
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			});
		});

		it('should create a another user', function () {
			users.create(user2).then(function (user) {
				Object.assign(createdUser2, user);
				expect(user).to.eql({
					id: 2,
					name: 'alice',
					email: 'alice@somebody.com',
					address: 'lives in another planet'
				});
			});
		});
		it('should not create a model with unique key constriant', function () {
			users.create(user1).catch(function (error) {
				expect(error).to.eql({ message: 'duplicate entry for unique key name' });
			});
		});

		it('should not create a model if a required field is not present', function () {
			users.create(userWithoutEmail).catch(function (error) {
				expect(error).to.eql({ message: 'missing required field email' });
			});
		});

		it('should create multiple users using bulk create', function () {
			users.bulkCreate(bulkUsers).then(function (result) {
				expect(result.length).to.equal(3);
			});
		});

		it('lenght of model should increase', function () {
			expect(users.model.length).to.equal(5);
		});
	});

	describe('update method', function () {
		it('should update a model', function () {
			users.update(createdUser2, userToUpdate1).then(function (newUser2) {
				expect(newUser2).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth'
				});
			});
		});
		it('should not update a wrong model', function () {
			users.update(wrongdUser1, userToUpdate1).catch(function (error) {
				expect(error).to.eql({ message: 'user not found' });
			});
		});
	});

	describe('findById', function () {
		it('should return the model with the given id', function () {
			users.findById(1).then(function (user) {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			});
		});

		it('should return not found if model with given id is not not found', function () {
			users.findById(10).then(function (user) {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			}).catch(function (error) {
				expect(error).to.eql({ error: 'user not found' });
			});
		});
	});

	describe('find', function () {
		it('should return an error message if no where condition is specified', function () {
			users.find().catch(function (error) {
				expect(error).to.eql({ message: 'missing object propertiy \'where\' to find model' });
			});
		});

		it('should find a model that meet the given conditions', function () {
			users.find({
				where: {
					name: 'alice bob'
				}
			}).then(function (user) {
				expect(user).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth'
				});
			});
		});

		it('should only return a model that meet all conditions', function () {
			users.find({
				where: {
					name: 'alice bob',
					id: 4
				}
			}).then(function (user) {
				expect(user).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'now living in planet earth'
				});
			}).catch(function (error) {
				expect(error).to.eql({ message: 'user not found' });
			});
		});
	});

	describe('findAll', function () {
		it('should return all models if no condition is specified', function () {
			users.findAll().then(function (allUsers) {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(5);
			});
		});

		it('should return all models that meets the specified conditions', function () {
			users.findAll({
				where: {
					address: 'somewhere in the world'
				}
			}).then(function (allUsers) {
				expect(allUsers).to.be.an('array');
				expect(allUsers).to.have.length.of.at.least(1);
			});
		});

		it('should return an empty if no matching condition is found', function () {
			users.findAll({
				where: {
					address: 'somewhere in the world a'
				}
			}).then(function (allUsers) {
				expect(allUsers).to.be.an('array');
				expect(allUsers.length).to.equal(0);
			});
		});
	});

	describe('destroy', function () {
		it('should delete a model that meets the specified condition', function () {
			users.destroy({
				where: {
					id: 1
				}
			}).then(function (message) {
				expect(message).to.eql({ message: 'user has been deleted' });
			});
		});

		it('should  not delete a model that does not meets the specified condition', function () {
			users.destroy({
				where: {
					id: 5
				}
			}).catch(function (message) {
				expect(message).to.eql({ message: 'user not found, not action taken' });
			});
		});
	});
});
//# sourceMappingURL=test.js.map