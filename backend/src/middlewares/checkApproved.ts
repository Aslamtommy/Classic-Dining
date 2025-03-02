import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/HttpStatus';
import { sendError } from '../utils/responseUtils';
import { MessageConstants } from '../constants/MessageConstants';
import RestaurentModel from '../models/Restaurent/restaurentModel';

interface AuthenticatedRequest extends Request {
  data?: any;  
}

export const checkApproved = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
 
    if (!req.data) {
      return sendError(res, HttpStatus.Unauthorized, "User not authenticated");
    }

    
    const email = req.data.email;

 
    const user = await RestaurentModel.findOne({ email }).exec();

    if (!user) {
      return sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
  
    // Check if the user is blocked
    if (user.isBlocked) {
      return sendError(res, HttpStatus.Forbidden, MessageConstants.RESTAURENT_APPROVAL_REQUIRED);
    }

    // Attach the user to the request object for further use
    req.data = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    console.error('Error in checkApproved middleware:', error);
    return sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
  }
};