import pg from 'pg';
const { Client } = pg
 
let dbClient: pg.Client; 

export async function getDBClient() {
  if (!dbClient) {
    dbClient = new Client({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,  
      database: process.env.DB_NAME || 'postgres',
    });
    await dbClient.connect();
    return dbClient;
  }
  return dbClient;
}
