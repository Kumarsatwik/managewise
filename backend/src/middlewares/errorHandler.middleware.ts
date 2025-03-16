import { ErrorRequestHandler, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/appError";
import { z, ZodError } from "zod";
import { ErrorCodeEnum } from "../enums/errorcode.enum";

const formatZodError = (res: Response, err: z.ZodError): any => {
  const errors = err?.issues?.map((issue) => {
    return {
      field: issue.path.join("."),
      message: issue.message,
    };
  });

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation Error",
    error: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.error("Error Occured on PATH:", req.path, " Error ", err);

  if (err instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON format. Please check your request",
      error: err?.message,
    });
  }
  if (err instanceof ZodError) {
    console.log("ZodError", err);
    return formatZodError(res, err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err?.message,
    });
  }

  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    error: err?.message || "Unknown error occured",
  });
};
