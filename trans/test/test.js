'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _DummyDataModel = require('./../src/DummyDataModel');

var _DummyDataModel2 = _interopRequireDefault(_DummyDataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;

var users = new _DummyDataModel2.default('users');
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
var createdUser2 = {
	id: 2,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet'
};
var wrongdUser2 = {
	id: 1,
	name: 'alice',
	email: 'alice@somebody.com',
	address: 'lives in another planet'
};
var updateUser2 = {
	name: 'alice bob',
	address: 'no living in planet earth'
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
		it('it should a new user', function () {
			users.create(user1).then(function (user) {
				expect(user).to.eql({
					id: 1,
					name: 'jane doe',
					email: 'jane_doe@somebody.com',
					address: 'somewhere in the world'
				});
			});
		});

		it('it should a another user', function () {
			users.create(user2).then(function (user) {
				expect(user).to.eql({
					id: 2,
					name: 'alice',
					email: 'alice@somebody.com',
					address: 'lives in another planet'
				});
			});
		});

		it('lenght of model should increase', function () {
			expect(users.model).to.be.an('array');
		});
	});

	describe('update method', function () {
		it('should update a model', function () {
			users.update(createdUser2, updateUser2).then(function (newUser2) {
				expect(newUser2).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'no living in planet earth'
				});
			});
		});
		it('should not update a wrong model', function () {
			users.update(wrongdUser2, updateUser2).then(function (newUser2) {
				expect(newUser2).to.eql({
					id: 2,
					email: 'alice@somebody.com',
					name: 'alice bob',
					address: 'no living in planet earth'
				});
			}).catch(function (error) {
				expect(error).to.eql({ message: 'user not found' });
			});
		});
	});
});
//# sourceMappingURL=test.js.map