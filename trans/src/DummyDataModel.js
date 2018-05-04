'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DummyDataModel = function () {
	function DummyDataModel(modelName) {
		_classCallCheck(this, DummyDataModel);

		this.modelName = modelName;
		this.singleModel = modelName.substring(0, modelName.length - 1);
		this.model = [];
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
		// define class methods

	}, {
		key: 'create',
		value: function create(modelToCreate) {
			var _this = this;

			// create a new model
			if (this.model.length === 0) {
				modelToCreate.id = 1;
			} else {
				var lastModel = this.model[this.model.length - 1];
				var lastModelId = this.getFields(lastModel, 'id');
				modelToCreate.id = lastModelId + 1;
			}
			var result = new Promise(function (resolve, reject) {
				if (_this.model.push(modelToCreate)) {
					resolve(modelToCreate);
				};
				reject({ message: 'Can not create ' + _this.singleModel });
			});
			return result;
		}
	}, {
		key: 'update',
		value: function update(modelToUpdate) {
			// update the model 

		}
	}, {
		key: 'findById',
		value: function findById(id) {
			var _this2 = this;

			// return an object with the given id
			var modelToFind = void 0;
			this.model.filter(function (model) {
				if (model.id === id) {
					modelToFind = model;
				}
			});
			var result = new Promise(function (resolve, reject) {
				if (modelToFind) {
					resolve(modelToFind);
				} else {
					reject({ error: _this2.singleModel + ' not found' });
				}
			});
			return result;
		}
	}, {
		key: 'find',
		value: function find(condition) {
			var _this3 = this;

			/* return a single object that meet the condition
   	condition is single object with property where whose value is further
   	an object with key => value pair of the properties of the object to find
   */
			var result = new Promise(function (resolve, reject) {
				if (!condition.where) {
					reject('missing object propertiy \'where\' to find model');
				} else {
					var props = Object.keys(condition.where);
					var propMatch = void 0;
					var searchResult = void 0;
					_this3.model.forEach(function (model) {
						propMatch = true;
						props.forEach(function (property) {
							if (condition.where[property] !== model[property]) {
								propMatch = false;
							}
						});
						if (propMatch) {
							searchResult = model;
							resolve(searchResult);
						}
					});
					if (!searchResult) {
						resolve({ messsage: 'No ' + _this3.singleModel + ' found' });
					}
				}
			});

			return result;
		}
	}, {
		key: 'findAll',
		value: function findAll() {
			var _this4 = this;

			var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

			/* return all objects that meet the condition 
   	condition is single object with property where whose value is further
   	an object with key => value pair of the properties of the object to find
   */
			var result = new Promise(function (resolve, reject) {
				if (condition === 'all') {
					// all model in this instance
					resolve(_this4.model);
				} else {
					// find model that meets the given condition
					var props = Object.keys(condition.where);

					// array of objects that meet the condition
					var searchResult = [];
					var propMatch = void 0;
					_this4.model.forEach(function (model) {
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
			var _this5 = this;

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
				_this5.model.forEach(function (model) {
					propMatch = true;
					props.forEach(function (property) {
						if (condition.where[property] !== model[property]) {
							propMatch = false;
						}
					});
					if (propMatch) {
						var indexOfMatchedModel = _this5.model.indexOf(model);
						if (_this5.model.splice(indexOfMatchedModel, 1)) {
							resolve({ message: _this5.singleModel + ' has been deleted' });
						} else {
							reject({ message: _this5.singleModel + ' could not be deleted' });
						}
					}
				});
				reject({ message: _this5.singleModel + ' not found, not action taken' });
			});

			return result;
		}
	}]);

	return DummyDataModel;
}();

exports.default = DummyDataModel;
//# sourceMappingURL=DummyDataModel.js.map