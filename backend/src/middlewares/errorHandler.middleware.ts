import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/appError";

export const errorHandler:ErrorRequestHandler = (err,req,res,next):any=>{
    
    console.error("Error Occured on PATH:",req.path," Error ",err)

    if(err instanceof SyntaxError){
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message:"Invalid JSON format. Please check your request",
            error:err?.message
        })
    }

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message:err.message,
            error:err?.message
        })
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message:"Internal server error",
        error:err?.message || "Unknown error occured"
    })
}