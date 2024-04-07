import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  // database: "postgres",
  database: "tent_admin",
  //password: process.env.DB_PASSWORD, // Use the correct environment variable
  password: "12477560Tt",
  port: 5432,
});

export default pool;