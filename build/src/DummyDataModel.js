'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DummyDataModel = function () {
	function DummyDataModel(modelName) {
		var uniqueKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
		var requiredFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

		_classCallCheck(this, DummyDataModel);

		if (!Array.isArray(uniqueKeys) || !Array.isArray(requiredFields)) {
			return { typeError: 'argument2 and argument3 must be of type array' };
		}
		this.modelName = modelName;
		this.uniqueKeys = uniqueKeys;
		this.requiredFields = requiredFields;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.model = [];
		this.createBulkItem = this.createBulkItem.bind(this);
		this.createModel = this.createModel.bind(this);
		this.getObjectByField = this.getObjectByField.bind(this);
		this.getFields = this.getFields.bind(this);
	}

	_createClass(DummyDataModel, [{
		key: 'getObjectByField',
		value: function getObjectByField(arrayOfObjects, objectField, fieldValue) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = arrayOfObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var objCollection = _step.value;

					// const objCollection = arrayOfObjects[arraySize];
					if (objCollection[objectField] === fieldValue) {
						return objCollection;
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return 'No object with field ' + objectField + ' found';
		}
	}, {
		key: 'getFields',
		value: function getFields(objCollector, field) {
			if (objCollector[field]) {
				return objCollector[field];
			}
			return undefined;
		}

		// private interface for creating model
		// check for unique keys
		// then create a new model 

	}, {
		key: 'createModel',
		value: function createModel(modelToCreate, resolve, reject) {
			var _this = this;

			if (this.model.length === 0) {
				modelToCreate.id = 1;
				if (this.model.push(modelToCreate)) {
					resolve(modelToCreate);
				}
				reject({ message: 'Can not create ' + this.singleModel });
			} else {
				var lastModel = this.model[this.model.length - 1];
				var lastModelId = this.getFields(lastModel, 'id');
				// verify uniqueKeys
				if (this.uniqueKeys.length === 0) {
					modelToCreate.id = lastModelId + 1;
					if (this.model.push(modelToCreate)) {
						resolve(modelToCreate);
					}
					reject({ message: 'Can not create ' + this.singleModel });
				} else {
					var foundDuplicate = false;
					this.model.forEach(function (model) {
						_this.uniqueKeys.forEach(function (prop) {
							if (model[prop] === modelToCreate[prop]) {
								foundDuplicate = true;
								reject({ message: 'duplicate entry for unique key ' + prop });
							}
						});
					});
					if (!foundDuplicate) {
						modelToCreate.id = lastModelId + 1;
						if (this.model.push(modelToCreate)) {
							resolve(modelToCreate);
						}
						reject({ message: 'Can not create ' + this.singleModel });
					}
				}
			}
		}

		// public interface to create a single model

	}, {
		key: 'create',
		value: function create(modelToCreate) {
			var _this2 = this;

			// create a new model
			var result = new Promise(function (resolve, reject) {
				if (_this2.requiredFields.length === 0) {
					_this2.createModel(modelToCreate, resolve, reject);
				} else {
					var allFieldsPassed = true;
					var requiredFieldsCollection = [];
					_this2.requiredFields.forEach(function (required) {
						if (!modelToCreate[required]) {
							requiredFieldsCollection.push(required);
							allFieldsPassed = false;
						}
					});
					if (!allFieldsPassed) {
						reject({ message: 'missing required field ' + requiredFieldsCollection });
					} else {
						_this2.createModel(modelToCreate, resolve, reject);
					}
				}
			});
			return result;
		}

		// send each item to createModel 
		// and resolve result as a promise

	}, {
		key: 'createBulkItem',
		value: function createBulkItem(modelToCreate) {
			var _this3 = this;

			var result = new Promise(function (resolve, reject) {
				_this3.createModel(modelToCreate, resolve, reject);
			});
			return result;
		}
	}, {
		key: 'bulkCreate',
		value: function bulkCreate(modelsToCreate) {
			var _this4 = this;

			// create a new model
			var createdModels = [];
			if (this.requiredFields.length === 0) {
				modelsToCreate.forEach(function (modelToCreate) {
					var res = _this4.createBulkItem(modelToCreate);
					res.then(function (response) {
						createdModels.push(response);
						if (createdModels.length === modelsToCreate.length) {
							return createdModels;
						}
					});
				});
			} else {
				var allFieldsPassed = true;
				var allModelsPassed = true;
				modelsToCreate.forEach(function (modelToCreate) {
					_this4.requiredFields.forEach(function (required) {
						if (!modelToCreate[required]) {
							allFieldsPassed = false;
							allModelsPassed = false;
						}
					});
				});

				if (!allFieldsPassed && !allModelsPassed) {
					reject({ message: 'missing required field' });
				} else {
					modelsToCreate.forEach(function (modelToCreate) {
						var res = _this4.createBulkItem(modelToCreate);
						res.then(function (response) {
							createdModels.push(response);
							if (createdModels.length === modelsToCreate.length) {
								return createdModels;
							}
						});
					});
				}
			}

			var result = new Promise(function (resolve, reject) {
				resolve(createdModels);
			});

			return result;
		}
	}, {
		key: 'update',
		value: function update(modelToUpdate, propsToUpdate) {
			var _this5 = this;

			/* 
   	propsToUpdate contain the new properties to replace the old ones
   	this method should be called on the particular object to update.
   	which means that before call update you must use the finder methods to 
   	get the particular object.
   */
			var result = new Promise(function (resolve, reject) {
				if ((typeof propsToUpdate === 'undefined' ? 'undefined' : _typeof(propsToUpdate)) === 'object' && (typeof modelToUpdate === 'undefined' ? 'undefined' : _typeof(modelToUpdate)) === 'object') {
					var props = Object.keys(propsToUpdate);
					var foundModel = _this5.model.filter(function (model) {
						return model.id === modelToUpdate.id;
					});
					foundModel = foundModel[0];
					if (!foundModel) {
						reject({ message: _this5.singleModel + ' not found' });
					} else {
						props.forEach(function (property) {
							foundModel[property] = propsToUpdate[property];
						});
						resolve(foundModel);
					}
				} else {
					reject({ message: 'missing object propertiy \'where\' to find model' });
				}
			});
			return result;
		}
	}, {
		key: 'findById',
		value: function findById(id) {
			var _this6 = this;

			// return an object with the given id
			var modelToFind = this.model.filter(function (model) {
				return model.id === id;
			});
			var result = new Promise(function (resolve, reject) {
				modelToFind = modelToFind[0];
				if (modelToFind) {
					resolve(modelToFind);
				} else {
					reject({ error: _this6.singleModel + ' not found' });
				}
			});
			return result;
		}
	}, {
		key: 'find',
		value: function find(condition) {
			var _this7 = this;

			/* return a single object that meet the condition
   	condition is single object with property where whose value is further
   	an object with key => value pair of the properties of the object to find
   */
			var result = new Promise(function (resolve, reject) {
				if (!condition || !condition.where) {
					reject({ message: 'missing object propertiy \'where\' to find model' });
				} else {
					var props = Object.keys(condition.where);
					var propMatch = void 0;
					var searchResult = void 0;
					_this7.model.forEach(function (model) {
						propMatch = true;
						props.forEach(function (property) {
							if (condition.where[property] !== model[property]) {
								propMatch = false;
							}
						});
						if (propMatch) {
							searchResult = model;
						}
					});
					if (searchResult) {
						resolve(searchResult);
					} else {
						reject({ message: _this7.singleModel + ' not found' });
					}
				}
			});
			return result;
		}
	}, {
		key: 'findAll',
		value: function findAll() {
			var _this8 = this;

			var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

			/* return all objects that meet the condition 
   	condition is single object with property where whose value is further
   	an object with key => value pair of the properties of the object to find
   */
			var result = new Promise(function (resolve, reject) {
				if (condition === 'all') {
					// all model in this instance
					resolve(_this8.model);
				} else {
					// find model that meets the given condition
					var props = Object.keys(condition.where);

					// array of objects that meet the condition
					var searchResult = [];
					var propMatch = void 0;
					_this8.model.forEach(function (model) {
						propMatch = true;
						props.forEach(function (property) {
							if (condition.where[property] !== model[property]) {
								propMatch = false;
							}
						});
						if (propMatch) {
							searchResult.push(model);;
						}
					});
					resolve(searchResult);
				}
			});
			return result;
		}
	}, {
		key: 'destroy',
		value: function destroy(condition) {
			var _this9 = this;

			/* 
   	delete the object that meet the condition 
   	condition is single object with property where whose value is further
   	an object with key => value pair of the properties of the object to find.
   	if several object match the specified condition, only the first match will
   	be deleted
   */
			var result = new Promise(function (resolve, reject) {
				var props = Object.keys(condition.where);
				var propMatch = void 0;
				_this9.model.forEach(function (model) {
					propMatch = true;
					props.forEach(function (property) {
						if (condition.where[property] !== model[property]) {
							propMatch = false;
						}
					});
					if (propMatch) {
						var indexOfMatchedModel = _this9.model.indexOf(model);
						if (_this9.model.splice(indexOfMatchedModel, 1)) {
							resolve({ message: _this9.singleModel + ' has been deleted' });
						} else {
							reject({ message: _this9.singleModel + ' could not be deleted' });
						}
					}
				});
				reject({ message: _this9.singleModel + ' not found, not action taken' });
			});

			return result;
		}
	}]);

	return DummyDataModel;
}();

exports.default = DummyDataModel;
//# sourceMappingURL=DummyDataModel.js.map