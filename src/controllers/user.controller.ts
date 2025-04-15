import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserService } from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { IAuthRequest } from "../types/request.types";

const userService = new UserService();

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, role = "user" } = req.body;

  const user = await userService.create({
    username,
    email,
    password,
    role
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { token } = await userService.login(email, password);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      token
    }
  });
});

export const getUserInfo = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const userId = req.user.id;

  const user = await userService.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});