import rateLimit from "express-rate-limit";


/**
 * @rateLimit - BLOCK IP if more than 2000 Request in 10min
 */

const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 10, 
    message: 'Too many requests from this IP, please try again later. error from service',  
  });

   

export default rateLimiter;