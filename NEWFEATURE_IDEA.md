# Doucment Ideas for new features to be include

* Add feature to include range of allowed fields in model creation

## Issues

`bulkCreate` method does not return updatedAt and CreatedAt fields when creating models

`findAll`: return fields for findAll is not functional when condition is `all`

`findAll`: Unhandled error when an empty object {} is pass in as argument.

`findAll`: where {} without specific condition is functional, shouldn't be so.

`db_connection` Rename the variable to `dbConnection` DataModela.js, other places where it occur

`Update`: Investigate lines 46 - 53 of `methods/queryTypes/update.js`. Where cluase should support `or` type. Use the value of the `type` property to control how where clause is genereated the default should be `AND`

`get` In the `/methods/queryTypes/get.js` update and add support for `groups`


