import DummyDataModel from './DummyDataModel';

const users = new DummyDataModel('users');

const userController = (object) => {
	users.create(object).then(result => console.log(result));
	// users.findAll().then(all => console.log(all));
}

userController({
 name: 'godfey',
 address: 'warri',
 email: 'godfrey_tutU@yahoo.com'
 });
 userController({ name: 'gdfey', });
 userController({ name: 'gofey', });


