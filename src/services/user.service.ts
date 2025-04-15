import { getDBClient } from "../db/index";
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ApiError } from "../utils/ApiError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserCreateInput, UserUpdateInput } from "../types/user.types";

export class UserService {
  async create(userData: UserCreateInput): Promise<User> {
    const client = await getDBClient();
    
    try {
      // Check if user already exists
      const [existingUsers] = await client.query<RowDataPacket[]>(
        'SELECT email, username FROM users WHERE email = ? OR username = ?',
        [userData.email, userData.username]
      );
      
      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0] as { email: string; username: string };
        
        if (existingUser.email === userData.email) {
          throw new ApiError(409, "Email is already in use");
        }
        
        if (existingUser.username === userData.username) {
          throw new ApiError(409, "Username is already taken");
        }
        
        throw new ApiError(409, "User with this email or username already exists");
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Insert user
      const [result] = await client.query<ResultSetHeader>(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        [userData.username, userData.email, hashedPassword, userData.role || 'user']
      );
      
      // Get created user
      const [users] = await client.query<RowDataPacket[]>(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [result.insertId]
      );
      
      return users[0] as User;
    } finally {
      await client.release();
    }
  }
  
  async login(email: string, password: string): Promise<{ user: User, token: string }> {
    const client = await getDBClient();
    
    try {
      // Find user by email
      const [users] = await client.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        throw new ApiError(401, "Invalid email or password");
      }
      
      const user = users[0] as User;
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { ...user },
        process.env.ACCESS_TOKEN_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } finally {
      await client.release();
    }
  }
  
  async findById(id: number): Promise<User | null> {
    const client = await getDBClient();
    
    try {
      const [users] = await client.query<RowDataPacket[]>(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0] as User;
    } finally {
      await client.release();
    }
  }
  
  async findAll(): Promise<User[]> {
    const client = await getDBClient();
    
    try {
      const [users] = await client.query<RowDataPacket[]>(
        'SELECT id, username, email, role FROM users'
      );
      
      return users as User[];
    } finally {
      await client.release();
    }
  }
  
  async update(id: number, userData: UserUpdateInput): Promise<User | null> {
    const client = await getDBClient();
    
    try {
      // Check if user exists
      const user = await this.findById(id);
      if (!user) {
        return null;
      }
      
      // Update user
      const updateFields = [];
      const updateValues = [];
      
      if (userData.username) {
        updateFields.push('username = ?');
        updateValues.push(userData.username);
      }
      
      if (userData.email) {
        updateFields.push('email = ?');
        updateValues.push(userData.email);
      }
      
      if (updateFields.length === 0) {
        return user;
      }
      
      await client.query(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...updateValues, id]
      );
      
      // Get updated user
      return await this.findById(id);
    } finally {
      await client.release();
    }
  }
  
  async delete(id: number): Promise<boolean> {
    const client = await getDBClient();
    
    try {
      const [result] = await client.query<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      await client.release();
    }
  }
  
  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const client = await getDBClient();
    
    try {
      // Get user with password
      const [users] = await client.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return false;
      }
      
      const user = users[0] as User;
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isPasswordValid) {
        throw new ApiError(400, "Current password is incorrect");
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      const [result] = await client.query<ResultSetHeader>(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } finally {
      await client.release();
    }
  }
}