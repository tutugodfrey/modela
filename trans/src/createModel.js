'use strict';

var _DummyDataModel = require('./DummyDataModel');

var _DummyDataModel2 = _interopRequireDefault(_DummyDataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var users = new _DummyDataModel2.default('users');

var userController = function userController(object) {
	users.create(object).then(function (result) {
		return console.log(result);
	});
	users.findAll().then(function (all) {
		return console.log(all);
	});
};

userController({ name: 'godfey' });
userController({ name: 'gdfey' });
userController({ name: 'gofey' });
//# sourceMappingURL=createModel.js.map