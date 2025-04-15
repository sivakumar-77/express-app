import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IAuthRequest } from "../types/request.types";
export const verifyJWT = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});



