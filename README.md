# dummy-data-model

dummy-data-model is a module for working with dummy-data while developing an application and allows you to use sequelize methods in your controller.

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


