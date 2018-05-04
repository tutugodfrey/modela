import DummyDataModel from './DummyDataModel';

const users = new DummyDataModel('users');

const userController = (object) => {
	users.create(object).then(result => console.log(result));
	// users.findAll().then(all => console.log(all));
	//users.findById(2).then(all => console.log(all));
}

userController({
 name: 'godfey',
 address: 'warri',
 email: 'godfrey_tutU@yahoo.com'
 });
 userController({ name: 'gdfey', });
 userController({ name: 'gofey', });

users.findById(3).then(user => console.log(user));
users.findById(6).then(user => console.log(user)).catch(error => console.log(error));

