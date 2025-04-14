import { asyncHandler } from "../utils/asyncHandler"
import { getDBClient } from "../db/index"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
const saltRounds = 10;

export const loginUser = asyncHandler(async (req: Request, res:Response) => {
    const { email, password } = req.body;
    const client = await getDBClient();
    try {
        const result = await client.query(`
            SELECT * FROM users WHERE email = $1;
        `, [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }
        const token = jwt.sign({
            user
        }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: 60 * 60 }); // 1hr validity
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                token
            }
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Something went wrong " + error.message,
        })
    } finally {
        await client.release();
    }
    
})


export const registerUser = asyncHandler(async (req:Request, res:Response) => {
    const { email, password, username, role } = req.body; 
    const client = await getDBClient();
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await client.query(`
            INSERT INTO users (email, username, password, role, created_at)
            VALUES ($1, $2, $3, $4, now())
            RETURNING *;
        `, [email, username, hashedPassword, role]);
        const user = result.rows[0];
        delete user.password;
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error: any) {
        if (error.code === '23505') {
            let message = "Duplicate key";
            if (error.constraint === 'users_email_key') {
                message = "Email is already in use";
            } else if (error.constraint === 'users_username_key') {
                message = "Username is already taken";
            }
    
            return res.status(409).json({
                success: false,
                message
            });
        }
        throw error; // it will handle by error middleware
    } finally {
        await client.release();
    }  
    
})

export const getUserInfo = asyncHandler(async (req:AuthenticatedRequest, res:Response) => {
    const dbClient = await getDBClient();
    try {
        const result = await dbClient.query(`SELECT id, username, email, role FROM USERS WHERE id = $1;`, [req.user.id]);
        const user = result.rows;

        return res.status(200).json({
            success: true,
            message: "User info retrieved successfully",
            data: {
                user: user
            }
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    } finally {
        await dbClient.release();
    }
})
