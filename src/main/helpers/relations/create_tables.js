import { connect } from '../../connection';

function create_tables (connectionString) {
  const client = connect(connectionString);
  const queryString = `
    CREATE TABLE users (
      ID SERIAL PRIMARY KEY,
      name VARCHAR(30) UNIQUE,
      email VARCHAR(30),
      address VARCHAR(30),
      "createdAt" date,
      "updatedAt" date
    );

    CREATE TABLE messages (
      ID SERIAL PRIMARY KEY,
      message VARCHAR(30),
      "createdAt" date,
      "updatedAt" date
    );
  `;
  const result = client(queryString);
};

export default create_tables;
