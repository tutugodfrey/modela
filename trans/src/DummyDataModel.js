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

    _classCallCheck(this, DummyDataModel);

    this.modelName = modelName;
    this.uniqueKeys = uniqueKeys;
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
      var result = new Promise(function (resolve, reject) {
        if (_this.model.length === 0) {
          modelToCreate.id = 1;
          if (_this.model.push(modelToCreate)) {
            resolve(modelToCreate);
          }
          reject({ message: 'Can not create ' + _this.singleModel });
        } else {
          var lastModel = _this.model[_this.model.length - 1];
          var lastModelId = _this.getFields(lastModel, 'id');
          // verify uniqueKeys
          if (_this.uniqueKeys.length === 0) {
            if (_this.model.push(modelToCreate)) {
              resolve(modelToCreate);
            }
            reject({ message: 'Can not create ' + _this.singleModel });
          } else {
            var foundDuplicate = false;
            _this.model.forEach(function (model) {
              _this.uniqueKeys.forEach(function (prop) {
                if (model[prop] === modelToCreate[prop]) {
                  foundDuplicate = true;
                  reject({ message: 'duplicate entry for unique key' });
                }
              });
            });
            if (!foundDuplicate) {
              modelToCreate.id = lastModelId + 1;
              if (_this.model.push(modelToCreate)) {
                resolve(modelToCreate);
              }
              reject({ message: 'Can not create ' + _this.singleModel });
            }
          }
        }
      });
      return result;
    }
  }, {
    key: 'update',
    value: function update(modelToUpdate, propsToUpdate) {
      var _this2 = this;

      /*
      propsToUpdate contain the new properties to replace the old ones
      this method should be called on the particular object to update.
      which means that before call update you must use the finder methods to
      get the particular object.
      */
      var result = new Promise(function (resolve, reject) {
        if ((typeof propsToUpdate === 'undefined' ? 'undefined' : _typeof(propsToUpdate)) === 'object' && (typeof modelToUpdate === 'undefined' ? 'undefined' : _typeof(modelToUpdate)) === 'object') {
          var props = Object.keys(propsToUpdate);
          _this2.model.forEach(function (model) {
            if (modelToUpdate.id === model.id) {
              var wrongModel = false;
              if (_this2.uniqueKeys.length !== 0) {
                _this2.uniqueKeys.forEach(function (prop) {
                  if (modelToUpdate[prop] !== model[prop]) {
                    wrongModel = true;
                    reject({ message: _this2.singleModel + ' not found' });
                  }
                });
              }
              if (!wrongModel) {
                var indexOfModel = _this2.model.indexOf(model);
                props.forEach(function (property) {
                  model[property] = propsToUpdate[property];
                });
                _this2.model[indexOfModel] = model;
                resolve(model);
              }
            } //else {
            // reject({ message: `${this.singleModel} not found` });
            // }
          });
        } else {
          reject({ message: 'invalid argument passed to update! expects argument1 and argument2 to be objects' });
        }
      });
      return result;
    }
  }, {
    key: 'findById',
    value: function findById(id) {
      var _this3 = this;

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
          reject({ error: _this3.singleModel + ' not found' });
        }
      });
      return result;
    }
  }, {
    key: 'find',
    value: function find(condition) {
      var _this4 = this;

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
          _this4.model.forEach(function (model) {
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
            reject({ message: _this4.singleModel + ' not found' });
          }
        }
      });

      return result;
    }
  }, {
    key: 'findAll',
    value: function findAll() {
      var _this5 = this;

      var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

      /* return all objects that meet the condition
      condition is single object with property where whose value is further
      an object with key => value pair of the properties of the object to find
      */
      var result = new Promise(function (resolve, reject) {
        if (condition === 'all') {
          // all model in this instance
          resolve(_this5.model);
        } else {
          // find model that meets the given condition
          var props = Object.keys(condition.where);

          // array of objects that meet the condition
          var searchResult = [];
          var propMatch = void 0;
          _this5.model.forEach(function (model) {
            propMatch = true;
            props.forEach(function (property) {
              if (condition.where[property] !== model[property]) {
                propMatch = false;
              }
            });
            if (propMatch) {
              searchResult.push(model);
            }
          });
          if (searchResult) {
            resolve(searchResult);
          } else {
            resolve(searchResult);
          }
        }
      });
      return result;
    }
  }, {
    key: 'destroy',
    value: function destroy(condition) {
      var _this6 = this;

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
        _this6.model.forEach(function (model) {
          propMatch = true;
          props.forEach(function (property) {
            if (condition.where[property] !== model[property]) {
              propMatch = false;
            }
          });
          if (propMatch) {
            var indexOfMatchedModel = _this6.model.indexOf(model);
            if (_this6.model.splice(indexOfMatchedModel, 1)) {
              resolve({ message: _this6.singleModel + ' has been deleted' });
            } else {
              reject({ message: _this6.singleModel + ' could not be deleted' });
            }
          }
        });
        reject({ message: _this6.singleModel + ' not found, not action taken' });
      });

      return result;
    }
  }]);

  return DummyDataModel;
}();

exports.default = DummyDataModel;
//# sourceMappingURL=DummyDataModel.js.map