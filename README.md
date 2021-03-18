# Modela

Data-modela is a promise-based Javascript ORM that enable you easily switch between using an actual database and in-memory dummy data when building your APIs. At this time, it works primarily with PostgreSQL database and exposes the following methods `create`, `bulkCreate`, `find`, `findById`, `findAll`, `update`, and `destroy`, `clear`. You can also use the `rawQuery` method if other methods does not met your requirement. 

The module also expose the `connect` function which would be used for making the make the database connection and can be used to bind models with the connection.

## status
---

[![Build Status](https://www.travis-ci.org/tutugodfrey/modela.svg?branch=develop)](https://www.travis-ci.org/tutugodfrey/modela)
[![Coverage Status](https://coveralls.io/repos/github/tutugodfrey/modela/badge.svg)](https://coveralls.io/github/tutugodfrey/modela)
[![Maintainability](https://api.codeclimate.com/v1/badges/f9a36d501a936eb890b9/maintainability)](https://codeclimate.com/github/tutugodfrey/modela/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f9a36d501a936eb890b9/test_coverage)](https://codeclimate.com/github/tutugodfrey/modela/test_coverage)

---


## Usage
---

[Installation](#installation)

[Enable Database Connection](#enabling-database-connection)

[Initialize a model](#model-initialization)

[Create a Model](#model-creation)

[Create Multiple Models](#create-multiple-models)

[Updating Models](#updating-models)

[Find All Models](#find-all-models)

[Find Models By Id](#find-models-by-id)

[Find One Model](#find-one-model)

[Deleting-models](#deleting-models)

[Clearing Database](#clearing-models)

[Using Raw Queries](#using-raw-queries)

[Specifying Search Conditions](#specifying-search-conditions)


### Installation

`$ npm install data-modela` install the package

import the module into your project

`$ import DummyData from data-modela`

`$ import { connect } from data-modela`

if you are using es5

`$ const Modela = require('data-modele').default;`

### Enabling Database Connection

The default behavior for the module is to store your model data in-memory. To switch to using a database, you need to provide the database connection string as with key `DATABASE_URL` and `USE_DB=1` in environment variables. What actually control whether you are using database or not is the `USE_DB` variable which you can switch between 0 and 1, 1 indicating you want to use DB. Database connection string need to be present in your environment to enable successful connection to the database. Once the database connection exist, all the method described below will operating on the database instead of being stored in-memory.

To complete the process of enabling use of database, use the `connect` function to bind the database connection to models. The function will accept the database connectionString, and an array of models to bind to. If the connection is successful, the models will have the `dbConnection` property which is used internally for connecting to the DB. As demonstrated in the example below, if `USE_DB` is set in environment, database will be used. Otherwise data is stored in-memory, thus making it an easy toggle.

### Model Initialization

The model initialization let you define the schema for your model. The schema controls how the is stored and retrieved. Also, if you are using DB, the schema definition will be used to generation table queryString. The queryString will be used to create the relation when you want to create your first record.

```

const users = new DataModela('users', schema = {});


const connection = connect(connectionString, [ list of models... ]);


```

**Example**

```

const users = new DataModela('users', {
  id: {},
  name: {},
  email: {},
  username: {},
  createdAt: {},
  updatedAt: {},
});

if (parseInt(process.env.USE_DB)) {
  const { DATABASE_URL } = process.env;
  const connection = connect(DATABASE_URL, [ users ]);
}

```

#### Properties of model schema

You can specify properties in your model fields object, to control the how the behavior of the model. The following properties can be configured.

- **dataType:** `'string' || 'char' || 'varchar' || 'boolean' || 'time' || 'timestamp', ||'timestampz' || 'array' || date` // default to string for all fields except `id`, `createdAt` and `updatedAt`.

- **required:**  true || false // default to false if not provided.

- **unique:** true || false // boolean, default to false if not provided

- **defaultValue:** specify the default value for the field.

- **arrayOfType:** `'char' || 'varchar' || 'number' || 'boolean' use if you provide **dataType** as `array`

- **charLength:** `IntegerValue` e.g 40. Use if you specify **dataType** as `array` and **arrayOfType** as `char`.

**Example**

```
const users = new DataModela('users', {
  id: {},
  name: {
    dataType: 'string',
  },
  email: {
    dataType: 'string',
    unique: true,
    required: true,
  },
  username: {
    unique: true,
    required: true,
    dataType: 'char',
    charLength: '30',
  },
  createdAt: {},
  updatedAt: {},
});

```

### Model Creation

To create models you can user `create` method or the `bulkCreate` method and pass in the values for the fields specified in the schema. Optionally, you can provided array of fields to return after the model is created. If `id`, `createdAt`, `updatedAt` are specified in the schema but are not provided in the `create` method, the values will be automatically added. The default behavior of the `id` field is to auto increment the value. So you generally won't worry about providing it in the `create` method. 

If the model creation is successful, it will return an object representing the model created or an object with the fields specified as return fields.

```

model.create({
  // object to create
}, [ fields to return ]);

```

**Example**

```

!(function() {
  return  users
  .create({
    name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  })
  .then(res => {
    console.log('Creating a new record for a model')
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return
Creating a new record for a model
{ name: 'John doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  createdAt: '2021-01-17T18:19:52.452Z',
  updatedAt: '2021-01-17T18:19:52.452Z',
  id: 1 }

```

**Specifying return fields**

```

!(function() {
  return  users
  .create({
    name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  }, ['name', 'email', 'createdAt'])
  .then(res => {
    console.log('Creating a new record for a model')
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return 
Creating a new record for a model
{ id: 1,
  name: 'John doe',
  email: 'johndoe@email.com',
  createdAt: '2021-01-17T18:37:14.698Z' }

```

#### Create Multiple Models

To create multiple models at once, you can use the `bulkCreate` methods. This similar to the create method expect that the individaul model to be created are provided as in array to the `bulkCreate` method. You can 

```

!(function() {
  return  users
  .bulkCreate([{
    name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  }])
  .then(res => {
    console.log('Creating models using bulkCreate')
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return
Creating models using bulkCreate
[ { name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
    id: 1 } ]


```

**Specifying return fields**

```

!(function() {
  return  users
  .bulkCreate([{
    name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
  }], ['id', 'name', 'email', 'createdAt'])
  .then(res => {
    console.log('Creating a new record for a model')
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return
[ { id: 1, name: 'John doe', email: 'johndoe@email.com' } ]

```


### Updating Models

To update model properties, you use the `update` method. This method accepts the properties to update, an object with conditions on how to update the model, and optionally an array of fields to return.

If the model is successfully updated, the object representing the updated model is returned.

```

  !(function() {
    return users
      .update(
        {
          name: 'Jane doe',
          email: 'Janet@email.com',
        },
        {
        where: {
          id: 1,
        },
      })
      .then(res => {
        console.log('Updating a model')
        console.log(res)
        process.stdout.write('\n')
      })
      .catch(err => console.log(err));
  }());

// return

Updating a model
{ name: 'Janet doe',
  email: 'Janet@email.com',
  username: 'johndoe',
  createdAt: '2021-01-17T19:09:03.245Z',
  updatedAt: 2021-01-17T19:09:03.353Z,
  id: 1 }

```


**Specifying return fields**

```

  !(function() {
    return users
      .update(
        {
          name: 'Jane doe',
          email: 'Janet@email.com',
        },
        {
        where: {
          id: 1,
        },
      }, ['id', 'name', 'username', 'createdAt'])
      .then(res => {
        console.log('Updating a model')
        console.log(res)
        process.stdout.write('\n')
      })
      .catch(err => console.log(err));
  }());

// return
{ id: 1,
  name: 'Jane doe',
  username: 'johndoe',
  createdAt: '2021-01-17T19:11:55.939Z' }

```

### Find All Models

One way to retrieve models is the `findAll` method. By default this method will return all models in the collection. But specify conditions to search for matching models by passing an object with conditions to the method. You are also able to specify the fields to return.

The method will return an array containing the matching models. If no model exist in the collection or no matching model is found an empty array `[]` is returned. 

```

model.findAll(condition = 'all' || {}, returnFields=[]);

```

**Example**

```

!(function() {
  return users
  .findAll()
  .then(res => {
    console.log('Find all model');
    console.log(res);
    process.stdout.write('\n');
  })
}());

// return
Find all model
[ { name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
    createdAt: '2021-01-17T19:32:13.406Z',
    updatedAt: '2021-01-17T19:32:13.406Z',
    id: 1 } ]

```

**Specifying Return fields**

```

!(function() {
  return users
  .findAll('all', ['id', 'name', 'email'])
  .then(res => {
    console.log('Find all model with return fields'');
    console.log(res);
    process.stdout.write('\n');
  })
}());

// return
Find all model with return fields'
[ { name: 'John doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
    createdAt: '2021-01-17T19:36:21.340Z',
    updatedAt: '2021-01-17T19:36:21.340Z',
    id: 1 } ]

```

**Specifying conditions**

```

!(function() {
  return users
  .findAll({ where: { name: 'John doe'} }, ['id', 'name', 'email'])
  .then(res => {
    console.log('Find all model with return fields');
    console.log(res);
    process.stdout.write('\n');
  })
  .catch(err => console.log(err));
}());

// returns 
Find all model with return fields
[ { id: 1, name: 'John doe', email: 'johndoe@email.com' } ]

```

```

// Without matching condition

!(function() {
  return users
  .findAll({ where: { name: 'Jane doe'} }, ['id', 'name', 'email'])
  .then(res => {
    console.log('Find all model with return fields');
    console.log(res);
    process.stdout.write('\n');
  })
  .catch(err => console.log(err));
}());

// returns 
Find all model with return fields
[]

```

### Find Models By Id

A convenient to get a specify model if the id of the model is known is the `findById` method. You simple provide the id of the model of interest.

This method will either return the model if it is found or return a not found error message.

model.findById(id);

**Example**

```

!(function() {
  return users
  .findById(1)
  .then(res => {
    console.log('Find a model by Id');
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return

Find a model by Id
{ name: 'John doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  createdAt: '2021-01-17T20:04:10.966Z',
  updatedAt: '2021-01-17T20:04:10.966Z',
  id: 1 }


```

```

!(function() {
  return users
  .findById(100)
  .then(res => {
    console.log('Find a model by Id');
    console.log(res);
  })
  .catch(err => console.log(err));
}());

// return
{ message: 'user not found' }

```

### Find One Model

The `find` method allows you to specify search conditions and get the first model that match.

The method will return a model that match the specified conditon or return a not found error message

model.find({ where: { username: 'johndoe' }})

**Example**

```

!(function() {
  return users
  .find({where: {username: 'johndoe'}})
  .then(res => {
    console.log('Find a model by condition')
    console.log(res);
    process.stdout.write('\n');
  })
  .catch(err => console.log(err));
}());

// return
Find a model by condition
{ name: 'John doe',
  email: 'johndoe@email.com',
  username: 'johndoe',
  createdAt: '2021-01-17T20:13:32.599Z',
  updatedAt: '2021-01-17T20:13:32.599Z',
  id: 1 }

```

```

!(function() {
  return users
  .find({where: {username: 'johndoe'}})
  .then(res => {
    console.log('Find a model by condition')
    console.log(res);
    process.stdout.write('\n');
  })
  .catch(err => console.log(err));
}());

// return
{ message: 'user not found' }

```

### Deleting Models

To delete a model from the model collection, you will use the `destroy` method and specify conditions to match the model to be deleted.

This method will return a success message if the model is found and deleted or 


```

!(function() {
  return users
  .destroy({ where: { id: 1 }})
  .then(res => {
    console.log('Deleting a model')
    console.log(res)
    process.stdout.write('\n')
  })
}())

// return
Deleting a model
{ message: 'user has been deleted' }

```

**When model does not exist**

```
!(function() {
  return users
  .destroy({ where: { id: 2 }})
  .then(res => {
    console.log('Deleting a model')
    console.log(res)
    process.stdout.write('\n')
  })
  .catch(err => console.log(err));
}())

// return

{ message: 'user not found, not action taken' }

```

### Clearing Models

The `clear` method allows you to delete all entries from your model collection.

model.clear()


```

!(function() {
  return users
  .clear({ where: { id: 1 }})
  .then(res => console.log(res))
}())

// return 

{ message: 'Successfully cleared users' }

```


### Using Raw Queries

When using database, the `rawQuery` method could be used to run queries against the database if API exposed by the other methods does not meet your need. You simple pass the `queryString` and the query will be ran against the database assumming a connection is established 

```

model.rawQuery(queryString)

```

### Specifying Search Conditions

Different combination of __where__,  __type__ and __groups__ is used to search for matching models when using the methods `find`, `findAll`, `update` and `delete`. **type** and **groups** provide more control when you have two or more properties in the **where** condition.

Although the samples below is demonstrated using the `findAll` method, It works the same way for `find`, `update`, and `delete`.

```

model.findAll({
  where: {
    propsToSearch1: 'value'
    propsToSearch2: 'value2'
  },
  type: 'or' || 'and' // default 'and'
})

```

- `and` is the default if type is not specified. This return result where all the props match.
- `or` return result where any of the props match.

**Example**

```

{
  where: {
    username: 'john',
    email: 'jane@email.com'
  }
  type: or,
}


```

#### Grouping search keys

It is possible to group the keys to search for by specifying the groups parameter in the search condition as demonstrated below.
In the sample below, if the `or` type condition is specified along with the groups, the search return models that match any of the given groups. If the `and` type condition is specify, the search return model that match all the groups.

```

model.findAll({
  where: {
    propsToSearch1: 'value',
    propsToSearch2: 'value2',
    propsToSearch3: 'value3',
  },
  type: "or" || "and",
  groups: [[propsToSearch1, propsToSearch2], [propsToSearch1, propsToSearch3]],
});

```

**Example**

```

{
  where: {
    id: 1,
    username: 'john',
    email: 'jane@email.com'
  }
  groups: [['id', 'username'], ['id', 'email]],
  type: or,
}


```

## Searching for keys that match multiple values

You can search for a key that match multiple values by passing an array of values to match instead of passing a single value for the key. The sample below demonstrate this

```

model.findAll({
  where: {
    propsToSearch1: 'value',
    propsToSearch2: ['prop2value1', 'prop2value2', 'prop2value3' ]
  },
  type: "or" || "and",
})

```
In this case search will match models where `propsToSearch2` has values that match any of `prop2value1`, `prop2value2` and `prop2value3`, `ANDed` or `ORed` with `propsToSearch1`.

```

{
  where: {
    id: 1,
    username: ['john', 'jane', 'loki'],
  }
  type: and
}


```

## Links

[npm data-modela](https://www.npmjs.com/package/data-modela)

## Author

- Tutu Godfrey <godfrey_tutu@yahoo.com>
