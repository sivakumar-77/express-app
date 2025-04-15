import { Request } from 'express';
import { IUser } from './user.types';

export interface IAuthRequest extends Request {
  user: IUser;
}

export interface IQueryResult<T> {
  rows: T[];
  fields: any;
}