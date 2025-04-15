export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
}

export interface UserLoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}