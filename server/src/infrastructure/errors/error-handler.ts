import { Request, Response, NextFunction } from 'express';
import { NotFoundError, BadRequestError, AuthorizeError, APIError } from './errors';
import { logger } from '../logger';


type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const ErrorHandler = async (error:Error,req:Request,res:Response,next:NextFunction) =>{
    const knownErrors = [NotFoundError, BadRequestError, AuthorizeError, APIError];
    let status = 500;
    let logLevel: LogLevel = 'error';
    let message = 'Internal Server Error';


    knownErrors.forEach((ErrorClass) => {
        if (error instanceof ErrorClass) {
            status = error.status;
            message = error.message;
            logLevel = 'warn';
        }
    });

    /**
     * This will be doing error log when an api error occured
     */
    if(status == 500){
        logger[logLevel]({
            message: error.message,
            // stack: error.stack,
            route: req.path,
            method: req.method,
            ip: req.ip,
            status,
        });    

        const errorPayload = {
        timestamp: new Date().toISOString(),
        error: error?.message,
        stack: error?.stack,
        route: req?.path,
        method: req?.method,
        //Replace dummy URL in errorPath with the actual URL.
        errorPath: `${req?.protocol}://${req.get('host')}/template${req?.originalUrl}`, 
        ip: req?.ip,
        status,
    }
    
    }
    



    res.status(status).json({
        status,
        message
    });

}

export const HandleUnCaughtException = async (error: Error) => {
    logger.error({
        message: error.message,
        stack: error.stack,
    });
    process.exit(1);
};