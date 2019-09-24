# Modela

Modela is a module for working with In memory dummy-data while developing an application and allows you to use common ORM search methods in like `create`, `bulkCreate`, `find`, `findById`, `findAll`, `update`, and `destroy`, `clear` in your controller. The return value is a promise which you can use the ...then() ...catch() block on, or simple use async ...await in your function to get the return value. Example are given below

## status
---

[![Build Status](https://www.travis-ci.org/tutugodfrey/modela.svg?branch=develop)](https://www.travis-ci.org/tutugodfrey/modela)
[![Coverage Status](https://coveralls.io/repos/github/tutugodfrey/modela/badge.svg)](https://coveralls.io/github/tutugodfrey/modela)
[![Maintainability](https://api.codeclimate.com/v1/badges/f9a36d501a936eb890b9/maintainability)](https://codeclimate.com/github/tutugodfrey/modela/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f9a36d501a936eb890b9/test_coverage)](https://codeclimate.com/github/tutugodfrey/modela/test_coverage)

---


## Usage
---

import the module into your project
`import DummyData from modela`

if you are using es5
`const Modela = require('data-modele').default`

initialize your model instance
	```
	const users = new DummyData('users' [ /* specify required fields */ ], [ /* specify unique fields */ ]);
	```
#### Creating a new model

#### Creating a single model
```
!(function() {
  return  users
  .create({
    name: 'Johb doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  })
  .then(es => console.log(res))
}());
```

#### returns
```
{ name: 'Johb doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  id: 1 }
```

#### Create another record
```
!(function() {
  return users.create({
    name: 'Jane doe',
    email: 'janedoe@email.com',
    username: 'janedoe',
  })
  .then(res => console.log(res))
}());
```
#### Returns
```
{ name: 'Janet doe',
  email: 'Janet@email.com',
  username: 'janedoe',
  id: 2 }
```

#### Creating record with bulkCreate
To create new record with the bulkCreate method, simple pass an array of your record to the bulkCreate call.
```
!(function() {
  return  users
  .bulkCreate([{
    name: 'Johb doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  }])
  .then(es => console.log(res))
}());
```

## Finding models

#### Find by Id
```
!(function() {
  return users
  .findById(1)
  .then(res => {
    console.log(res)
  })
}());
```
#### Returns
```
{ name: 'Johb doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  id: 1 }
```

#### FindAll
```
!(function() {
  return users
  .findAll()
  .then(res => {
    console.log(res)
  })
}());
```
#### Returns 
```[ { name: 'Johb doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
    id: 1 },
  { name: 'Janet doe',
    email: 'Janet@email.com',
    username: 'janedoe',
    id: 2 } ]
```

#### Find by find values
```
!(function() {
  return users
  .find({where: {username: 'johndoe'}})
  .then(res => {
    console.log(res)
  })
}());
```
#### Returns 
```
{ name: 'Johb doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  id: 1 }
```

#### Updating a model
```
!(function() {
  return users
    .update({
			where: {
      	id: 2,
				// you can specify other properties as well
			}
    }, {
    name: 'Janet doe',
    email: 'Janet@email.com',
    })
    .then(res => console.log(res))
}())
```
#### Returns
```
{ name: 'Janet doe',
  email: 'Janet@email.com',
  username: 'janedoe',
  id: 2 }
```

#### Deleting a model

```
!(function() {
  return users
  .destroy({ where: { id: 1 }})
  .then(res => console.log(res))
}())
```
#### Returns
```
{ message: 'user has been deleted' }
```

#### Clearing a model

```
!(function() {
  return users
  .clear({ where: { id: 1 }})
  .then(res => console.log(res))
}())
```
#### Returns
```
{ message: 'Successfully cleared users' }
```

## Links
[npm data-modela](https://www.npmjs.com/package/data-modela)

## Author
- Tutu Godfrey<godfrey_tutu@yahool.com>
