
import logger from "../logger/winston.logger";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
/**
 *
 * @param {Error | ApiError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link asyncHandler}
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
  
    const statusCode = 400;

    // set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, (error as ApiError).errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    stack: error.stack, 
  };

  logger.error(`${error.message}`);

  return res.status((error as ApiError).statusCode).json(response);
};

export { errorHandler };
