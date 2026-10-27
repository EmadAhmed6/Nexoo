import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error("Internal Server Error caught:", err);
  return res.status(statusCode).json({ message: err.message });
};

const sendError = (res: Response, statusCode: number, errorMessage: string) => {
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

const successMsg = (
  res: Response,
  statusCode: number,
  successMessage: string,
  data: any,
) => {
  return res
    .status(statusCode)
    .json({ success: true, message: successMessage, data });
};

export { notFound, errorHandler, sendError, successMsg };
