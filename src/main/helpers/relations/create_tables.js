"use strict";
exports.__esModule = true;
var connection_1 = require("../../connection");
function create_tables(connectionString) {
    var client = connection_1.connect(connectionString);
    var queryString = "\n    CREATE TABLE users (\n      ID SERIAL PRIMARY KEY,\n      name VARCHAR(30) UNIQUE,\n      email VARCHAR(30),\n      address VARCHAR(30),\n      \"createdAt\" date,\n      \"updatedAt\" date\n    );\n\n    CREATE TABLE messages (\n      ID SERIAL PRIMARY KEY,\n      message VARCHAR(30),\n      \"createdAt\" date,\n      \"updatedAt\" date\n    );\n\n    CREATE TABLE IF NOT EXISTS todos (\n      id serial NOT NULL PRIMARY KEY,\n      title VARCHAR(70) NOT NULL UNIQUE,\n      description VARCHAR(700),\n      \"userId\" INT NOT NULL,\n      deadline timestamp,\n      links VARCHAR(700) [],\n      completed BOOLEAN NOT NULL,\n      \"createdAt\" date NOT NULL,\n      \"updatedAt\" date NOT NULL\n      );\n  ";
    var result = client(queryString);
}
;
exports["default"] = create_tables;
