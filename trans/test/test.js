'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _DummyDataModel = require('./../src/DummyDataModel');

var _DummyDataModel2 = _interopRequireDefault(_DummyDataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;

var users = new _DummyDataModel2.default('users', ['email']);
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
var createdUser1 = {};
var createdUser2 = {};
var wrongdUser2 = {
  id: 2,
  name: 'alice',
  email: 'alice@somebody.com',
  address: 'lives in another planet'
};
var updateUser2 = {
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
    it('it should create new user', function () {
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

    it('it should create another user', function () {
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

    it('should not create duplicate entry for unique keys', function () {
      users.create(user2).then(function (user) {
        expect(user).to.eql({
          id: 2,
          name: 'alice',
          email: 'alice@somebody.com',
          address: 'lives in another planet'
        });
      }).catch(function (error) {
        expect(error).to.eql({ message: 'duplicate entry for unique key' });
      });
    });

    it('lenght of model should increase', function () {
      expect(users.model.length).to.equal(2);
    });
  });

  describe('update method', function () {
    it('should update a model', function () {
      users.update(createdUser2, updateUser2).then(function (newUser2) {
        expect(newUser2).to.eql({
          id: 2,
          email: 'alice@somebody.com',
          name: 'alice bob',
          address: 'now living in planet earth'
        });
      });
    });

    it('should not update a wrong model', function () {
      users.update(wrongdUser2, updateUser2).then(function (newUser2) {
        expect(newUser2).to.eql({
          id: 2,
          email: 'alice@somebody.com',
          name: 'alice bob',
          address: 'now living in planet earth'
        });
      }).catch(function (error) {
        expect(error).to.eql({ message: 'user not found' });
      });
    });

    it('should fail if arguments are not objects', function () {
      users.update('wrongdUser2', updateUser2).then(function (newUser2) {
        expect(newUser2).to.eql({
          id: 2,
          email: 'alice@somebody.com',
          name: 'alice bob',
          address: 'now living in planet earth'
        });
      }).catch(function (error) {
        expect(error).to.eql({ message: 'invalid argument passed to update! expects argument1 and argument2 to be objects' });
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
      users.findById(3).then(function (user) {
        expect(user).to.eql({
          id: 1,
          name: 'jane doe',
          email: 'jane_doe@somebody.com',
          address: 'somewhere in the world'
        });
      }).catch(function (error) {
        expect(error).to.eql({ error: users.singleModel + ' not found' });
      });
    });
  });

  describe('find', function () {
    it('should find a model that meet the given conditions', function () {
      //  console.log(users)
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

    it('should fail if no condition is specified', function () {
      users.find().catch(function (error) {
        expect(error).to.eql({ message: 'missing object propertiy \'where\' to find model' });
      });
    });

    it('should fail if condition does not have property "where"', function () {
      users.find({}).catch(function (error) {
        expect(error).to.eql({ message: 'missing object propertiy \'where\' to find model' });
      });
    });
  });

  describe('findAll', function () {
    it('should return all models if no condition is specified', function () {
      users.findAll().then(function (allUsers) {
        expect(allUsers).to.be.an('array');
        expect(allUsers.length).to.equal(2);
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

    it('should return an empty array if models does not that meets the specified conditions', function () {
      users.findAll({
        where: {
          address: 'somewhere the world'
        }
      }).then(function (allUsers) {
        expect(allUsers).to.be.an('array');
        expect(allUsers).to.have.length(0);
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
  });
});
//# sourceMappingURL=test.js.map