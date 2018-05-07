
import chai from 'chai';
import DataModel from './../src/DummyDataModel';

const { expect } = chai;
const users = new DataModel('users', ['email'], ['name', 'email']);
const user1 = {
  name: 'jane doe',
  email: 'jane_doe@somebody.com',
  address: 'somewhere in the world',
};

const incompleteUser1 = {
	name: '',
  email: 'jane_doe@somebody.com',
  address: 'somewhere in the world',
};

const user2 = {
  name: 'alice',
  email: 'alice@somebody.com',
  address: 'lives in another planet',
};
const createdUser1 = {};
const createdUser2 = {};
const wrongdUser2 = {
  id: 2,
  name: 'alice',
  email: 'alice@somebody.com',
  address: 'lives in another planet',
};
const updateUser2 = {
  name: 'alice bob',
  address: 'now living in planet earth',
};

describe('Dummy Data Model', () => {
  describe('DataModel', () => {
    it('should export a function', () => {
      expect(DataModel).to.be.a('function');
    });
  });

  describe('Users', () => {
    it('should export a function', () => {
      expect(users).to.be.a('object');
    });
    it('should be an instance of DataModel', () => {
      expect(users).to.be.an.instanceOf(DataModel);
    });
  });

  describe('create method', () => {
    it('user model should be an array', () => {
      expect(users.model).to.be.an('array');
    });

    it('should not create a new user if required is null', () => {
      users.create(incompleteUser1)
        .then((user) => {
          expect(user).to.eql({
            id: 1,
            name: 'jane doe',
            email: 'jane_doe@somebody.com',
            address: 'somewhere in the world',
          });
        })
        .catch((error) => {
        	expect (error).to.eql({ message: 'missing required field' })
        });
    });

    it('it should create new user', () => {
      users.create(user1)
        .then((user) => {
        	Object.assign(createdUser1, user);
          expect(user).to.eql({
            id: 1,
            name: 'jane doe',
            email: 'jane_doe@somebody.com',
            address: 'somewhere in the world',
          });
        });
    });

    it('it should create another user', () => {
      users.create(user2)
        .then((user) => {
        	Object.assign(createdUser2, user);
          expect(user).to.eql({
            id: 2,
            name: 'alice',
            email: 'alice@somebody.com',
            address: 'lives in another planet',
          });
        });
    });

    it('should not create duplicate entry for unique keys', () => {
      users.create(user2)
        .then((user) => {
          expect(user).to.eql({
            id: 2,
            name: 'alice',
            email: 'alice@somebody.com',
            address: 'lives in another planet',
          })
        })
        .catch((error) => {
        	expect(error).to.eql({ message: `duplicate entry for unique key` });
        });
    });

    it('lenght of model should increase', () => {
      expect(users.model.length).to.equal(2);
    });
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
	        expect(error).to.eql({ message: 'user not found' });
	      });
	 	});

	 	it('should fail if arguments are not objects', () => {
      users.update('wrongdUser2', updateUser2)
        .then((newUser2) => {
          expect(newUser2).to.eql({
            id: 2,
            email: 'alice@somebody.com',
            name: 'alice bob',
            address: 'now living in planet earth',
          });
        })
        .catch((error) => {
          expect(error).to.eql({ message: 'invalid argument passed to update! expects argument1 and argument2 to be objects' });
        });
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
      users.findById(3)
        .then((user) => {
          expect(user).to.eql({
            id: 1,
            name: 'jane doe',
            email: 'jane_doe@somebody.com',
            address: 'somewhere in the world',
          });
        })
        .catch((error) => {
          expect(error).to.eql({ error: `${users.singleModel} not found` });
        });
    });
  });

  describe('find', () => {
    it('should find a model that meet the given conditions', () => {
    	//  console.log(users)
      users.find({
        where: {
          name: 'alice bob',
        },
      })
      .then((user) => {
        expect(user).to.eql({
          id: 2,
          email: 'alice@somebody.com',
          name: 'alice bob',
          address: 'now living in planet earth',
        });
      });
    });

    it('should only return a model that meet all conditions', () => {
      users.find({
        where: {
          name: 'alice bob',
          id: 4,
        },
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

    it('should fail if no condition is specified', () => {
      users.find()
        .catch((error) => {
          expect(error).to.eql({ message: 'missing object propertiy \'where\' to find model'});
        });
    });

    it('should fail if condition does not have property "where"', () => {
      users.find({})
        .catch((error) => {
          expect(error).to.eql({ message: 'missing object propertiy \'where\' to find model'});
        });
    });
  });

  describe('findAll', () => {
    it('should return all models if no condition is specified', () => {
      users.findAll()
        .then((allUsers) => {
          expect(allUsers).to.be.an('array');
          expect(allUsers.length).to.equal(2);
        });
    });

    it('should return all models that meets the specified conditions', () => {
      users.findAll({
        where: {
          address: 'somewhere in the world',
        },
      })
        .then((allUsers) => {
          expect(allUsers).to.be.an('array');
          expect(allUsers).to.have.length.of.at.least(1);
        });
    });

    it('should return an empty array if models does not that meets the specified conditions', () => {
      users.findAll({
        where: {
          address: 'somewhere the world',
        },
      })
        .then((allUsers) => {
          expect(allUsers).to.be.an('array');
          expect(allUsers).to.have.length(0);
        });
    });
  });
  describe('destroy', () => {
    it('should delete a model that meets the specified condition', () => {
      users.destroy({
        where: {
          id: 1,
        },
      })
        .then((message) => {
          expect(message).to.eql({ message: 'user has been deleted' });
        });
    });

    it('should do nothing if no model meet the specified condition', () => {
      users.destroy({
        where: {
          name: 'linda',
        },
      })
        .catch((message) => {
          expect(message).to.eql({ message: `${users.singleModel} not found, not action taken` });
        });
    });
  });
});
