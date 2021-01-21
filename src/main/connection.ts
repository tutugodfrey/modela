import { Pool } from 'pg';

let pool: any;
const connect = (connectionString: string, models=[]) => {
  if (!connectionString) return 'No connection string provided! Please provide database connection string to connect.';
  try {
    pool = new Pool({
      connectionString,
    });
  } catch (err) {
    console.log(err)
    throw 'Could not connect to database! Please check you connection string and confirm the database is running';
  }

  if (models.length) {
    models.forEach(model => model.dbConnection = pool);
  }
  return pool;
}

// export default pool;
export {
  connect,
};
