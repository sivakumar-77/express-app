export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}