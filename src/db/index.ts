import pg from 'pg';
const { Pool } = pg
 
let dbPool: pg.Pool; 

export async function getDBClient() {
  if (!dbPool) {
    dbPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,  
      database: process.env.DB_NAME || 'postgres',
      max: 5, // max number of clients in the pool
      application_name: "user_auth_app",
      connectionTimeoutMillis: 5000, // max 5 seconds to wait connection to be established
      idleTimeoutMillis: 3000,  // max 3 seconds to keep a client ideally connected
    });
    const dbClient = await dbPool.connect();
    return dbClient;
  }
  const dbClient = await dbPool.connect();
  return dbClient;
}
