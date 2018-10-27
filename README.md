# dummy-data-model

dummy-data-model is a module for working with dummy-data while developing an application and allows you to use sequelize methods in your controller.

## status
---

[![Build Status](https://www.travis-ci.org/tutugodfrey/dummy-data-model.svg?branch=develop)](https://www.travis-ci.org/tutugodfrey/dummy-data-model)[![Coverage Status](https://coveralls.io/repos/github/tutugodfrey/dummy-data-model/badge.svg?branch=master)](https://coveralls.io/github/tutugodfrey/dummy-data-model?branch=master)
<a href="https://codeclimate.com/github/tutugodfrey/dummy-data-model/maintainability"><img src="https://api.codeclimate.com/v1/badges/bea54703e01e371a0582/maintainability" /></a>
<a href="https://codeclimate.com/github/tutugodfrey/dummy-data-model/test_coverage"><img src="https://api.codeclimate.com/v1/badges/bea54703e01e371a0582/test_coverage" /></a>

---

# Usage
---

import the module into your project
 `import DummyData from DummDataModel`
initialize your model instance
	```
	const users = new DummyData('users');
	```

	You can now use sequelize method with your in-memory data

## Supported method 
	* create()
	* update()
	* find()
	* findById()
	* findAll()
	* destroy()


