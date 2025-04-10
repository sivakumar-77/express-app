import { Request, Response, NextFunction } from 'express';

/**
 *
 * @param {(req: import("express").Request, res:import("express").Response, next:import("express").NextFunction) => void} requestHandler
 */
const asyncHandler = (requestHandler:Function) => {
    return (req: Request<Record<string, any> | undefined, any, any, Record<string, any>>, res: Response, next: NextFunction) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
export { asyncHandler };
  