"use strict";
exports.__esModule = true;
var create_1 = require("./methods/create");
var update_1 = require("./methods/update");
var find_1 = require("./methods/find");
var findById_1 = require("./methods/findById");
var findAll_1 = require("./methods/findAll");
var destroy_1 = require("./methods/destroy");
var clear_1 = require("./methods/clear");
var queryTypes_1 = require("./queryTypes");
var bulkCreate_1 = require("./methods/bulkCreate");
var DataModela = /** @class */ (function () {
    function DataModela(modelName, schema) {
        var _this = this;
        if (schema === void 0) { schema = {}; }
        this.allowedFields = [];
        this.uniqueKeys = [];
        this.requiredFields = [];
        this.model = [];
        this.supportedDataTypes = [
            'string',
            'char',
            'varchar',
            'number',
            'boolean',
            'array',
            'time',
            'date',
            'timestamp',
            'timestamptz',
            'bigint',
        ];
        this.create = create_1.create;
        this.createModel = create_1.createModel.bind(this);
        this.createModelWithDB = create_1.createModelWithDB.bind(this);
        this.bulkCreate = bulkCreate_1["default"].bind(this);
        this.createBulkItem = bulkCreate_1.createBulkItem.bind(this);
        this.createBulkItemWithDB = bulkCreate_1.createBulkItemWithDB.bind(this);
        this.update = update_1["default"].bind(this);
        this.findById = findById_1["default"].bind(this);
        this.find = find_1["default"].bind(this);
        this.findAll = findAll_1["default"].bind(this);
        this.destroy = destroy_1["default"].bind(this);
        this.clear = clear_1["default"].bind(this);
        this.dbConnection = null;
        this.using_db = 0;
        // db methods
        this.createQuery = queryTypes_1.createQuery.bind(this);
        this.getQuery = queryTypes_1.getQuery.bind(this);
        this.updateQuery = queryTypes_1.updateQuery.bind(this);
        this.deleteQuery = queryTypes_1.deleteQuery.bind(this);
        this.rawQuery = queryTypes_1.rawQuery.bind(this);
        this.createTableQuery = queryTypes_1.createTableQuery.bind(this);
        if (Object.prototype.toString.call(schema) !== '[object Object]') {
            return { typeError: 'expected argument 2 (schema) to be an object' };
        }
        if (parseInt(process.env.USE_DB) === 1) {
            this.dbConnection = null;
            this.using_db = 1;
        }
        ;
        this.modelName = modelName;
        this.singleModel = this.modelName.substring(0, this.modelName.length - 1);
        this.schema = schema;
        this.allowedFields = Object.keys(schema);
        this.uniqueKeys = [];
        this.requiredFields = [];
        this.model = [];
        this.allowedFields.forEach(function (field) {
            if (schema[field].required)
                return _this.requiredFields.push(field);
        });
        this.allowedFields.forEach(function (field) {
            if (schema[field].unique)
                return _this.uniqueKeys.push(field);
        });
        var unsupportedTypeField = this.allowedFields.find(function (field) {
            if (schema[field].dataType) {
                return !_this.supportedDataTypes.includes(schema[field].dataType);
            }
        });
        if (unsupportedTypeField) {
            throw ({
                message: "dataType " + schema[unsupportedTypeField].dataType + " in " + unsupportedTypeField + " is not supported",
                supportedDataTypes: this.supportedDataTypes
            });
        }
    }
    return DataModela;
}());
exports["default"] = DataModela;
