import DummyDataModel from './DummyDataModel';

const users = new DummyDataModel('users');

const userController = (object) => {
	users.create(object).then(result => console.log(result));
	users.findAll().then(all => console.log(all));
}

userController({ name: 'godfey', });
console.log('result')
userController({ name: 'gdfey', });
console.log('result')
userController({ name: 'godfy', });
console.log('result')
userController({ name: 'godfe', });

/*
users.findAll().then(all => console.log(all))
users.create({
	name: 'gdfey',
}).then(result => console.log(result));


users.findAll().then(all => console.log(all))
users.create({
	name: 'godfy',
}).then(result => console.log(result));


users.findAll().then(all => console.log(all))
users.create({
	name: 'godfe',
}).then(result => console.log(result));

*/

