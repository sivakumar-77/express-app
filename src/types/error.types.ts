export interface IErrorResponse {
  statusCode: number;
  message: string;
  errors?: Array<string>;
  stack?: string;
}