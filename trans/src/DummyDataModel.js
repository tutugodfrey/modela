"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DummyDataModel = function () {
	function DummyDataModel(modelName) {
		_classCallCheck(this, DummyDataModel);

		this.modelName = modelName;
		this.model = [];
	}

	// define class methods


	_createClass(DummyDataModel, [{
		key: "create",
		value: function create(modelToCreate) {
			var _this = this;

			// create a new model
			var result = new Promise(function (resolve, reject) {
				// check if data already exist
				if (_this.model.length === 0) {
					if (_this.model.push(modelToCreate)) {
						resolve(modelToCreate);
					};
					reject({ message: "Can not create " + modelName });
				} else {
					_this.model.forEach(function (model) {
						modelToCreate.map(function (property, value) {
							console.log("model " + value);
						});
					});
				}
			});
			return result;
		}
	}, {
		key: "update",
		value: function update(modelToUpdate) {
			// update the model 

		}
	}, {
		key: "findById",
		value: function findById(id) {
			// return an object with the given id

		}
	}, {
		key: "find",
		value: function find(condition) {
			var _this2 = this;

			// return the collections that meet the condition
			var result = new Promise(function (resolve, reject) {
				resolve(_this2.model);
				reject({ message: "Can not create " + _this2.model });
			});
			return result;
		}
	}, {
		key: "findAll",
		value: function findAll() {
			var _this3 = this;

			// return all the collection
			var result = new Promise(function (resolve, reject) {

				resolve(_this3.model);
				reject({ message: "Can not create " + _this3.model });
			});
			return result;
		}
	}, {
		key: "destroy",
		value: function destroy(id) {
			// delete an object from the collection

		}
	}]);

	return DummyDataModel;
}();

exports.default = DummyDataModel;
//# sourceMappingURL=DummyDataModel.js.map