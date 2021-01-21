"use strict";
exports.__esModule = true;
exports.connect = void 0;
var pg_1 = require("pg");
var pool;
var connect = function (connectionString, models) {
    if (models === void 0) { models = []; }
    if (!connectionString)
        return 'No connection string provided! Please provide database connection string to connect.';
    try {
        pool = new pg_1.Pool({
            connectionString: connectionString
        });
    }
    catch (err) {
        console.log(err);
        throw 'Could not connect to database! Please check you connection string and confirm the database is running';
    }
    if (models.length) {
        models.forEach(function (model) { return model.dbConnection = pool; });
    }
    return pool;
};
exports.connect = connect;
