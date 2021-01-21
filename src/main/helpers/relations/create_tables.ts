import { connect } from '../../connection';

function create_tables (connectionString: string): void {
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

    CREATE TABLE IF NOT EXISTS todos (
      id serial NOT NULL PRIMARY KEY,
      title VARCHAR(70) NOT NULL UNIQUE,
      description VARCHAR(700),
      "userId" INT NOT NULL,
      deadline timestamp,
      links VARCHAR(700) [],
      completed BOOLEAN NOT NULL,
      "createdAt" date NOT NULL,
      "updatedAt" date NOT NULL
      );
  `;
  const result = client(queryString);
};

export default create_tables;
