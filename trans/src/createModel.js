'use strict';

var _DummyDataModel = require('./DummyDataModel');

var _DummyDataModel2 = _interopRequireDefault(_DummyDataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var users = new _DummyDataModel2.default('users');

var userController = function userController(object) {
  // users.create(object).then(result => console.log(result));
  users.create(object);
  // users.findAll().then(all => console.log(all));
  //users.findById(2).then(all => console.log(all));
};

userController({
  name: 'godfey',
  address: 'warri',
  email: 'godfrey_tutU@yahoo.com'
});
userController({
  name: 'gdfey',
  address: 'lagos',
  email: 'gdfey@gmail.com'
});
userController({
  name: 'gofey',
  address: 'warri',
  email: 'gofey@yahoo.com'
});

// users.findById(3).then(user => console.log(user));
// users.findById(6).then(user => console.log(user)).catch(error => console.log(error));
users.find({
  where: {
    id: 1,
    address: 'warri',
    email: 'godfrey_tutU@yahoo.com',
    name: 'godfey'
  }
}).then(function (user) {
  return console.log(user);
}).catch(function (error) {
  return console.log(error);
});
//# sourceMappingURL=createModel.js.map