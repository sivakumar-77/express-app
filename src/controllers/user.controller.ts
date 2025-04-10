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
    const pass = password;
    const hash = user.password;
    bcrypt.compare(pass, hash, function(err, result) {
        if(!result) {
            return res.status(401).json({
                success: false,
                message: "InCorrect password"
            });
        }
    });
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
})


export const registerUser = asyncHandler(async (req:Request, res:Response) => {
    const { email, password, username, role } = req.body; 
    const client = await getDBClient();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await client.query(`
        INSERT INTO users (email, username, password, role, created_at)
        VALUES ($1, $2, $3, $4, now())
        RETURNING *;
    `, [email, username, hashedPassword, role]);
    const user = result.rows[0];
    res.status(200).json({
        success: true,
        message: "User registered successfully",
        data: user
    });
})

export const getUserInfo = asyncHandler(async (req:AuthenticatedRequest, res:Response) => {
    try {
        const dbClient = await getDBClient();
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
    }
})
