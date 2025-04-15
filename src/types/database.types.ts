import { PoolOptions } from 'mysql2/promise';

export interface IDBConfig extends PoolOptions {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}