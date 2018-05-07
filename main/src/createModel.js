import DummyDataModel from './DummyDataModel';

const users = new DummyDataModel('users');
/* eslint-disable no-console */
const userController = (object) => {
  // users.create(object).then(result => console.log(result));
  users.create(object);
  // users.findAll().then(all => console.log(all));
  // users.findById(2).then(all => console.log(all));
};

userController({
  name: 'godfey',
  address: 'warri',
  email: 'godfrey_tutU@yahoo.com',
});
userController({
  name: 'gdfey',
  address: 'lagos',
  email: 'gdfey@gmail.com',
});
userController({
  name: 'gofey',
  address: 'warri',
  email: 'gofey@yahoo.com',
});

// users.findById(3).then(user => console.log(user));
// users.findById(6).then(user => console.log(user)).catch(error => console.log(error));
users.find({
  where: {
    id: 1,
    address: 'warri',
    email: 'godfrey_tutU@yahoo.com',
    name: 'godfey',
  },
})
  .then(user => console.log(user))
  .catch(error => console.log(error));

users.findAll().then(all => console.log(all));

users.destroy({
  where: {
    id: 3,
  },
}).then(result => console.log(result)).catch(error => console.log(error));

users.findAll().then(all => console.log(all));

users.findById(2).then((user) => {
  users.update(user, {
    name: 'godfrey',
    address: 'warri',
    age: 30,
  }).then(newUser => console.log(newUser));
});
